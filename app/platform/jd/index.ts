/*
 * @Author: oudingyin
 * @Date: 2019-07-01 09:10:22
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-19 09:48:23
 */
import { newPage } from "../../../utils/page";
import AutoShop from "../auto-shop";
import {
  calcPrice,
  getGoodsList,
  getStock,
  getGoodsCollection,
  delGoodsCollection
} from "./goods";
import jingdongHandlers from "./handlers";
import jingdongCouponHandlers from "./coupon-map";
import { resolveUrl, getSkuId, setReq } from "./tools";
import { delay } from "../../../utils/tools";
import cheerio = require("cheerio");
import { ArgBuyDirect, ArgOrder, ArgCoudan } from "../struct";
import {
  getCouponCenterQuanpinList,
  getCouponCenterQuanpin,
  getMyCoupons,
  getPlusQuanpinList,
  getPlusQuanpin
} from "./coupon-handlers";
import {
  getCartList,
  toggleCartChecked,
  addCart,
  delCart,
  updateCartQuantity
} from "./cart";
import { jingDongComment } from "./comment";
import { getShopJindou, getStoreCollection, delStoreCollection } from "./store";
import { jingDongOrder } from "./order";
import { login, loginAction } from "./member";
import setting from "./setting";

export class Jingdong extends AutoShop {
  state_other_urls = [
    "https://cart.jd.com/",
    "https://trade.jd.com/",
    "https://club.jd.com/"
  ];
  constructor() {
    super({
      // ua: 'jdapp;iPhone;8.1.0;12.3.1;38276cc01428d153b8a9802e9787d279e0b5cc85;network/wifi;ADID/3D52573B-D546-4427-BC41-19BE6C9CE864;supportApplePay/3;hasUPPay/0;pushNoticeIsOpen/0;model/iPhone9,2;addressid/1091472708;hasOCPay/0;appBuild/166315;supportBestPay/0;pv/259.6;pap/JA2015_311210|8.1.0|IOS 12.3.1;apprpd/Home_Main;psn/38276cc01428d153b8a9802e9787d279e0b5cc85|1030;usc/pdappwakeupup_20170001;jdv/0|pdappwakeupup_20170001|t_335139774|appshare|CopyURL|1561092574799|1561092578;umd/appshare;psq/1;ucp/t_335139774;app_device/IOS;adk/;ref/JDMainPageViewController;utr/CopyURL;ads/;Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
      name: "jingdong",
      login_url:
        "https://wq.jd.com/mlogin/mpage/Login?rurl=https%3A%2F%2Fwqs.jd.com%2Fevent%2Fpromote%2Fmobile8%2Findex.shtml%3Fptag%3D17036.106.1%26ad_od%3D4%26cu%3Dtrue%26cu%3Dtrue%26utm_source%3Dkong%26utm_medium%3Djingfen%26utm_campaign%3Dt_2011246109_%26utm_term%3D5adc74e4969b47088e630d31139d99f1%26scpos%3D%23st%3D911",
      state_urls: [
        "https://home.m.jd.com/myJd/newhome.action?sid=a0726f04feb43ee99a9f7a4af7c605a3"
      ],
      handlers: jingdongHandlers,
      // https://m.jr.jd.com/member/rightsCenter/?cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=4fa157535d65429cbdd4a80e012d3f86#/
      coupon_handlers: jingdongCouponHandlers
    });
  }

  resolveUrl = resolveUrl;
  getStock = getStock;
  coudan(data: ArgCoudan): Promise<any> {
    return jingDongOrder.coudan(data);
  }
  cartList(args: any) {
    return getCartList();
  }
  cartToggle(data): Promise<any> {
    return toggleCartChecked(data);
  }
  cartToggleAll(data) {
    return toggleCartChecked(
      Object.assign(data, {
        items: []
      })
    );
  }
  cartAdd(data: any): Promise<any> {
    let skuId = getSkuId(data.url);
    return addCart(skuId, data.quantity);
  }
  async cartDel(data: any) {
    return delCart(data);
  }
  async cartUpdateQuantity(data: any): Promise<any> {
    return updateCartQuantity(data);
  }
  async comment(data: any): Promise<any> {
    return Promise.all(
      data.orderIds.map(orderId => jingDongComment.addComment(orderId))
    );
  }
  async commentList(data: { page: number; type: number }): Promise<any> {
    // 2:待收货 3:全部 5:已取消 6:已完成 7:有效订单 8:待评价
    // return getCommentList(data.type, data.page);
    // var page = await newPage();
    var text = await setting.req.get(
      `https://club.jd.com/myJdcomments/myJdcomment.action?sort=0&page=${data.page}`
    );
    // var text = await page.content();
    // page.close();
    /* var text = await this.req.get(
      "https://club.jd.com/myJdcomments/myJdcomment.action"
    ); */
    var $ = cheerio.load(text);
    var items = $(".tr-th")
      .map((i, ele) => {
        var $tbody = $(ele).parent();
        var items = $tbody
          .find(".tr-bd")
          .map((i, ele) => {
            var $ele = $(ele);
            var img = $ele.find("img").attr("src");
            var $a = $ele.find("a");
            return {
              id: /(\d+)/.exec($a.attr("href"))![1],
              title: $a.text().trim(),
              img,
              url: $a.attr("href")
            };
          })
          .get();
        var id = /ruleid=(\w+)/.exec($tbody.find(".btn-def").attr("href"))![1];
        return {
          id,
          items
        };
      })
      .get();
    var $cur = $(".ui-page-curr");
    return {
      page: data.page,
      items,
      more: $cur.next().attr("href") !== "#none"
    };
  }

  buyDirect(args: ArgBuyDirect, p?: Promise<void>): Promise<any> {
    return jingDongOrder.buyDirect(args, p);
  }

  cartBuy(data: any, p: Promise<void>) {
    return jingDongOrder.cartBuy(data, p);
  }

  async getGoodsInfo(url: string, skus?: number[] | undefined): Promise<any> {
    return {
      skuId: getSkuId(url)
    };
  }

  goodsList = getGoodsList;

  async calcPrice(args: { url: string }) {
    return calcPrice({
      skuId: getSkuId(args.url),
      ...args
    });
  }

  getNextDataByGoodsInfo(data: any, quantity: number, isSeckill = false) {
    return jingDongOrder.getNextDataByGoodsInfo(data, quantity, isSeckill);
  }

  getMyCoupons = getMyCoupons;
  getPlusQuanpinList = getPlusQuanpinList;
  getPlusQuanpin = getPlusQuanpin;
  getStoreCollection = getStoreCollection;
  getGoodsCollection = getGoodsCollection;
  delStoreCollection = delStoreCollection;
  delGoodsCollection = delGoodsCollection;

  async start() {
    await super.start();
    await this.preservePcState();
    this.onFirstLogin();
  }

  async preservePcState() {
    var page = await newPage();
    var b = await this.checkUrl("https://home.jd.com/", page);
    setTimeout(
      this.preservePcState.bind(this),
      this.interval_check + 1000 * 60 * 5
    );
    if (!b) {
      await login(page);
    }
    await page.close();
  }

  loginAction = loginAction;

  onFirstLogin() {
    getShopJindou();
    // getVideoHongbao();
    setting.req.get("https://vip.jd.com/sign/index");
    getCouponCenterQuanpinList().then(async couponList => {
      for (let item of couponList) {
        await getCouponCenterQuanpin(item.key).then(console.log);
        delay(1000);
      }
    });
  }

  onAfterLogin() {
    setReq();
  }
}
