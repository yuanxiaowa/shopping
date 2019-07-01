import { newPage } from "../utils/page";
import { startsWith } from "ramda";
import AutoShop from "../common/auto-shop";
import request = require("request-promise-native");
import { isSubmitOrder } from "../common/config";

export async function resolveTaokouling(text: string) {
  var data: string = await request.post(
    "http://www.taokouling.com/index/taobao_tkljm",
    {
      form: {
        text
      },
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      },
      gzip: true
    }
  );
  return <string>JSON.parse(data).data.url;
}

export class Taobao extends AutoShop {
  constructor() {
    super({
      name: "taobao",
      login_url: "https://login.taobao.com/member/login.jhtml",
      cookie_filename: __dirname + "/cookie.txt",
      state_url:
        "https://shoucang.taobao.com/collectList.htm?spm=a1z09.2.a2109.d1000374.5aef2e8diVrQxZ&nekot=1470211439694",
      encoding: null,
      handlers: {
        tmall: {
          test: startsWith("https://detail.tmall.com/item.htm"),
          async handler(num, page) {
            await page.evaluate(() => {
              Array.from(
                document.querySelectorAll<HTMLUListElement>(".J_TSaleProp")
              ).forEach(ul => {
                // @ts-ignore
                var lis = Array.from(<HTMLLIElement[]>ul.children);
                if (!lis.find(ele => ele.classList.contains("tb-selected"))) {
                  lis[0].querySelector("a")!.click();
                }
              });
            });
            await page.type(".tb-text", String(num));
            // #J_LinkBasket 加入购物车
            await page.click("#J_LinkBuy");
            await page.waitForNavigation();
            if (!isSubmitOrder) {
              await page.setOfflineMode(true);
            }
            await page.click("a.go-btn");
          }
        },
        tmall_m: {
          test: startsWith("https://detail.m.tmall.com/item.htm"),
          async handler(num, page) {
            await page.evaluate(() => {
              document.querySelector<HTMLDivElement>("a.buy")!.click();
            });
            // await page.click(".skuText");
            await page.waitForResponse(res =>
              res.url().startsWith("https://g.alicdn.com/tm/detail-b")
            );
            await page.waitForSelector("#number");
            await page.evaluate((num: string) => {
              Array.from(
                document.querySelectorAll<HTMLLinkElement>(".sku-list-wrap>li")
              ).forEach(li => {
                var links = Array.from(
                  li.querySelectorAll<HTMLLinkElement>("a")
                );
                if (!links.find(link => link.classList.contains("checked"))) {
                  links
                    .find(link => !link.classList.contains("disabled"))!
                    .click();
                }
              });
              document.querySelector<HTMLInputElement>("#number")!.value = num;
              document.querySelector<HTMLLinkElement>("a.ok")!.click();
            }, num);
            await page.waitForNavigation();

            if (!isSubmitOrder) {
              await page.setOfflineMode(true);
            }
            let btn = await page.waitForSelector('span[title="提交订单"]');
            await btn.click();
            await new Promise(resolve => {});
          }
        },
        chaoshi: {
          test: startsWith("https://chaoshi.detail.tmall.com/item.htm"),
          async handler(num, page) {
            await page.type(".tb-text", String(num));
            await page.click("#J_LinkBasket");
          }
        },
        taobao: {
          test: startsWith("https://item.taobao.com/item.htm"),
          async handler(num, page) {
            await page.evaluate(() => {
              Array.from(
                document.querySelectorAll<HTMLUListElement>(".J_TSaleProp")
              ).forEach(ul => {
                // @ts-ignore
                var lis = Array.from(<HTMLLIElement[]>ul.children);
                if (!lis.find(ele => ele.classList.contains("tb-selected"))) {
                  lis[0].querySelector("a")!.click();
                }
              });
            });
            await page.type("#J_IptAmount", String(num));
            // a.J_LinkAdd 加入购物车
            await page.click("#J_LinkBuy");
            await page.waitForNavigation();
            if (!isSubmitOrder) {
              await page.setOfflineMode(true);
            }
            await page.click("a.go-btn");
          }
        },
        taobao_m: {
          test: startsWith("https://h5.m.taobao.com/awp/core/detail.htm"),
          async handler(num, page) {
            await page.evaluate(() => {
              Array.from(
                document.querySelectorAll<HTMLUListElement>(".sku-info ul")
              ).forEach(ul => {
                // @ts-ignore
                var lis = Array.from(<HTMLLIElement[]>ul.children);
                if (!lis.find(ele => ele.classList.contains("sel"))) {
                  lis[0].click();
                }
              });
            });
            await page.type(".btn-input input", String(num));
            // .addcart
            await page.click(".gobuy");
            await page.waitForNavigation();
            if (!isSubmitOrder) {
              await page.setOfflineMode(true);
            }
            await page.click('div[aria-label="提交订单"]');
          }
        }
      },
      coupon_handlers: {
        uland: {
          test: startsWith("https://uland.taobao.com/coupon/edetail?"),
          async handler(url: string) {
            var page = await newPage();
            await page.goto(url);
            var b = await page.evaluate(() => {
              var ele = document.querySelector<HTMLDivElement>(".coupon-btn")!;
              if (ele.classList.contains("err-coupon-btn")) {
                if (confirm("已没有优惠券了，确定继续吗？")) {
                  document.querySelector("a")!.click();
                  return 1;
                }
                return 2;
              } else {
                ele.click();
              }
            });

            if (b === 2) {
              page.close();
              throw new Error("没券了");
            }
            if (!b) {
              let res = await page.waitForResponse(res =>
                res
                  .url()
                  .startsWith(
                    "https://h5api.m.taobao.com/h5/mtop.alimama.union.xt.en.api.entry"
                  )
              );
              let text = await res.text();
              text = text.replace(/\w+\((.*)\)/, "$1");
              let {
                data: {
                  recommend: {
                    resultList: [
                      {
                        coupon: { retStatus }
                      }
                    ]
                  }
                }
              } = JSON.parse(text);
              if (retStatus === 4) {
                let b = await page.evaluate(() => {
                  if (confirm("系统看你不爽，要继续吗？")) {
                    document.querySelector("a")!.click();
                  } else {
                    return false;
                  }
                });
                if (b === false) {
                  page.close();
                  throw new Error("系统抽风了");
                }
              }
            }
            await page.waitForNavigation();
            return page;
          }
        },
        taolijin: {
          // https://uland.taobao.com/taolijin/edetail?__share__id__=1&disablePopup=true&spm=a211b4.25023749&share_crt_v=1&sourceType=other&suid=ACA8079C-11A2-4558-AEB4-CC293DAC21B4&activityId=c9cc2ed7ebde4cdea80b32fbaf0e5d14&eh=drsdKEc3miiZuQF0XRz0iAXoB%2BDaBK5LQS0Flu%2FfbSp4QsdWMikAalrisGmre1Id0BFAqRODu12sb0fs3kJs2WT2LCKke3MVrwGSVh%2BekNkl4ynEHkuQjoxMu4NJfU64xi%2FUG8D2mm7cRMni2A61u8Mcy3ymkJpISShhSgHZF6PMAQLNOhwDsyELYR4WgPdoc99dUAcp2RxTtkLMzGodPgnle77VoPfrt4OXyVBuK232x40NvnBo%2BTt%2FowcrQRtOR0J0GUlAliz3qkBkleR4Us1rh%2B4QgJspTA0FRtOwCuw%3D&sp_tk=77%2BlN1pSdllnNFM1dlfvv6U%3D&un=d54169c7170fca0646e6040d6f65052e&disableSJ=1&visa=13a09278fde22a2e&union_lens=lensId%3A0bb793a8_0bfa_16ba2229f9d_a55a%3Btraffic_flag%3Dlm&ttid=201200%40taobao_iphone_8.8.0&sourceType=other&suid=dab38898-fc99-4579-a103-67bfa0dd8e8b&ut_sk=1.XHaHBRrZq7EDADaBhKpGUSG2_21646297_1561796887884.Copy.windvane
          test: startsWith("https://uland.taobao.com/taolijin/edetail"),
          async handler(url: string) {
            var page = await newPage();
            await page.goto(url);
            var r = await page.evaluate(() => {
              var nonore = document.querySelector(".coupon-nomore");
              if (nonore) {
                if (!confirm("缺礼包,要继续吗？")) {
                  return false;
                }
              }
              var ele = document.querySelector<HTMLDivElement>(".use-btn")!;
              ele.click();
            });
            if (r === false) {
              page.close();
              throw new Error("操作中断");
            }
            await page.waitForNavigation();
            return page;
          }
        }
      }
    });
  }
  async resolveUrl(url: string) {
    return url;
  }
  async resolveUrls(text: string): Promise<string[]> {
    var urls: string[] = [];
    if (!/^https?:/.test(text)) {
      let tkl_e = /(￥\w+￥)/.exec(text);
      if (tkl_e) {
        let url = await resolveTaokouling(text);
        urls.push(url);
      } else {
        urls = text.match(/https?:\/\/\w+(?:\.\w+){2,}[^ ]*/)!;
      }
    } else {
      urls.push(text);
    }
    return urls;
  }
  coudan(items: [string, number][]): Promise<any> {
    throw new Error("Method not implemented.");
  }
  async toggleCart(arr: number[][]) {
    // const page = await newPage();
    // await page.goto("https://cart.taobao.com/cart.htm");
    // // await page.waitForSelector("#J_Go");
    // // @ts-ignore
    // let firstData = await page.evaluate(() => window.firstData);
    // var cartIds: string[] = [];
    // var sellerids: string[] = [];
    // var items: {
    //   cartId: string;
    //   itemId: string;
    //   skuId: string;
    //   quantity: number;
    //   createTime: number;
    //   attr: string;
    // }[] = [];
    // firstData.list.forEach((shop: any) => {
    //   shop.bundles[0].items.forEach((item: any) => {
    //     cartIds.push(item.cartId);
    //     sellerids.push(item.sellerid);
    //     items.push({
    //       cartId: item.cartId,
    //       itemId: item.itemId,
    //       skuId: item.skuId,
    //       quantity: item.amount.now,
    //       createTime: item.createTime,
    //       attr: item.attr
    //     });
    //   });
    // });
    // var data = {
    //   hex: "n",
    //   cartId: cartIds.reverse().join(","),
    //   sellerid: sellerids.join(","),
    //   cart_param: JSON.stringify({
    //     items: items.reverse()
    //   }),
    //   unbalance: "",
    //   delCartIds: cartIds.join(","),
    //   use_cod: false,
    //   buyer_from: "cart",
    //   page_from: "cart",
    //   source_time: Date.now()
    // };
    // await page.evaluate((data: any) => {
    //   var form = document.createElement("form");
    //   form.method = "post";
    //   form.action =
    //     "https://buy.tmall.com/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined";
    //   Object.keys(data).map(key => {
    //     var input = document.createElement("input");
    //     input.type = "hidden";
    //     input.value = data[key];
    //     form.appendChild(input);
    //   });
    //   document.body.appendChild(form);
    //   form.submit();
    // }, data);
    // await page.waitForNavigation();
    // if (!isSubmitOrder) {
    //   await page.setOfflineMode(true);
    // }
    // await page.click(".go-btn");
  }

  async getCartInfo() {
    var html: string = await this.req.get(`https://cart.taobao.com/cart.htm`, {
      qs: {
        spm: "a231o.7712113/g.1997525049.1.3e004608MXPqWt",
        prepvid: `200_11.21.9.212_38091_${Date.now()}`,
        extra: "",
        from: "mini",
        ad_id: "",
        am_id: "",
        cm_id: "",
        pm_id: "1501036000a02c5c3739",
        pid: "mm_121093092_20166288_69356911",
        clk1: "",
        unid: "",
        source_id: "",
        app_pvid: `200_11.21.9.212_38091_${Date.now()}`
      }
    });
    var text = /var firstData = (.*);}catch \(e\)/.exec(html)![1];
    var data: {
      list: {
        // s_3409507848
        id: string;
        sellerId: string;
        shopId: string;
        title: string;
        // 失效为false
        isValid: boolean;
        // shop act
        type: string;
        promView: {
          // shopbonus-8709336796_76620184988-1163365363256
          id: string;
          discount: number;
          title: string;
          point: number;
          usePoint: number;
        };
        bundles: {
          // s_3409507848_0
          id: string;
          // shop
          type: string;
          valid: boolean;
          orders: {
            id: string;
            // 1355804953662
            cartId: string;
            itemId: string;
            skuId: string;
            // 2:可用 3：聚划算等待开团
            skuStatus: number;
            attr: string;
            title: string;
            skus: Record<string, string>;
            leafCategory: number;
            checked: boolean;
            amount: {
              now: number;
              // 最大可选数量
              max: number;
              multiple: number;
              supply: number;
              demand: number;
              // 库存
              limit: number;
            };
            price: {
              now: number;
              origin: number;
              save: number;
              sum: number;
            };
            // 是否可选
            isValid: boolean;

            // 赠品
            itemIcon?: Record<
              string,
              {
                img: string;
                link: string;
                title: string;
              }[]
            >;
            // 促销方式
            promos?: {
              title: string;
              type: number;
              usedPoint: number;
              style: string;
            }[][];
            promotionDesc?: string[];

            // 不可选的时候的提示信息
            code?: string;
            codeMsg?: string;

            seller: string;
            sellerId: string;
            shopId: string;
            shopName: string;
            shopUrl: string;
            // 是否为预售
            isPreSell: boolean;
            // 0
            preSellStatus: string;
            preSellText: string;
            pic: string;
            url: string;
            createTime: number;
            gmtModifiedTime: number;
          }[];
          // 享受的优惠
          promos: string[];
        }[];
        // 店铺地址
        url: string;
      }[];
    } = JSON.parse(text);
    return data;
  }

  async submitOrder(
    form: Record<string, any>,
    addr_url: string,
    Referer: string
  ) {
    this.logFile(addr_url + "\n" + JSON.stringify(form), "进入订单结算页");
    var html: string = await this.req.post(addr_url, {
      form,
      headers: {
        Referer
      },
      encoding: null
    });
    this.logFile(addr_url + "\n" + html, "订单结算页");
    var text = /var orderData = (.*);/.exec(html)![1];
    var {
      data,
      linkage,
      hierarchy: { structure }
    }: {
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
            secretValue: string;
            sparam1: string;
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
    var url = /action="([^"]*)/.exec(html)![1].replace("&amp;", "&");
    var formData = [
      "_tb_token_",
      "action",
      "event_submit_do_confirm",
      "input_charset",
      // "praper_alipay_cashier_domain",
      "authYiYao",
      "authHealth",
      "F_nick"
    ].reduce((state: any, name) => {
      state[name] = new RegExp(
        `name=['"]${name}['"].*? value=['"](.*?)['"]`
      ).exec(html)![1];
      return state;
    }, {});
    var ua_log = "";
    var ret = await this.req.post(`https://buy.tmall.com${url}`, {
      qs: {
        spm: "a220l.1.a22016.d011001001001.undefined",
        submitref: data.confirmOrder_1.fields.secretValue,
        sparam1: data.confirmOrder_1.fields.sparam1
      },
      form: {
        ...formData,
        praper_alipay_cashier_domain: "cashierstl",
        hierarchy: JSON.stringify({
          structure
        }),
        data: JSON.stringify(
          Object.keys(data).reduce((state: any, name) => {
            var item = data[name];
            if (item.submit) {
              if (item.tag === "submitOrder") {
                if (item.fields) {
                  if (ua_log) {
                    item.fields.ua = ua_log;
                  }
                }
              }
              state[name] = item;
            }
            return state;
          }, {})
        ),
        linkage: JSON.stringify({
          common: linkage.common,
          signature: linkage.signature
        })
      }
    });
    this.logFile(ret, "订单已提交");
    console.log("-----订单提交成功，等待付款----");
  }

  async cartBuy(
    goods: {
      sellerId: number;
      cartId: string;
      itemId: string;
      skuId: string;
      amount: {
        now: number;
      };
      createTime: number;
      attr: string;
    }[]
  ) {
    var cartIdStr = goods.map(({ cartId }) => cartId).join(",");
    var sellerIdStr = [...new Set(goods.map(({ sellerId }) => sellerId))].join(
      ","
    );
    var items = goods.map(
      ({ cartId, itemId, skuId, amount, createTime, attr }) => ({
        cartId,
        itemId,
        skuId,
        quantity: amount.now,
        createTime,
        attr
      })
    );
    console.log("进入订单结算页");
    try {
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
      await this.submitOrder(
        form,
        "https://buy.tmall.com/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined",
        `https://cart.taobao.com/cart.htm?spm=a21bo.2017.1997525049.1.5af911d9eInVdr&from=mini&ad_id=&am_id=&cm_id=&pm_id=1501036000a02c5c3739`
      );
    } catch (e) {
      console.error(e);
    }
  }

  async directBuy(url: string) {
    var html: string = await this.req.get(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36"
      }
    });
    this.logFile(url + "\n" + html, "直接购买-商品详情");
    var text = /TShop.Setup\(\s*(.*)\s*\);/.exec(html)![1];
    var {
      itemDO,
      valItemInfo: { skuList, skuMap },
      tradeConfig
    } = JSON.parse(text);
    var form_str = /<form id="J_FrmBid"[^>]*>([\s\S]*?)<\/form>/.exec(html)![1];
    var form_item_r = /\sname="([^"]+)"\s+value="([^"]*)"/g;
    var form: Record<string, string> = {};
    while (form_item_r.test(form_str)) {
      form[RegExp.$1] = RegExp.$2;
    }
    if (!form.buyer_from) {
      form.buyer_from = "ecity";
    }
    var skuItem = skuList.find(
      (item: any) => skuMap[`;${item.pvs};`].stock > 0
    );
    var skuId: string;
    if (skuItem) {
      skuId = skuItem.skuId;
    } else {
      throw new Error("没货了");
    }
    Object.assign(form, {
      root_refer: "",
      item_url_refer: url,

      allow_quantity: itemDO.quantity,
      buy_param: [itemDO.itemId, 1, skuId].join("_"),
      quantity: 1,
      _tb_token_: "edeb7b783ff65",
      skuInfo: [itemDO.title].join(";"),
      _input_charset: "UTF-8",
      skuId,
      bankfrom: "",
      from_etao: "",
      item_id_num: itemDO.itemId,
      item_id: itemDO.itemId,
      auction_id: itemDO.itemId,
      seller_rank: "0",
      seller_rate_sum: "0",
      is_orginal: "no",
      point_price: "false",
      secure_pay: "true",
      pay_method: "\u6b3e\u5230\u53d1\u8d27",
      from: "item_detail",
      buy_now: itemDO.reservePrice,
      current_price: itemDO.reservePrice,
      auction_type: itemDO.auctionType,
      seller_num_id: itemDO.userId,
      activity: "",
      chargeTypeId: ""
    });
    /* var pdetail = this.req.get("https:" + /var l,url='([^']+)/.exec(html)![1], {
      headers: {
        Referer: url
      }
    });
    var detail_text = await pdetail;
    var {
      defaultModel: {
        deliveryDO: { areaId }
      }
    } = JSON.parse(/\((.*)\)/.exec(detail_text)![1]);
    Object.assign(form, {
      destination: areaId
    }); */
    var qs_data = {
      "x-itemid": itemDO.itemId,
      "x-uid": /unb=(\w+)/.exec(this.cookie)
    };
    /* var page = await newPage();
    // await page.goto(url);
    await page.evaluate(form => {
      var ele = document.createElement("form");
      ele.action = "https://buy.tmall.com/order/confirm_order.htm";
      ele.method = "post";
      Object.keys(form).forEach(name => {
        var input = document.createElement("input");
        input.name = name;
        input.value = form[name];
        ele.appendChild(input);
      });
      document.body.appendChild(ele);
      ele.submit();
    }, form); */
    console.log("进入订单结算页");
    try {
      var ret = await this.submitOrder(form, "https:" + tradeConfig[2], url);
      /* var ret = await this.req.post("https:" + tradeConfig[2], {
        form,
        qs: qs_data
      }); */
      console.log(ret);
    } catch (e) {
      console.error("订单提交出错", e);
    }
  }
}
