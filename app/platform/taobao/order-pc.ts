/*
 * @Author: oudingyin
 * @Date: 2019-08-26 09:17:48
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-18 23:41:11
 */
import {
  delay,
  Serial,
  throwError,
  TimerCondition
} from "../../../utils/tools";
import setting from "./setting";
import { logFile, getItemId } from "./tools";
import { ArgBuyDirect, ArgOrder } from "../struct";
import { config } from "../../common/config";
import moment = require("moment");
import { getGoodsInfo, getStock } from "./goods-pc";
import iconv = require("iconv-lite");
import { newPage } from "../../../utils/page";
const { taobao } = require("../../../.data/user.json");

export class TaobaoOrderPc {
  @TimerCondition(0)
  async waitForStock(
    args: {
      skuId?: string;
      id: string;
      quantity: number;
      url: string;
    },
    duration: number
  ): Promise<any> {
    var quantity = await getStock(args);
    return {
      success: quantity >= args.quantity
    };
  }
  prev_id = ''
  async buyDirect(arg: ArgBuyDirect, p?: Promise<void>) {
    var { itemDO, tradeConfig, tradeType, form, detail } = await getGoodsInfo(
      arg.url,
      true
    );
    if (this.prev_id === itemDO.itemId) {
      throwError('重复下单')
    }
    this.prev_id = itemDO.itemId
    Object.assign(form, {
      quantity: arg.quantity
    });
    if (!p && !itemDO.isOnline) {
      throwError("商品已下架");
    }
    if (p) {
      await p;
    }
    try {
      var type = "tmall";
      var addr_url = "https:";
      if (form.etm === "") {
        if (detail.isHkItem) {
          addr_url += tradeConfig[tradeType];
        } else {
          addr_url += tradeConfig[1];
          type = "taobao";
        }
      } else {
        addr_url += tradeConfig[2];
      }
      if (arg.jianlou) {
        this.waitForStock(
          {
            id: getItemId(arg.url),
            quantity: arg.quantity,
            skuId: form.skuId,
            url: arg.url
          },
          arg.jianlou
        ).then(() =>
          this.submitOrder(
            Object.assign(
              {
                data: {
                  form,
                  addr_url,
                  Referer: arg.url
                },
                other: {}
              },
              arg
            ),
            type
          )
        );
        return "正在捡漏中";
      }
      return this.submitOrder(
        Object.assign(
          {
            data: {
              form,
              addr_url,
              Referer: arg.url
            },
            other: {}
          },
          arg
        ),
        type
      );
      /* var ret = await this.req.post("https:" + tradeConfig[2], {
        form,
        qs: qs_data
      }); */
    } catch (e) {
      console.error("订单提交出错", e);
    }
  }

  async cartBuy(
    args: {
      items: {
        sellerId: string;
        cartId: string;
        skuId: string;
        itemId: string;
        quantity: number;
        createTime: string;
        attr: string;
        toBuy: string;
      }[];
      from_browser?: boolean;
    },
    p?: Promise<void>
  ) {
    var goods = args.items;
    var cartIdStr = goods.map(({ cartId }) => cartId).join(",");
    var sellerIdStr = [...new Set(goods.map(({ sellerId }) => sellerId))].join(
      ","
    );
    var items = goods.map(
      ({ cartId, itemId, skuId, quantity, createTime, attr }) => ({
        cartId,
        itemId,
        skuId,
        quantity,
        createTime,
        attr
      })
    );
    delete args.items;
    var data: any;
    var type = "";
    if (goods[0].toBuy === "taobao") {
      type = "taobao";
      data = {
        form: {
          // 1477911576836_599254259447_1_0_3099613854_0_0_0_buyerCondition~0~~dpbUpgrade~null~~cartCreateTime~1567339151000_{"attributes":{"itemExtra":"{}"}}_0
          // 1475854274052_571869707416_1_0_2219509495_0_0_0_buyerCondition~0~~dpbUpgrade~null~~cartCreateTime~1567176717000_{"attributes":{"itemExtra":"{}"}}_0
          item: goods
            .map(
              item =>
                `${item.cartId}_${item.itemId}_${item.quantity}_0_${item.sellerId}_0_0_0_buyerCondition~0~~dpbUpgrade~null~~cartCreateTime~${item.createTime}_{"attributes":{"itemExtra":"{}"}}_0`
            )
            .join(","),
          buyer_from: "cart",
          source_time: Date.now()
        },
        addr_url: `https://buy.taobao.com/auction/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined`,
        Referer: `https://cart.taobao.com/cart.htm?spm=a220o.1000855.a2226mz.12.5ada2389fIdDSp&from=btop`
      };
    } else {
      type = "tmall";
      data = {
        form: {
          hex: "n",
          cartId: cartIdStr,
          sellerid: sellerIdStr,
          cart_param: JSON.stringify({
            items
          }),
          unbalance: "",
          delCartIds: cartIdStr,
          use_cod: false,
          buyer_from: "cart",
          page_from: "cart",
          source_time: Date.now()
        },
        addr_url: `https://buy.tmall.com/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined`,
        Referer: `https://cart.taobao.com/cart.htm?spm=a220o.1000855.a2226mz.12.5ada2389fIdDSp&from=btop`
      };
    }
    if (args.from_browser) {
      return this.submitOrderFromBrowser(
        {
          data,
          other: {},
          ...args
        },
        type,
        p
      );
    }
    if (p) {
      await p;
    }
    return this.submitOrder(
      {
        data,
        other: {},
        ...args
      },
      type
    );
  }
  @Serial(0)
  async submitOrder(
    args: ArgOrder<{
      form: Record<string, any>;
      addr_url: string;
      Referer: string;
    }>,
    type: string,
    retryCount = 0
  ): Promise<any> {
    var {
      data: { form, addr_url, Referer }
    } = args;
    console.log("准备进入订单结算页");
    logFile(addr_url + "\n" + JSON.stringify(form), "pc-准备进入订单结算页");
    var start_time = Date.now();
    var html: string = await setting.req.post(addr_url, {
      form,
      headers: {
        Referer
      }
    });
    var time_diff = Date.now() - start_time;
    if (html.lastIndexOf("security-X5", html.indexOf("</title>")) > -1) {
      let msg = "进入订单结算页碰到验证拦截";
      console.log(`-------${msg}--------`);
      logFile(html, "pc-订单提交验证拦截");
      throwError(msg);
    }
    console.log("进入订单结算页用时：" + time_diff);
    logFile(addr_url + "\n" + html, "pc-订单结算页", ".html");
    var text = /var orderData\s*=(.*);/.exec(html)![1];
    var {
      endpoint,
      data,
      linkage,
      hierarchy: { structure }
    }: {
      endpoint: {
        mode: string;
        osVersion: string;
        protocolVersion: string;
        ultronage: string;
      };
      data: Record<
        string,
        {
          submit: boolean;
          tag: string;
          fields: any;
        }
      > & {
        confirmOrder_1: {
          fields: {
            pcSubmitUrl: string;
            secretValue: string;
            sparam1: string;
            sparam2: string;
            sourceTime: string;
          };
        };
        submitOrderPC_1: {
          hidden: {
            extensionMap: {
              action: string;
              event_submit_do_confirm: string;
              input_charset: string;
              pcSubmitUrl: string;
              secretKey: string;
              secretValue: string;
              sparam1: string;
              sparam2?: string;
              unitSuffix: string;
            };
          };
        };
        realPayPC_1: {
          fields: {
            price: string;
          };
          hidden: {
            extensionMap: {
              timestamp: string;
            };
          };
        };
      };
      linkage: {
        common: {
          compress: boolean;
          queryParams: string;
          submitParams: string;
          validateParams: string;
        };
        signature: string;
        input?: string[];
      };
      hierarchy: {
        structure: Record<string, string[]>;
      };
    } = JSON.parse(text);
    console.log("-----进入订单结算页，准备提交订单----");
    var { confirmOrder_1, submitOrderPC_1, realPayPC_1 } = data;
    var formData: any;
    var qs_data: any;
    var submit_url: string;
    /* console.log(args.noinvalid);
    if (args.noinvalid && structure.invalidGroup_2) {
      throwError("存在无效商品");
    } */
    if (!linkage.input) {
      throwError("存在无效商品");
    }
    if (!submitOrderPC_1) {
      if (
        args.seckill &&
        retryCount === 0 &&
        confirmOrder_1.fields.sourceTime
      ) {
        let t = moment(+confirmOrder_1.fields.sourceTime);
        let _s = t.second();
        if (_s < 59 && _s > 55) {
          let t_str = t.valueOf().toString();
          let m = t_str.length - 4;
          let delay_time = 10000 - Number(t_str.substring(m));
          delay(delay_time - time_diff).then(() =>
            this.submitOrder(args, type, retryCount + 1)
          );
          return;
        }
      }
      let ua_log =
        "119#MlKA70vEMnDyqMMzZR0mfhNqsAOCc0zzNoYqOxPXiX8rOLMlRvBsQHACBLnD7HNkVW6u+TJDO2dsHEKw83cWa2lUDbCsSUkGMZA8RJBONt8LfoHMRPPe3FN8fHhS4Q9LdeNMR2VVNlsCqwMJqQPOutK6fusG4lhLPGg1RJ+q+NFGf/VwKSqj+EAL9eVH4QyG2eALRJE+EE387nASRVTmHNA6h2+S4lca0rA87PjVNN3Mxe3RaB0U3FNcQ1hzcDbL3e3My2I3TAFGfoZEh/loEEAL9weXLl9Lt1ELKlGv86GGMaASRBSUWLNN2I75eGcR3oALR2V48iVNNJd6+7hSzsyTgYCQM6ILf9lNDKDMyaD6cQ9YCYbCuYUcuuFM5yEg02+qaowfKLyxBXU8Ft9A4ia4LltAFPd5qdtAcnn8R7ho4LbVKKgB53QfxeC/hIJxtmKJZd2VBm5lz/LN09il3DbBKeaRMc/J1eugCy8Kb5lyXIoB3cfAkvUQjSDL5n4ubXZdBj4MiYX2BOsZRSfmWR8hVf5yn53hSaCZTLHKt7FbC9ZydWY1AB8+IFCJ8Qh2z9vM3TX/7pzXKH6MJcjYR8YntN9rmxnMKSOr/5hyWOGahQLHimcEeBmyWCbwLD6v6OOjualjPSwjk9VCx/yX2GAI4QJJ8bq3XA4b9z1AfjWmSe8/iedwoUahD6NT5zB3M0tAqy0vMv65kYVzj9Mvr/RimM2FHuErzYj9IjC0JJOFgnEYuAnMrRUvdLZjWqlyrIus3RbKuEM5E++wjfaqXGWRQny9BCGg+hJJIilFDyuuF3EitezdHX8mWypJ6e+MjAkDwq8Q7LIo5cANFZSQF3qpJun7d671jsKQLSuFgNPISBEAQWAy7+ZM3Y+biHaMRCXlYnMbY0EI";
      formData = [
        "_tb_token_",
        "action",
        "event_submit_do_confirm",
        "input_charset",
        // "praper_alipay_cashier_domain",
        "authYiYao",
        "authHealth",
        "F_nick"
      ].reduce(
        (state: any, name) => {
          var arr = new RegExp(
            `name=['"]${name}['"].*? value=['"](.*?)['"]`
          ).exec(html);
          if (arr) {
            state[name] = arr![1];
          }
          return state;
        },
        {
          praper_alipay_cashier_domain: "cashierstl",
          hierarchy: JSON.stringify({
            structure
          }),
          data: iconv
            .encode(
              JSON.stringify(
                Object.keys(data).reduce((state: any, name) => {
                  var item = data[name];
                  if (item.submit) {
                    if (item.tag === "submitOrder") {
                      if (item.fields) {
                        if (ua_log) {
                          item.fields.ua = ua_log;
                        }
                      }
                    } else if (item.tag === "eticketDesc") {
                      item.fields.value = taobao.mobile;
                    }
                    state[name] = item;
                  }
                  return state;
                }, {})
              ),
              "gbk"
            )
            .toString(),
          linkage: JSON.stringify({
            common: linkage.common,
            signature: linkage.signature
          })
        }
      );
      qs_data = {
        spm: `a220l.1.a22016.d011001001001.undefined`,
        submitref: confirmOrder_1.fields.secretValue,
        sparam1: confirmOrder_1.fields.sparam1,
        sparam2: confirmOrder_1.fields.sparam2
      };
      submit_url = `https://buy.taobao.com${confirmOrder_1.fields.pcSubmitUrl ||
        /var submitURL="([^"]+)/.exec(html)![1]}`;
    } else {
      if (
        args.seckill &&
        retryCount === 0 &&
        realPayPC_1.hidden.extensionMap.timestamp
      ) {
        let t = moment(+realPayPC_1.hidden.extensionMap.timestamp);
        let _s = t.second();
        if (_s < 59 && _s > 55) {
          let t_str = t.valueOf().toString();
          let m = t_str.length - 4;
          let delay_time = 10000 - Number(t_str.substring(m));
          console.log("来早了，重试中...");
          delay(delay_time - time_diff).then(() =>
            this.submitOrder(args, type, retryCount + 1)
          );
          return;
        }
      }
      if (linkage.input)
        if (typeof args.expectedPrice !== "undefined") {
          if (+realPayPC_1.fields.price > +args.expectedPrice) {
            throwError(
              `太贵了，期望价格:${args.expectedPrice}, 实际价格：${realPayPC_1.fields.price}`
            );
          }
        }
      delete linkage.common.queryParams;
      submit_url = `https://buy.tmall.com${submitOrderPC_1.hidden.extensionMap.pcSubmitUrl}`;
      qs_data = {
        spm: `a220l.1.a22016.d011001001001.undefined`,
        submitref: submitOrderPC_1.hidden.extensionMap.secretValue,
        sparam1: submitOrderPC_1.hidden.extensionMap.sparam1,
        sparam2: submitOrderPC_1.hidden.extensionMap.sparam2
      };
      formData = {
        input_charset: submitOrderPC_1.hidden.extensionMap.input_charset,
        event_submit_do_confirm:
          submitOrderPC_1.hidden.extensionMap.event_submit_do_confirm,
        action: submitOrderPC_1.hidden.extensionMap.action,
        praper_alipay_cashier_domain: "cashierstl",
        _tb_token_: /name=['"]_tb_token_['"].*? value=['"](.*?)['"]/.exec(
          html
        )![1],
        endpoint: encodeURIComponent(JSON.stringify(endpoint)),
        hierarchy: encodeURIComponent(
          JSON.stringify({
            structure
          })
        ),
        linkage: encodeURIComponent(
          JSON.stringify({
            common: linkage.common,
            signature: linkage.signature
          })
        ),
        data: encodeURIComponent(
          JSON.stringify(
            Object.keys(data).reduce((state: any, name) => {
              var item = data[name];
              if (item.submit) {
                /* if (item.tag === "submitOrder") {
                        if (item.fields) {
                          if (ua_log) {
                            item.fields.ua = ua_log;
                          }
                        }
                      } */
                if (item.tag === "eticketDesc") {
                  item.fields.value = taobao.mobile;
                } else if (item.tag === "itemInfoPC") {
                  let { priceInfo, quantity } = item.fields;
                  if (quantity) {
                    priceInfo.valueStyles.bold = true;
                    quantity.min = +quantity.min;
                    quantity.quantity = +quantity.quantity;
                    quantity.step = +quantity.step;
                    quantity.max = +quantity.max;
                  }
                }
                state[name] = item;
              }
              return state;
            }, {})
          )
        )
      };
    }
    // var ua_log =
    //   "119#MlKA70vEMnDyqMMzZR0mfhNqsAOCc0zzNoYqOxPXiX8rOLMlRvBsQHACBLnD7HNkVW6u+TJDO2dsHEKw83cWa2lUDbCsSUkGMZA8RJBONt8LfoHMRPPe3FN8fHhS4Q9LdeNMR2VVNlsCqwMJqQPOutK6fusG4lhLPGg1RJ+q+NFGf/VwKSqj+EAL9eVH4QyG2eALRJE+EE387nASRVTmHNA6h2+S4lca0rA87PjVNN3Mxe3RaB0U3FNcQ1hzcDbL3e3My2I3TAFGfoZEh/loEEAL9weXLl9Lt1ELKlGv86GGMaASRBSUWLNN2I75eGcR3oALR2V48iVNNJd6+7hSzsyTgYCQM6ILf9lNDKDMyaD6cQ9YCYbCuYUcuuFM5yEg02+qaowfKLyxBXU8Ft9A4ia4LltAFPd5qdtAcnn8R7ho4LbVKKgB53QfxeC/hIJxtmKJZd2VBm5lz/LN09il3DbBKeaRMc/J1eugCy8Kb5lyXIoB3cfAkvUQjSDL5n4ubXZdBj4MiYX2BOsZRSfmWR8hVf5yn53hSaCZTLHKt7FbC9ZydWY1AB8+IFCJ8Qh2z9vM3TX/7pzXKH6MJcjYR8YntN9rmxnMKSOr/5hyWOGahQLHimcEeBmyWCbwLD6v6OOjualjPSwjk9VCx/yX2GAI4QJJ8bq3XA4b9z1AfjWmSe8/iedwoUahD6NT5zB3M0tAqy0vMv65kYVzj9Mvr/RimM2FHuErzYj9IjC0JJOFgnEYuAnMrRUvdLZjWqlyrIus3RbKuEM5E++wjfaqXGWRQny9BCGg+hJJIilFDyuuF3EitezdHX8mWypJ6e+MjAkDwq8Q7LIo5cANFZSQF3qpJun7d671jsKQLSuFgNPISBEAQWAy7+ZM3Y+biHaMRCXlYnMbY0EI";

    if (!config.isSubmitOrder) {
      return;
    }
    (async () => {
      try {
        await delay(Math.min(1200 - time_diff, 750));
        let p = setting.req.post(submit_url, {
          qs: qs_data,
          form: formData,
          headers: {
            Referer: addr_url,
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-User": "?1",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
            "Sec-Fetch-Site": "same-origin",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Upgrade-Insecure-Requests": "1"
            // "cache-control": "no-cache",
            // pragma: "no-cache",
            // cookie:
            //   "cna=P1uzFa+lx0UCAXLYXz0zDpJR; sm4=320506; ubn=p; ucn=center; lid=yuanxiaowaer; hng=CN%7Czh-CN%7CCNY%7C156; enc=C2JKJTyVi5rv9fZzGrCsctbG7wED%2F74f7JEftmCzqaZEOd69vwlxaQDdSe8cBD9xeulaoUtmhfL98EtXGDhB9Q%3D%3D; _bl_uid=g1jsFzn9ua9198531qp0vO6i1e82; dnk=yuanxiaowaer; uc1=tag=8&cookie14=UoTaECDSKJYHzg%3D%3D&pas=0&cookie21=WqG3DMC9Fbxq&cookie15=W5iHLLyFOGW7aA%3D%3D&cookie16=V32FPkk%2FxXMk5UvIbNtImtMfJQ%3D%3D&lng=zh_CN&existShop=false; uc3=nk2=Gh6VT7X9cESW5Bav&id2=W80qN4V3GqCv&lg2=VFC%2FuZ9ayeYq2g%3D%3D&vt3=F8dByuKwBA1bxA20fWg%3D; tracknick=yuanxiaowaer; uc4=nk4=0%40GJJeVHtXcnJImf8jH6j1S0uANAXEVLQ%3D&id4=0%40We5hgrFpKEIMRVD3AVPA1HU0W9M%3D; _l_g_=Ug%3D%3D; unb=842405758; lgc=yuanxiaowaer; cookie1=Vv6bWmeYv86mmEqDzTiNqknTnpFlk5e11%2BTyi5eXquQ%3D; login=true; cookie17=W80qN4V3GqCv; cookie2=18c331700a85e415ab2c3961e41bb03c; _nk_=yuanxiaowaer; t=08dd795cd89e14737715e44ab9a3c605; sg=r8d; csg=869f8a25; _tb_token_=83f0e663af53; l=cBTWs5nRqrQ6DRmEKOCZlurza77TbIRxBuPzaNbMi_5hY6L_V57OkycQ4Fp6DfXdtzLBq2XfR429-etbj8pTY-bwDFec.; isg=BBoatHtyE2oy1J-V1BHw47oCa8Y8S54lUmGI7SST3a14l7rRDNshNXJtZiquFha9"
          },
          followAllRedirects: true
        });
        let ret: string = await p;
        if (p.path.startsWith("/auction/order/TmallConfirmOrderError.htm")) {
          let msg = /<h2 class="sub-title">([^<]*)/.exec(ret)![1];
          console.log(msg);
          if (
            msg.includes("优惠信息变更") ||
            msg.includes("商品在收货地址内不可售")
          ) {
            return;
          }
          throwError(msg);
        }
        if (ret.indexOf("security-X5") > -1) {
          console.log("-------提交碰到验证拦截--------");
          logFile(ret, "pc-订单提交验证拦截");
          return;
        }
        // /auction/confirm_order.htm
        logFile(ret, "pc-订单已提交");
        console.log("-----订单提交成功，等待付款----");
      } catch (e) {
        console.trace(e);
        if (retryCount >= 3) {
          return console.error("重试失败3次，放弃治疗");
        }
        console.log("重试中");
        this.submitOrder(args, type, retryCount + 1);
      }
    })();
    return delay(50);
  }

  async submitOrderFromBrowser(
    args: ArgOrder<{
      form: Record<string, any>;
      addr_url: string;
      Referer: string;
    }>,
    type: string,
    p?: Promise<void>
  ) {
    var {
      data: { form, addr_url, Referer }
    } = args;
    var page = await newPage();
    await page.setRequestInterception(true);
    page.on("request", request => {
      // if (
      //   request
      //     .url()
      //     .startsWith(
      //       "https://cashierstl.alipay.com/standard/fastpay/channelExtInfo.json"
      //     )
      // ) {
      //   (async () => {
      //     await page.waitForSelector("#J_authSubmit");
      //     await page.evaluate(() => {
      //       var ele = document.querySelector<HTMLInputElement>(
      //         "#payPassword_rsainput"
      //       )!;
      //       console.log(ele);
      //       ele.value = "870092";
      //     });
      //     // await page.type("#payPassword_rsainput", "870092");
      //     await page.click("#J_authSubmit");
      //   })();
      // }
      var type = request.resourceType();
      if (type === "image" || type === "stylesheet" || type === "font") {
        request.respond({
          body: ""
        });
      } else {
        request.continue();
      }
    });
    await page.goto(Referer);
    await page.evaluate(createForm, form, addr_url);
    if (p) {
      await p;
    }
    page.evaluate(() => {
      document.querySelector<HTMLFormElement>("#__form")!.submit();
    });
    await page.waitForNavigation();
    await delay(30);
    page.click(".go-btn");
  }
}

function createForm(data, action) {
  var form = document.createElement("form");
  form.action = action;
  form.method = "post";
  form.id = "__form";
  Object.keys(data).forEach(key => {
    var input = document.createElement("input");
    input.name = key;
    input.value = data[key];
    form.appendChild(input);
  });
  document.body.appendChild(form);
}

export const taobaoOrderPc = new TaobaoOrderPc();
