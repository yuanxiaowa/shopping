import AutoShop from "../auto-shop";
import { getCookie, createTimerExcuter, delay } from "../../../utils/tools";
import { getPcCartInfo } from "./pc";
import { Page } from "puppeteer";
import iconv = require("iconv-lite");
import taobaoHandlers from "./handlers";
import { resolveTaokouling, resolveUrl, logFile } from "./tools";
import {
  getGoodsInfo,
  addCart,
  getCartList,
  updateCart,
  cartToggle,
  seckillList,
  sixtyCourseList,
  sixtyCourseReply,
  submitOrder,
  comment,
  commentList,
  getChaoshiGoodsList,
  getCoupons,
  getGoodsList,
  checkLogin
} from "./goods";
import { newPage } from "../../../utils/page";
import { readJSONSync } from "fs-extra";
import { ArgOrder, ArgBuyDirect } from "../struct";
import { config } from "../../common/config";
import cheerio = require("cheerio");
import { RequestPromise } from "request-promise-native";
import taobaoCouponHandlers from "./coupon-map";
import bus_global from "../../common/bus";
const user = require("../../../.data/user.json").taobao;

export class Taobao extends AutoShop {
  mobile = true;

  constructor() {
    super({
      name: "taobao",
      login_url: "https://login.taobao.com/member/login.jhtml",
      state_url:
        "https://main.m.taobao.com/mytaobao/index.html?spm=a215s.7406091.toolbar.i2",
      handlers: taobaoHandlers,
      coupon_handlers: taobaoCouponHandlers
    });
  }

  async checkUrl(url: string, page: Page) {
    page.goto(url);
    var res = await page.waitForResponse(
      res =>
        res
          .url()
          .startsWith(
            "https://h5api.m.taobao.com/h5/mtop.user.getusersimple/1.0/"
          ) ||
        res
          .url()
          .startsWith(
            "https://h5api.m.taobao.com/h5/mtop.taobao.mclaren.index.data.get.h5/1.0"
          )
    );
    var text: string = await res.text();
    return !text.includes("FAIL_SYS_SESSION_EXPIRED::");
    // return checkLogin();
  }
  resolveUrl = resolveUrl;
  async resolveUrls(text: string): Promise<string[]> {
    var urls: string[] = [];
    if (/复制/.test(text) || !/https?:\/\//.test(text)) {
      // let tkl_e = /(￥\w+￥)/.exec(text);
      let url = await resolveTaokouling(text);
      urls.push(url);
    } else {
      urls = text.match(/https?:\/\/\w+(?:\.\w+){2,}[^ ]*/)!;
    }
    return Promise.all(urls.map(resolveUrl));
  }

  async cartList(args) {
    var items;
    if (!args.from_pc) {
      items = await getCartList();
    } else {
      items = await this.cartListFromPc();
    }
    return { items };
  }
  async cartAdd(args: {
    url: string;
    quantity: number;
    skus?: number[];
  }): Promise<any> {
    return addCart(args);
  }
  cartDel(data: any): Promise<any> {
    return updateCart(data, "deleteSome");
  }
  cartUpdateQuantity(data) {
    return updateCart(data, "update");
  }
  comment = comment;
  commentList(args) {
    return commentList(/* args.type,  */ args.page);
  }
  buyDirect(data: ArgBuyDirect, p?: Promise<void>): Promise<any> {
    if (data.from_pc) {
      return this.buyDirectFromPc(data, p);
    }
    return this.buyDirectFromMobile(data, p);
  }
  async coudan(ids: string[]): Promise<any> {
    var list = await this.cartList({});
    var datas: any[] = [];
    list.items.forEach(({ items }) => {
      items.forEach(item => {
        if (ids.includes(item.cartId)) {
          datas.push(item);
        }
      });
    });
    return this.cartBuy({ items: datas });
  }

  spm = "a222m.7628550.0.1";

  cartBuyFromMobile(args: { items: any[] }) {
    return submitOrder({
      data: {
        buyNow: "false",
        buyParam: args.items.map(({ settlement }) => settlement).join(","),
        spm: this.spm
      },
      other: {}
    });
  }

  cartBuy(args: any) {
    if (args.from_pc) {
      return this.cartBuyFromPc(args);
    }
    return this.cartBuyFromMobile(args);
  }

  submitOrder(data) {
    if (data.from_pc) {
      return this.submitOrderFromPc(data);
    }
    return submitOrder(data);
  }

  getGoodsInfo = getGoodsInfo;

  getNextDataByGoodsInfo({ delivery, skuId, itemId }, quantity: number) {
    return {
      buyNow: true,
      exParams: JSON.stringify({
        addressId:
          delivery.areaSell === "true" ? delivery.addressId : undefined,
        buyFrom: "tmall_h5_detail"
      }),
      itemId,
      quantity,
      serviceId: null,
      skuId
    };
  }

  async buyDirectFromMobile(args: ArgBuyDirect, p?: Promise<void>) {
    var data = await this.getGoodsInfo(args.url, args.skus);
    if (data.quantity < args.quantity) {
      if (args.jianlou) {
        let p = createTimerExcuter(async () => {
          var data = await this.getGoodsInfo(args.url, args.skus);
          return {
            success: data.quantity >= args.quantity,
            data
          };
        }, args.jianlou!);
        p.then(async () => {
          console.log("有库存了，开始去下单");
          if (args.from_cart) {
            let id = await this.cartAdd({
              url: args.url,
              quantity: args.quantity,
              skus: args.skus
            });
            return this.coudan([id]);
          }
          return submitOrder(
            Object.assign(args, {
              data: this.getNextDataByGoodsInfo(data, args.quantity)
            })
          );
        });
      }
    } else {
      if (!data.buyEnable) {
        throw new Error(data.msg || "不能购买");
      }
      if (p) {
        await p;
      }
      return submitOrder(
        Object.assign(args, {
          data: this.getNextDataByGoodsInfo(data, args.quantity)
        })
      );
    }
  }

  async goodsList(args) {
    if (args.name === "chaoshi") {
      return getChaoshiGoodsList(args);
    }
    return getGoodsList(args);
  }

  coupons = getCoupons;
  seckillList = seckillList;
  sixtyCourseList = sixtyCourseList;
  sixtyCourseReply = sixtyCourseReply;

  cartToggle = cartToggle;

  async loginAction(page: Page) {
    /* await page.waitForNavigation({
      timeout: 0
    });
    await page.click(".J_Quick2Static");
    await page.evaluate(username => {
      document.querySelector<HTMLInputElement>(
        "#TPL_username_1"
      )!.value = username;
    }, user.username);
    await page.type("#TPL_password_1", user.password);
    var [bar, area] = await Promise.all([
      page.$("#nc_1_n1z"),
      page.$("#nc_1__scale_text")
    ]);
    var bar_box = (await bar!.boundingBox())!;
    var start_x = bar_box.x + bar_box.width / 2 + 10 - 10 * Math.random();
    var start_y = bar_box.y + bar_box.height / 2 + 10 - 10 * Math.random();
    var area_rect = await area!.boundingBox();
    var mouse = page.mouse;
    console.log(bar_box, area_rect);
    await mouse.move(start_x, start_y);
    await mouse.down();
    var len = (600 + Math.random() * 500) / 16.66;
    for (let i = 0; i < len; i++) {
      await mouse.move(
        start_x + (i / len) * area_rect!.width,
        start_y + (Math.random() - 0.5) * 10
      );
      await delay(16.66);
    }
    await mouse.up(); */
    var res = await page.waitForResponse(res =>
      res.url().startsWith("https://img.alicdn.com/imgextra")
    );
    return res.url();
  }

  onAfterLogin() {
    bus_global.emit("taobao:cookie", this.cookie);
    this.spm = `a1z0d.6639537.1997196601.${(Math.random() * 100) >>
      0}.412f7484UFYI5e`;
  }

  async testOrder(args) {
    var page = await newPage();
    await page.setRequestInterception(true);
    page.on("request", e => {
      if (
        /\/(mtop.trade.buildorder.h5|mtop.trade.order.build.h5)\//.test(e.url())
      ) {
        e.respond({
          status: 200,
          body: JSON.stringify({
            api: RegExp.$1,
            ret: ["SUCCESS::调用成功"],
            data: readJSONSync(args.file)
          })
        });
      } else {
        e.continue();
      }
    });
    page.goto(
      "https://buy.m.tmall.com/order/confirm_order_wap.htm?enc=%E2%84%A2&itemId=538364857603&exParams=%7B%22addressId%22%3A%229607477385%22%2C%22etm%22%3A%22%22%7D&skuId=3471693791586&quantity=1&divisionCode=320583&userId=842405758&buyNow=true&_input_charset=utf-8&areaId=320583&addressId=9607477385&x-itemid=538364857603&x-uid=842405758"
    );
    return;
  }

  async buyDirectFromPc({ url, quantity }: ArgBuyDirect, p?: Promise<void>) {
    var html: string = await this.req.get(
      url.replace("detail.m.tmall.com/", "detail.tmall.com/"),
      {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36"
        }
      }
    );
    logFile(url + "\n" + html, "直接购买-商品详情");
    var text = /TShop.Setup\(\s*(.*)\s*\);/.exec(html)![1];
    // detail.isHiddenShopAction
    var { itemDO, valItemInfo, tradeConfig } = JSON.parse(text);
    if (!p && !itemDO.isOnline) {
      throw new Error("商品已下架");
    }
    let form_str = /<form id="J_FrmBid"[^>]*>([\s\S]*?)<\/form>/.exec(html)![1];
    let form_item_r = /\sname="([^"]+)"\s+value="([^"]*)"/g;
    let form: Record<string, string> = {};
    while (form_item_r.test(form_str)) {
      form[RegExp.$1] = RegExp.$2;
    }
    if (!form.buyer_from) {
      form.buyer_from = "ecity";
    }
    let skuId = "0";
    if (itemDO.hasSku) {
      let { skuList, skuMap } = valItemInfo;
      let skuItem = skuList.find(
        (item: any) => skuMap[`;${item.pvs};`].stock > 0
      );
      if (skuItem) {
        skuId = skuItem.skuId;
      } else {
        throw new Error("没货了");
      }
    }
    Object.assign(form, {
      root_refer: "",
      item_url_refer: url,

      allow_quantity: itemDO.quantity,
      buy_param: [itemDO.itemId, 1, skuId].join("_"),
      quantity,
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
      "x-uid": getCookie("unb", this.cookie)
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
    if (p) {
      await p;
    }
    try {
      var ret = await this.submitOrderFromPc({
        data: {
          form,
          addr_url: "https:" + tradeConfig[2],
          Referer: url
        },
        other: {}
      });
      /* var ret = await this.req.post("https:" + tradeConfig[2], {
        form,
        qs: qs_data
      }); */
      return ret;
    } catch (e) {
      console.error("订单提交出错", e);
    }
  }

  async submitOrderFromPc(
    args: ArgOrder<{
      form: Record<string, any>;
      addr_url: string;
      Referer: string;
    }>
  ): Promise<any> {
    var {
      data: { form, addr_url, Referer }
    } = args;
    console.log("准备进入订单结算页");
    logFile(addr_url + "\n" + JSON.stringify(form), "pc-准备进入订单结算页");
    var html: string = await this.req.post(addr_url, {
      form,
      headers: {
        Referer
      }
    });
    if (html.lastIndexOf("security-X5", html.indexOf("</title>")) > -1) {
      let msg = "进入订单结算页碰到验证拦截";
      console.log(`-------${msg}--------`);
      logFile(html, "pc-订单提交验证拦截");
      throw new Error(msg);
    }
    logFile(addr_url + "\n" + html, "pc-订单结算页");
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
            pcSubmitUrl: string;
            secretValue: string;
            sparam1: string;
            sparam2: string;
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
    var { confirmOrder_1 } = data;
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
    if (structure.invalidGroup_2) {
      throw new Error("存在无效商品");
    }
    if (!config.isSubmitOrder) {
      return;
    }
    delete linkage.common.queryParams;
    try {
      let p = this.req.post(
        `https://buy.tmall.com${confirmOrder_1.fields.pcSubmitUrl}`,
        {
          qs: {
            spm: `a220l.1.a22016.d011001001001.undefined`,
            submitref: confirmOrder_1.fields.secretValue,
            sparam1: confirmOrder_1.fields.sparam1,
            sparam2: confirmOrder_1.fields.sparam2
          },
          form: {
            ...formData,
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
          },
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
          followAllRedirects: true,
          encoding: null
        }
      );
      let ret: string = await p;
      if (p.path.startsWith("/auction/order/TmallConfirmOrderError.htm")) {
        let msg = /<h2 class="sub-title">([^>]*)/.exec(ret)![1];
        console.log(msg);
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
      console.log("重试中");
      return this.submitOrderFromPc(args);
    }
  }

  async cartBuyFromPc(args: {
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
    await this.submitOrderFromPc({
      data: {
        form,
        addr_url: `https://buy.tmall.com/order/confirm_order.htm?spm=aa1z0d.6639537.0.0.undefined`,
        Referer: `https://cart.taobao.com/cart.htm?spm=a220o.1000855.a2226mz.12.5ada2389fIdDSp&from=btop`
      },
      other: {}
    });
  }

  async cartListFromPc() {
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
        // pid: "mm_121093092_20166288_69356911",
        clk1: "",
        unid: "",
        source_id: "",
        app_pvid: `200_11.21.9.212_38091_${Date.now()}`
      }
    });
    var text = /var firstData = (.*);}catch \(e\)/.exec(html)![1];
    var res_data = JSON.parse(text);
    return getPcCartInfo(res_data);
  }

  async getShopCollection(args: any) {
    var fhtml = await this.req(
      "https://shoucang.taobao.com/shop_collect_list_n.htm?spm=a1z0k.7386009.1997992801.3.46381019lOtNMa"
    );
    var token = /_tb_token_:\s*'([^']+)'/.exec(fhtml)![1];
    var html: string = await this.req.get(
      "https://shoucang.taobao.com/nodejs/shop_collect_list_chunk.htm?spm=a1z0k.7386009.1997992801.3.46381019lOtNMa",
      {
        qs: {
          ifAllTag: "0",
          tab: "0",
          categoryCount: "0",
          tagName: "",
          type: "0",
          categoryName: "",
          needNav: "false",
          startRow: args.page - 1,
          t: Date.now()
        }
      }
    );
    var $ = cheerio.load(html);
    var items = $(".shop-card")
      .map((i, ele) => {
        var $ele = $(ele);
        var $a = $ele.find(".shop-name-link");
        var img = $ele.find(".logo-img").attr("src");
        var url = $a.attr("href");
        return {
          id: /shop_id=(\d+)/.exec(url)![1],
          title: $a.text().trim(),
          img,
          url,
          token
        };
      })
      .get();
    return {
      page: args.page,
      items,
      more: items.length > 0
    };
  }

  async deleteShop(items: { id: string; token: string }[]) {
    var text: string = await this.req.post(
      "https://shoucang.taobao.com/favorite/api/CollectOperating.htm",
      {
        form: {
          _tb_token_: items[0].token,
          _input_charset: "utf-8",
          favType: 0,
          "favIdArr[]": items.map(({ id }) => id),
          operateType: "delete"
        },
        headers: {
          "x-requested-with": "XMLHttpRequest",
          referer:
            "https://shoucang.taobao.com/shop_collect_list_n.htm?spm=a1z0k.7386009.1997992801.3.46381019lOtNMa"
        }
      }
    );
    var { errorMsg, success } = JSON.parse(text);
    if (!success) {
      throw new Error(errorMsg);
    }
  }
}
