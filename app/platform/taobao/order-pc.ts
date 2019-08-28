/*
 * @Author: oudingyin
 * @Date: 2019-08-26 09:17:48
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-28 12:48:59
 */
import { delay } from "../../../utils/tools";
import setting from "./setting";
import { logFile } from "./tools";
import { ArgBuyDirect, ArgOrder } from "../struct";
import { config } from "../../common/config";
import moment = require("moment");
import iconv = require("iconv-lite");
import { getGoodsInfo } from "./goods-pc";

export class TaobaoOrderPc {
  async buyDirect(arg: ArgBuyDirect, p?: Promise<void>) {
    var { itemDO, tradeConfig, form } = await getGoodsInfo(arg.url, true);
    Object.assign(form, {
      quantity: arg.quantity
    });
    if (!p && !itemDO.isOnline) {
      throw new Error("商品已下架");
    }
    if (p) {
      await p;
    }
    try {
      return this.submitOrder(
        Object.assign(
          {
            data: {
              form,
              addr_url: "https:" + tradeConfig[2],
              Referer: arg.url
            },
            other: {}
          },
          arg
        )
      );
      /* var ret = await this.req.post("https:" + tradeConfig[2], {
        form,
        qs: qs_data
      }); */
    } catch (e) {
      console.error("订单提交出错", e);
    }
  }

  async cartBuy(args: {
    items: {
      sellerId: string;
      cartId: string;
      skuId: string;
      itemId: string;
      quantity: number;
      createTime: string;
      attr: string;
    }[];
  }) {
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
    var form = {
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
    };
    delete args.items;
    return this.submitOrder({
      data: {
        form,
        addr_url: `https://buy.tmall.com/order/confirm_order.htm?spm=aa1z0d.6639537.0.0.undefined`,
        Referer: `https://cart.taobao.com/cart.htm?spm=a220o.1000855.a2226mz.12.5ada2389fIdDSp&from=btop`
      },
      other: {},
      ...args
    });
  }

  async submitOrder(
    args: ArgOrder<{
      form: Record<string, any>;
      addr_url: string;
      Referer: string;
    }>,
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
      throw new Error(msg);
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
            /* pcSubmitUrl: string;
            secretValue: string;
            sparam1: string;
            sparam2: string;
            sourceTime: string; */
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
      };
      hierarchy: {
        structure: Record<string, string[]>;
      };
    } = JSON.parse(text);
    console.log("-----进入订单结算页，准备提交订单----");
    var { /* confirmOrder_1, */ submitOrderPC_1, realPayPC_1 } = data;
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
        await delay(delay_time - time_diff);
        return this.submitOrder(args, retryCount + 1);
      }
    }
    if (typeof args.expectedPrice !== "undefined") {
      if (+realPayPC_1.fields.price > +args.expectedPrice) {
        throw new Error("太贵了，买不起");
      }
    }
    var formData = {
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
              state[name] = item;
            }
            return state;
          }, {})
        )
      )
    };
    // var ua_log =
    //   "119#MlKA70vEMnDyqMMzZR0mfhNqsAOCc0zzNoYqOxPXiX8rOLMlRvBsQHACBLnD7HNkVW6u+TJDO2dsHEKw83cWa2lUDbCsSUkGMZA8RJBONt8LfoHMRPPe3FN8fHhS4Q9LdeNMR2VVNlsCqwMJqQPOutK6fusG4lhLPGg1RJ+q+NFGf/VwKSqj+EAL9eVH4QyG2eALRJE+EE387nASRVTmHNA6h2+S4lca0rA87PjVNN3Mxe3RaB0U3FNcQ1hzcDbL3e3My2I3TAFGfoZEh/loEEAL9weXLl9Lt1ELKlGv86GGMaASRBSUWLNN2I75eGcR3oALR2V48iVNNJd6+7hSzsyTgYCQM6ILf9lNDKDMyaD6cQ9YCYbCuYUcuuFM5yEg02+qaowfKLyxBXU8Ft9A4ia4LltAFPd5qdtAcnn8R7ho4LbVKKgB53QfxeC/hIJxtmKJZd2VBm5lz/LN09il3DbBKeaRMc/J1eugCy8Kb5lyXIoB3cfAkvUQjSDL5n4ubXZdBj4MiYX2BOsZRSfmWR8hVf5yn53hSaCZTLHKt7FbC9ZydWY1AB8+IFCJ8Qh2z9vM3TX/7pzXKH6MJcjYR8YntN9rmxnMKSOr/5hyWOGahQLHimcEeBmyWCbwLD6v6OOjualjPSwjk9VCx/yX2GAI4QJJ8bq3XA4b9z1AfjWmSe8/iedwoUahD6NT5zB3M0tAqy0vMv65kYVzj9Mvr/RimM2FHuErzYj9IjC0JJOFgnEYuAnMrRUvdLZjWqlyrIus3RbKuEM5E++wjfaqXGWRQny9BCGg+hJJIilFDyuuF3EitezdHX8mWypJ6e+MjAkDwq8Q7LIo5cANFZSQF3qpJun7d671jsKQLSuFgNPISBEAQWAy7+ZM3Y+biHaMRCXlYnMbY0EI";
    delete linkage.common.queryParams;
    console.log(args.noinvalid);
    if (args.noinvalid && structure.invalidGroup_2) {
      throw new Error("存在无效商品");
    }
    if (!config.isSubmitOrder) {
      return;
    }
    try {
      let p = setting.req.post(
        `https://buy.tmall.com${
          submitOrderPC_1.hidden.extensionMap.pcSubmitUrl
        }`,
        {
          qs: {
            spm: `a220l.1.a22016.d011001001001.undefined`,
            submitref: submitOrderPC_1.hidden.extensionMap.secretValue,
            sparam1: submitOrderPC_1.hidden.extensionMap.sparam1,
            sparam2: submitOrderPC_1.hidden.extensionMap.sparam2
          },
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
          },
          followAllRedirects: true
        }
      );
      let ret: string = await p;
      if (p.path.startsWith("/auction/order/TmallConfirmOrderError.htm")) {
        let msg = /<h2 class="sub-title">([^<]*)/.exec(ret)![1];
        console.log(msg);
        if (msg.includes("优惠信息变更")) {
          return console.error(msg);
        }
        throw new Error(msg);
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
      return this.submitOrder(args, retryCount + 1);
    }
  }
}

export const taobaoOrderPc = new TaobaoOrderPc();
