import AutoShop from "../auto-shop";
import {
  getCookie,
  getJsonpData,
  getCookieFilename
} from "../../../utils/tools";
import signData from "./h";
import { getMobileCartList, getMobileGoodsInfo } from "./mobile";
import { getPcCartInfo } from "./pc";
import { Page } from "puppeteer";
import taobaoHandlers from "./handlers";
import taobaoCouponHandlers from "./coupon-handlers";
import { resolveTaokouling, resolveUrl } from "./tools";
import { isSubmitOrder } from "../../common/config";
import moment = require("moment");

const getItemId = (url: string) => /id=(\d+)/.exec(url)![1];
var request_tags = {
  agencyPay: true,
  coupon: true,
  deliveryMethod: true,
  promotion: true,
  service: true,
  address: true,
  voucher: true
};

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
  resolveUrl = resolveUrl;
  async resolveUrls(text: string): Promise<string[]> {
    var urls: string[] = [];
    if (!/https?:/.test(text)) {
      // let tkl_e = /(￥\w+￥)/.exec(text);
      let url = await resolveTaokouling(text);
      urls.push(url);
    } else {
      urls = text.match(/https?:\/\/\w+(?:\.\w+){2,}[^ ]*/)!;
    }
    return Promise.all(urls.map(resolveUrl));
  }

  async cartList() {
    var items;
    if (this.mobile) {
      items = await this.cartListFromMobile();
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
    var itemId;
    var skuId;
    if (/skuId=(\d+)/.test(args.url)) {
      skuId = RegExp.$1;
      itemId = /id=(\d+)/.exec(args.url)![1];
    } else {
      var res = await this.getGoodsInfo(args.url, args.skus);
      skuId = res.skuId;
      itemId = res.itemId;
    }
    var text = await this.requestOnMobile(
      "https://h5api.m.tmall.com/h5/mtop.trade.addbag/3.1/",
      "post",
      {
        jsv: "2.4.8",
        appKey: this.appKey,
        api: "mtop.trade.addBag",
        v: "3.1",
        ecode: "1",
        type: "originaljson",
        ttid: "tmalldetail",
        dataType: "jsonp"
      },
      {
        itemId,
        quantity: args.quantity,
        exParams: JSON.stringify({
          addressId: "9607477385",
          etm: "",
          buyNow: "true",
          _input_charset: "utf-8",
          areaId: "320583",
          divisionId: "320583"
        }),
        skuId
      }
    );
    let { data, ret } = JSON.parse(text);
    if (ret[0].startsWith("SUCCESS")) {
      return data.cartId;
    }
    throw new Error(data.msg);
  }
  cartDel(data: any): Promise<any> {
    return this.cartUpdate(data, "deleteSome");
  }
  async cartUpdateQuantity(data) {
    this.cartUpdate(data, "update");
  }
  async cartUpdate({ items }: any, action: string): Promise<any> {
    var { cartId, quantity } = items[0];
    var {
      data: { hierarchy, data }
    }: any = await this.cartListRawFromMobile();
    var updateKey = Object.keys(data).find(
      key => data[key].fields.cartId === cartId
    )!;
    var key = Object.keys(hierarchy.structure).find(key =>
      hierarchy.structure[key].includes(updateKey)
    )!;
    var cdata = hierarchy.structure[key].reduce((state, key) => {
      var { fields } = data[key];
      state[key] = {
        fields: {
          bundleId: fields.bundleId,
          cartId: fields.cartId,
          checked: fields.checked,
          itemId: fields.itemId,
          quantity: fields.quantity.quantity,
          shopId: fields.shopId,
          valid: fields.valid
        }
      };
      return state;
    }, {});
    cdata[updateKey].fields.quantity = quantity;
    var text = await this.requestOnMobile(
      "https://acs.m.taobao.com/h5/mtop.trade.updatebag/4.0/",
      "post",
      {
        jsv: "2.3.26",
        appKey: "12574478",
        api: "mtop.trade.updateBag",
        v: "4.0",
        type: "originaljson",
        dataType: "json",
        isSec: "0",
        ecode: "1",
        AntiFlood: "true",
        AntiCreep: "true",
        H5Request: "true",
        LoginRequest: "true"
      },
      {
        p: JSON.stringify({
          data: cdata,
          operate: { [action]: [updateKey] },
          hierarchy
        }),
        extStatus: "0",
        feature: '{"gzip":false}',
        exParams: JSON.stringify({
          mergeCombo: "true",
          version: "1.0.0",
          globalSell: "1",
          spm: this.spm,
          cartfrom: "detail"
        }),
        spm: this.spm,
        cartfrom: "detail"
      }
    );
    var { data, ret } = JSON.parse(text);
    if (ret[0].startsWith("SUCCESS")) {
      return data.cartId;
    }
    throw new Error(data.msg);
  }
  comment(data: any): Promise<any> {
    /* this.req.post("", {
      form: {
        callback: "RateWriteCallback548",
        _tb_token_: "edeb7b783ff65",
        um_token: "T0eb928a011b00316c98a9fed9edb4b2b",
        action: "new_rate_write_action",
        event_submit_do_write: "any",
        sellerId: "2200811872345",
        bizOrderIdList: "492409251844405857",
        itemId492409251844405857: "591795307112",
        eventId492409251844405857: "",
        parentOrderId: "492409251844405857",
        qualityContent492409251844405857: "fdsfdsafdsaf",
        serviceContent492409251844405857: "fdsaf",
        Filedata: "",
        urls: "",
        merDsr492409251844405857: "5",
        serviceQualityScore: "5",
        saleConsignmentScore: "5",
        anony: "1",
        ishares: "",
        ua:
          "118#ZVWZz7teaQVZ0e/LdH2mpZZTZsHhce/ezeVnvsqTzHRzZRbZXoTXOrezpgqTVHR4Zg2ZOzqTze0cZgYUHDqVze2zZCFhXHvnzhtZZzu7zeRZZgZZ2Yq4zH2zgeu1THWVZZ2ZZ2HhzHRzVgzYcoqVze2ZZVbhXHJmgiguZaq2zeRZZgZZfDqVzOqZzeZ4yH1JZBD1c78nByRuZZYCXfqYZH2zZZCTcHCVx20rEfqhzHWxzZZZV5q44aPiueZhXTVHZg2ZumqTzeRzZZZuVfq4zH2ZZZFhVHW4ZZ2uZ0bTzeRzZZZZ23Z4ze2zZZuXTiXejg2ZjUi5zPErwZubQozqF00nMWTKzLQvxN9m3LIVTHjaVcjjc2L3sKqSh8gTP5S8FDpKyTHCugZCmrDtKHZzhaquuI0DRgZTlItysC/ATH+z8N2Crbz04R4GIE3fdf3gV2gbTR2B7+zF3qqMmOW3N4mlfO6N1SuNkGAumAnxsKbe43gCE87ooXXoLBK3lPdtfJk4fgNaaid3jZa5RF8Y2HhI1WMgXAaXoZuDzJi8DMJT31BZjQHGH2432fvCzMLqB2yvwTQni66GyfOOVCFmOWAV0r+PqIDp5hZ1eB5Bn+p7OMJZSthhoMbH6k0vVh9Quf4xEHzfWFoHsYEPPDKiX23KElhfshnArhpIViJU4HlG5zsJuLxlGC7bW5Oltr5xn91jM4b4w44HlbDpVR9JXL2IQRJRJDV7xegJS2PZd/mtYaf0yA7dr8hb8PGj6N4Snl9fzfvVBqKY7XK/R41in/X1d+tazXEIugNPh4B8nxoRAYgk09rbCXRmoc+ffVjbrkh9hwIywk0m/xX4aP4z0jkihzBTyLDdz3xOp7FdrIbfBA0xlcfAftRigVieQTOVzg==",
        "492409251844405857_srNameList": ""
      }
    }); */
    throw new Error("Method not implemented.");
  }
  commentList(): Promise<any> {
    throw new Error("Method not implemented.");
  }
  buyDirect(data: {
    url: string;
    quantity: number;
    skus?: number[];
    other?: any;
  }): Promise<any> {
    if (this.mobile) {
      return this.buyDirectFromMobile(data);
    }
    return this.buyDirectFromPc(data);
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
    {
      form,
      addr_url,
      Referer
    }: {
      form: Record<string, any>;
      addr_url: string;
      Referer: string;
    },
    other: any = {}
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
      return this.submitOrderFromPc({ form, addr_url, Referer });
    }
  }

  async cartBuyFromPc(
    goods: {
      sellerId: string;
      cartId: string;
      skuId: string;
      itemId: string;
      quantity: number;
      createTime: string;
      attr: string;
    }[]
  ) {
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
    await this.submitOrderFromPc({
      form,
      addr_url: `https://buy.tmall.com/order/confirm_order.htm?spm=${this.spm}`,
      Referer: `https://cart.taobao.com/cart.htm?spm=a21bo.2017.1997525049.1.5af911d9eInVdr&from=mini&ad_id=&am_id=&cm_id=`
    });
  }

  spm = "a222m.7628550.0.0";
  async cartListFromMobile() {
    return getMobileCartList(await this.cartListRawFromMobile());
  }
  async cartListRawFromMobile() {
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
    return getJsonpData(text);
  }
  async submitOrderFromMobile(data: any, other: any = {}) {
    // other.memo other.ComplexInput
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
      return this.submitOrderFromMobile(data, other);
    }
    console.log("-------------进入手机订单结算页，准备提交-------------");
    var {
      data: {
        data,
        linkage,
        hierarchy: { structure, root }
      }
    } = text;
    var invalids = structure[root].filter(name => name.startsWith("invalid"));
    if (invalids.length > 0) {
      this.logFile(text, "提交失败，不能提交");
      throw new Error("有失效宝贝");
    }
    var orderData = Object.keys(data).reduce(
      (state, name) => {
        var item = data[name];
        item._request = request_tags[item.tag];
        if (item.submit) {
          item.fields.value = other[item.tag];
          state[name] = item;
        }
        return state;
      },
      <any>{}
    );
    var submitOrder = data.submitOrder_1;
    var realPay = data.realPay_1;
    var address = data.address_1;
    realPay.fields.currencySymbol = "￥";
    submitOrder._realPay = realPay;
    if (address) {
      let { fields } = address;
      fields.info = {
        value: fields.options[0].deliveryAddressId
      };
      fields.url =
        "//buy.m.tmall.com/order/addressList.htm?enableStation=true&requestStationUrl=%2F%2Fstationpicker-i56.m.taobao.com%2Finland%2FshowStationInPhone.htm&_input_charset=utf8&hidetoolbar=true&bridgeMessage=true";
      fields.title = "管理收货地址";
      submitOrder._address = address;
    }
    var coupon = data.coupon_3;
    if (coupon && coupon.fields.totalValue) {
      coupon.fields.value = "-" + /￥(.*)/.exec(coupon.fields.totalValue)![1];
    }
    var ua = "";
    var postdata = {
      params: JSON.stringify({
        data: JSON.stringify(orderData),
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
    };
    this.logFile(JSON.stringify(postdata), "订单结算页提交的数据");
    if (!isSubmitOrder) {
      return;
    }
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
      postdata,
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
        return this.submitOrderFromMobile(data, other);
      }
      console.error(msg);
    }
  }

  cartBuyFromMobile(data) {
    return this.submitOrderFromMobile(
      {
        buyNow: "false",
        buyParam: data.items.map(({ settlement }) => settlement).join(","),
        spm: this.spm
      },
      data.other
    );
  }

  cartBuy(items: any[]) {
    if (this.mobile) {
      return this.cartBuyFromMobile(items);
    }
    return this.cartBuyFromPc(items);
  }

  async buyDirectFromPc({
    url,
    quantity
  }: {
    url: string;
    quantity: number;
    other?: any;
  }) {
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
      var ret = await this.submitOrderFromPc({
        form,
        addr_url: "https:" + tradeConfig[2],
        Referer: url
      });
      /* var ret = await this.req.post("https:" + tradeConfig[2], {
        form,
        qs: qs_data
      }); */
      console.log(ret);
    } catch (e) {
      console.error("订单提交出错", e);
    }
  }

  submitOrder(data, other: any = {}) {
    if (this.mobile) {
      return this.submitOrderFromMobile(data, other);
    }
    return this.submitOrderFromPc(data, other);
  }

  async getGoodsInfo(url: string, skus?: number[]) {
    return this.getGoodsInfoFromMobile(url, skus);
  }

  async getGoodsInfoFromMobile(url: string, skus?: number[]) {
    var itemId = getItemId(url);
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
    return getMobileGoodsInfo(text, skus);
  }

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

  async buyDirectFromMobile(args) {
    var data = await this.getGoodsInfo(args.url, args.skus);
    if (!data.buyEnable) {
      throw new Error(data.msg);
    }
    return this.submitOrderFromMobile(
      this.getNextDataByGoodsInfo(data, args.quantity),
      args.other
    );
  }

  async requestOnMobileShort(api: string, data) {
    var text: string = await this.requestOnMobile(
      `https://h5api.m.tmall.com/h5/${api}/1.0`,
      "get",
      {
        jsv: "2.4.16",
        appKey: "12574478",
        api,
        v: "1.0",
        timeout: "3000",
        type: "json",
        dataType: "json"
      },
      data
    );
    return JSON.parse(text);
  }

  async seckillList(name: string) {
    if (name === "chaoshi") {
      let {
        data: {
          resultValue: { data }
        }
      } = await this.requestOnMobileShort(
        "mtop.tmall.kangaroo.core.service.route.PageRecommendService",
        {
          url:
            "https://pages.tmall.com/wow/chaoshi/act/wupr?ut_sk=1.WkOnn8QgYxYDAC42U2ubIAfi_21380790_1563192248243.Copy.chaoshi_act_page_tb&__share__id__=1&share_crt_v=1&disableNav=YES&wh_pid=act%2Fxsj23874&tkFlag=1&disableAB=true&suid=1031708C-2844-47E2-B140-3CF358C1BD43&type=2&sp_tk=77%2BlelYxOVlob1FlTkrvv6U%3D&sourceType=other&tk_cps_param=127911237&un=04ec1ab5583d2c369eedd86203cf18d8&utparam=%7B%22ranger_buckets%22%3A%223042%22%7D&e=PlboetXBlJK4bXDJ8jCpJrfVFcC6KYAblz9f5x7nqEUPJTSplvxzY6R06N4nt-6t_nNM24L0rnGF2sp581q3i4RqxKSGsgCT8sviUM61dt2gxEj7ajbEb4gLMZYNRhg2HXKHH0u77i-I6M_vqqSeLITsM14S2xgDx9iN37b51zJw2qH-L52L1aTWVSTo88aBYOGm2rjvgGhaQJhxUPUeEtKYMBXg69krrlYyo_QbwE_DG_1N5hlzNg&ttid=201200%40taobao_iphone_8.8.0&cpp=1&shareurl=true&spm=a313p.22.kp.1050196516672&short_name=h.eS0ZZuy&sm=933952&app=chrome",
          cookie: "sm4=320506;hng=CN|zh-CN|CNY|156",
          device: "phone",
          backupParams: "device"
        }
      );
      let key = Object.keys(data).find(key => data[key].secKillItems);
      if (key) {
        let secKillItems = data[key].secKillItems;
        let mapping = {};
        for (let item of secKillItems) {
          let { secKillTime } = item;
          let secKillTimeArr = secKillTime.split(",");
          secKillTimeArr.forEach(t => {
            var data = {
              id: item.itemId,
              quantity: item.itemNum,
              title: item.itemTitle,
              itemSecKillPrice: item.itemSecKillPrice,
              price: item.itemTagPrice
            };
            if (!mapping[t]) {
              mapping[t] = [data];
            } else {
              mapping[t].push(data);
            }
          });
        }
        return Object.keys(mapping)
          .sort()
          .map(time => ({
            time,
            items: mapping[time]
          }));
      }
    }
    return [];
  }
  async sixtyCourseList() {
    var html: string = await this.req.get(
      "https://pages.tmall.com/wow/fsp/act/60sclass?q=%E5%A4%A9%E7%8C%AB60%E7%A7%92%E8%AF%BE%E5%A0%82&isFull=true&pre_rn=c21dff5a538d1c77a9e5c29674eefe94&scm=20140655.sc_c21dff5a538d1c77a9e5c29674eefe94"
    );
    var r = /<textarea style="display: none" class="vue-comp-data">(.*)<\/textarea>/g;
    r.test(html);
    var text = r.exec(html)![1];
    var {
      $root: {
        moqieDataWl: { jsonStr }
      }
    } = JSON.parse(text.replace(/&quot;/g, '"'));
    var {
      content: { areas }
    } = JSON.parse(jsonStr);
    var actIds = Object.keys(areas).map(
      key => /actId=(\w+)/.exec(areas[key].data.href)![1]
    );
    return Promise.all(
      actIds.map(async actId => {
        var {
          data: { answerDate, answered, courseVOList, sellerId, lotteryCount }
        }: {
          data: {
            answerDate?: string[];
            answered: ("true" | "false")[];
            sellerId: string;
            lotteryCount: string;
            courseVOList: {
              id: string;
              desc: string;
              options: Record<string, string>;
            }[];
          };
        } = await this.requestOnMobileShort(
          "mtop.tmall.fansparty.sixty.getAct",
          {
            actId
          }
        );
        var finished = !answered.includes("false");
        var todayAnswered = false;
        var options = {};
        var title = "";
        var courseId = "";
        if (!finished) {
          var i = 0;
          moment.duration(1, "d");
          if (answerDate) {
            todayAnswered =
              moment().diff(
                moment(
                  answerDate[answerDate.length - 1].split(" ")[0],
                  "yyyy-MM-DD"
                )
              ) <= moment.duration(1, "days").asMilliseconds();

            if (todayAnswered) {
              i = answerDate.length - 1;
            } else {
              i = answerDate.length;
            }
          }
          title = courseVOList[i].desc;
          courseId = courseVOList[i].id;
          options = courseVOList[i].options;
        }
        return {
          actId,
          finished,
          todayAnswered,
          title,
          options,
          courseId,
          sellerId,
          lotteryCount: Number(lotteryCount)
        };
      })
    );
  }
  async sixtyCourseReply({
    actId,
    courseId,
    option,
    sellerId,
    todayAnswered,
    finished
  }: {
    actId: string;
    courseId: string;
    option: string;
    sellerId: string;
    todayAnswered: boolean;
    finished: boolean;
  }) {
    if (!finished && !todayAnswered) {
      let { data, ret } = await this.requestOnMobileShort(
        "mtop.tmall.fansparty.sixty.answer",
        {
          actId,
          courseId,
          option
        }
      );

      if (data.result !== "true") {
        throw new Error(ret[0]);
      }
    }
    var { data } = await this.requestOnMobileShort(
      "mtop.tmall.fansparty.sixty.getlotterytoken",
      { actId, lotteryType: "shareLottery" }
    );
    var token = data.result;
    var res1 = await this.requestOnMobileShort(
      "mtop.tmall.fansparty.fansday.superfansinvation.getinvitation",
      {
        sellerId,
        actId,
        token
      }
    );
    var res2 = await this.requestOnMobileShort(
      "mtop.tmall.caitlin.relation.common.follow",
      {
        targetId: sellerId,
        followTag: "fans-lucky-draw",
        source: "fans-lucky-draw",
        bizName: "fansparty"
      }
    );
    var res3 = await this.requestOnMobileShort(
      "mtop.tmall.fansparty.fansday.superfansinvation.openinvitation",
      {
        sellerId,
        actId,
        token
      }
    );
    var {
      data: { awards }
    } = res3;
    return awards;
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

  async onBeforeLogin(page: Page) {
    await page.evaluate(() => {
      document
        .querySelector<HTMLImageElement>("#J_QRCodeImg")!
        .scrollIntoView();
    });
    let img = await page.$("#J_QRCodeImg");
    await img!.screenshot({
      path: ".data/qrcode.png",
      omitBackground: true
    });
  }
}
