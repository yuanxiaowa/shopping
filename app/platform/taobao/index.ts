import AutoShop from "../auto-shop";
import { getCookie, getCookieFilename } from "../../../utils/tools";
import { getPcCartInfo } from "./pc";
import { Page } from "puppeteer";
import taobaoHandlers from "./handlers";
import taobaoCouponHandlers from "./coupon-handlers";
import { resolveTaokouling, resolveUrl } from "./tools";
import {
  getGoodsInfo,
  setReq,
  addCart,
  getCartList,
  updateCart,
  cartToggle,
  seckillList,
  sixtyCourseList,
  sixtyCourseReply,
  submitOrder,
  comment,
  commentList
} from "./goods";

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
    if (/复制/.test(text) || !/https?:\/\//.test(text)) {
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
  commentList = commentList;
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

  cartBuyFromMobile(data) {
    return submitOrder(
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
      return submitOrder(data, other);
    }
    return this.submitOrderFromPc(data, other);
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

  async buyDirectFromMobile(args) {
    var data = await this.getGoodsInfo(args.url, args.skus);
    if (!data.buyEnable) {
      throw new Error(data.msg);
    }
    return submitOrder(
      this.getNextDataByGoodsInfo(data, args.quantity),
      args.other
    );
  }

  seckillList = seckillList;
  sixtyCourseList = sixtyCourseList;
  sixtyCourseReply = sixtyCourseReply;

  cartToggle = cartToggle;

  async loginAction(page: Page) {
    var res = await page.waitForResponse(res =>
      res.url().startsWith("https://img.alicdn.com/imgextra")
    );
    return res.url();
  }

  onAfterLogin() {
    setReq(this.cookie);
  }
}
