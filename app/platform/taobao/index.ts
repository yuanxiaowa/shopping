import AutoShop from "../auto-shop";
import {
  getCookie,
  getJsonpData,
  getCookieFilename
} from "../../../utils/tools";
import signData from "./h";
import { getMobileCartList, CartItem } from "./mobile";
import { getPcCartInfo } from "./pc";
import { Page } from "puppeteer";
import taobaoHandlers from "./handlers";
import taobaoCouponHandlers from "./coupon-handlers";
import { resolveTaokouling } from "./tools";

export class Taobao extends AutoShop {
  mobile = true;

  constructor() {
    super({
      name: "taobao",
      login_url: "https://login.taobao.com/member/login.jhtml",
      cookie_filename: getCookieFilename("taobao"),
      state_url:
        "https://main.m.taobao.com/mytaobao/index.html?spm=a215s.7406091.toolbar.i2",
      handlers: taobaoHandlers,
      coupon_handlers: taobaoCouponHandlers
    });
  }

  async checkUrl(url: string, page: Page) {
    page.goto(url);
    var res = await page.waitForResponse(res =>
      res
        .url()
        .startsWith(
          "https://h5api.m.taobao.com/h5/mtop.user.getusersimple/1.0/"
        )
    );
    var text: string = await res.text();
    return !text.includes("FAIL_SYS_SESSION_EXPIRED::SESSION失效");
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

  cartList() {
    if (this.mobile) {
      return this.cartListFromMobile();
    }
    return this.cartListFromPc();
  }
  cartAdd(data: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  cartDel(data: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  cartUpdateQuantity(data: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  comment(data: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  commentList(): Promise<any> {
    throw new Error("Method not implemented.");
  }
  buyDirect(data: { url: string; quantity: number }): Promise<any> {
    if (this.mobile) {
      return this.buyDirectFromMobile(data.url, data.quantity);
    }
    return this.buyDirectFromPc(data.url, data.quantity);
  }
  coudan(items: [string, number][]): Promise<any> {
    throw new Error("Method not implemented.");
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

  async submitOrderFromPc(
    form: Record<string, any>,
    addr_url: string,
    Referer: string
  ): Promise<any> {
    this.logFile(addr_url + "\n" + JSON.stringify(form), "进入订单结算页");
    var html: string = await this.req.post(addr_url, {
      form,
      headers: {
        Referer
      }
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
    try {
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
      var ret: string = await this.req.post(`https://buy.tmall.com${url}`, {
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
      if (ret.indexOf("security-X5") > -1) {
        console.log("-------提交碰到验证拦截--------");
        this.logFile(ret, "订单提交验证拦截");
        return;
      }
      this.logFile(ret, "订单已提交");
      console.log("-----订单提交成功，等待付款----");
    } catch (e) {
      console.trace(e);
      return this.submitOrderFromPc(form, addr_url, Referer);
    }
  }

  async cartBuyFromPc(
    goods: {
      sellerId: string;
      cartId: string;
      skuId: string;
      itemId: string;
      amount: number;
      createTime: string;
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
        quantity: amount,
        createTime,
        attr
      })
    );
    console.log("进入订单结算页");
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
    await this.submitOrderFromPc(
      form,
      `https://buy.tmall.com/order/confirm_order.htm?spm=${this.spm}`,
      `https://cart.taobao.com/cart.htm?spm=a21bo.2017.1997525049.1.5af911d9eInVdr&from=mini&ad_id=&am_id=&cm_id=`
    );
  }

  spm = "a222m.7628550.0.0";

  async cartListFromMobile() {
    var data = {
      exParams: JSON.stringify({
        mergeCombo: "true",
        version: "1.0.0",
        globalSell: "1",
        spm: this.spm,
        cartfrom: "detail"
      }),
      isPage: "false",
      extStatus: "0",
      spm: this.spm,
      cartfrom: "detail"
    };
    var text: string = await this.requestOnMobile(
      "https://acs.m.taobao.com/h5/mtop.trade.querybag/5.0/",
      "get",
      {
        jsv: "2.3.26",
        appKey: "12574478",
        api: "mtop.trade.queryBag",
        v: "5.0",
        isSec: "0",
        ecode: "1",
        AntiFlood: "true",
        AntiCreep: "true",
        H5Request: "true",
        LoginRequest: "true",
        type: "jsonp",
        dataType: "jsonp",
        callback: "mtopjsonp1"
      },
      data
    );
    var res_data = getJsonpData(text);
    return getMobileCartList(res_data);
  }
  async submitOrderFromMobile(data: any) {
    // this.logFile(JSON.stringify(items), '手机准备进入订单结算页')
    console.log("-------------开始进入手机订单结算页-------------");
    var text: any = await this.requestOnMobile(
      "https://h5api.m.taobao.com/h5/mtop.trade.buildorder.h5/3.0/",
      "post",
      {
        jsv: "2.4.7",
        appKey: this.appKey,
        api: "mtop.trade.buildOrder.h5",
        v: "3.0",
        type: "originaljson",
        timeout: "20000",
        isSec: "1",
        dataType: "json",
        ecode: "1",
        ttid: "#t#ip##_h5_2014",
        AntiFlood: "true",
        LoginRequest: "true",
        H5Request: "true"
      },
      data
    );
    console.log(
      "-------------已经进入手机订单结算页-------------",
      typeof text
    );
    this.logFile(text, "手机订单结算页");
    if (typeof text === "string") {
      text = JSON.parse(text);
    }
    if (text.ret[0].includes("FAIL_SYS_TRAFFIC_LIMIT")) {
      console.log(typeof text);
      console.log("正在重试");
      return this.submitOrderFromMobile(data);
    }
    console.log("-------------进入手机订单结算页，准备提交-------------");
    var {
      data: {
        data,
        linkage,
        hierarchy: { structure }
      }
    } = text;
    var ua = "";
    var ret = await this.requestOnMobile(
      "https://h5api.m.taobao.com/h5/mtop.trade.createorder.h5/3.0/",
      "post",
      {
        jsv: "2.4.7",
        appKey: this.appKey,
        api: "mtop.trade.createOrder.h5",
        v: "3.0",
        type: "originaljson",
        timeout: "20000",
        dataType: "json",
        isSec: "1",
        ecode: "1",
        ttid: "#t#ip##_h5_2014",
        AntiFlood: "true",
        LoginRequest: "true",
        H5Request: "true",
        submitref: "0a67f6"
      },
      {
        params: JSON.stringify({
          data: JSON.stringify(
            Object.keys(data).reduce(
              (state, name) => {
                var item = data[name];
                if (item.submit) {
                  state[name] = item;
                }
                return state;
              },
              <any>{}
            )
          ),
          hierarchy: JSON.stringify({
            structure
          }),
          linkage: JSON.stringify({
            common: {
              compress: linkage.common.compress,
              submitParams: linkage.common.submitParams,
              validateParams: linkage.common.validateParams
            },
            signature: linkage.signature
          })
        }),
        ua
      },
      ua
    );
    this.logFile(ret, "手机订单提交成功");
    var {
      ret: [msg]
    } = JSON.parse(ret);
    if (msg.startsWith("SUCCESS")) {
      console.log("----------手机订单提交成功----------");
    } else {
      if (msg.includes("对不起，系统繁忙，请稍候再试")) {
        console.log(msg);
        console.log("正在重试");
        return this.submitOrderFromMobile(data);
      }
      console.error(msg);
    }
  }

  cartBuyFromMobile(items: CartItem[]) {
    return this.submitOrderFromMobile({
      buyNow: "false",
      buyParam: items.map(({ settlement }) => settlement).join(","),
      spm: this.spm
    });
  }

  cartBuy(items: any[]) {
    if (this.mobile) {
      return this.cartBuyFromMobile(items);
    }
    return this.cartBuyFromPc(items);
  }

  async buyDirectFromPc(url: string, quantity: number) {
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
    console.log("进入订单结算页");
    try {
      var ret = await this.submitOrderFromPc(
        form,
        "https:" + tradeConfig[2],
        url
      );
      /* var ret = await this.req.post("https:" + tradeConfig[2], {
        form,
        qs: qs_data
      }); */
      console.log(ret);
    } catch (e) {
      console.error("订单提交出错", e);
    }
  }

  async buyDirectFromMobile(url: string, quantity: number) {
    var itemId = /id=(\d+)/.exec(url)![1];
    var text = await this.requestOnMobile(
      "https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdetail/6.0/",
      "get",
      {
        jsv: "2.4.8",
        appKey: "12574478",
        api: "mtop.taobao.detail.getdetail",
        v: "6.0",
        dataType: "jsonp",
        ttid: "2017@taobao_h5_6.6.0",
        AntiCreep: "true",
        type: "jsonp",
        callback: "mtopjsonp2"
      },
      { itemNumId: itemId }
    );
    var {
      data: {
        skuBase: { props, skus }
      }
    } = getJsonpData(text);
    var skuId = skus[0].skuId;
    // var xUid = getCookie("unb", this.cookie);
    await this.submitOrderFromMobile({
      buyNow: true,
      exParams: JSON.stringify({
        addressId: "9607477385",
        buyFrom: "tmall_h5_detail"
      }),
      itemId,
      quantity,
      serviceId: null,
      skuId: skuId
    });
  }

  appKey = "12574478";
  getSign(data: string, t: number) {
    var token = getCookie("_m_h5_tk", this.cookie);
    token = token && token.split("_")![0];
    var sign = signData([token, t, this.appKey, data].join("&"));
    return sign;
  }
  async requestOnMobile(
    url: string,
    method: "get" | "post",
    qs: Record<string, any>,
    data: Record<string, any>,
    ua?: string
  ): Promise<string> {
    var t = Date.now();
    var data_str = JSON.stringify(data);
    var form: Record<string, string> | undefined;
    qs.sign = this.getSign(data_str, t);
    qs.t = t;
    if (method === "get") {
      qs.data = data_str;
    } else {
      form = {
        data: data_str
      };
      if (ua) {
        form.ua = ua;
      }
    }
    return this.req(url, {
      method,
      form,
      qs
    });
  }
  async cartToggle(data: { items: any; checked: boolean }) {
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
}
