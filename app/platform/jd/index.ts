import { newPage } from "../../../utils/page";
import { Page } from "puppeteer";
import AutoShop from "../auto-shop";
import {
  setReq,
  toggleCartChecked,
  getShopJindou,
  getVideoHongbao,
  getCartList,
  getCommentList,
  addComment,
  addCart,
  delCart,
  updateCartQuantity
} from "./goods";
import jingdongHandlers from "./handlers";
import jingdongCouponHandlers from "./coupon-handlers";
import { resolveUrl } from "./tools";
import { isSubmitOrder } from "../../common/config";
import { delay, getCookie } from "../../../utils/tools";
import qs = require("querystring");
import { ArgBuyDirect, ArgOrder } from "../struct";

const getSkuId = (url: string) => {
  return /(\d+)\.html/.exec(url)![1];
};
const user = require("../../../.data/user.json");

export async function buy(page: Page) {
  if (page.url().startsWith("https://item.m.jd.com/")) {
    await page.click("#buyBtn2");
  } else {
    await page.click("#InitCartUrl");
  }
}

export async function addToCart(url: string, page: Page) {
  /* if (page.url().startsWith("https://item.m.jd.com/")){
    return page.click('#addCart2')
    } */
  var id = getSkuId(url);
  return page.goto(
    `https://cart.jd.com/gate.action?pid=${id}&pcount=1&ptype=1`
  );
}

export async function login(page: Page) {
  await page.goto("https://passport.jd.com/new/login.aspx");
  await page.click(".login-tab-r");
  await page.evaluate(() => {
    (<HTMLSpanElement>document.querySelector(".clear-btn")).click();
  });
  await page.type("#loginname", user.username);
  await page.type("#nloginpwd", user.password);
  await page.click("#loginsubmit");
  await page.waitForNavigation({
    timeout: 0
  });
}

export async function loginMobile(page: Page) {
  await page.goto(`https://plogin.m.jd.com/user/login.action`);
  await page.type("#username", user.username);
  await page.type("#password", user.password);
  await page.click("#loginBtn");
  // await page.click("a.quick-qq");
  await page.waitForNavigation();
}

export class Jindong extends AutoShop {
  constructor() {
    super({
      // ua: 'jdapp;iPhone;8.1.0;12.3.1;38276cc01428d153b8a9802e9787d279e0b5cc85;network/wifi;ADID/3D52573B-D546-4427-BC41-19BE6C9CE864;supportApplePay/3;hasUPPay/0;pushNoticeIsOpen/0;model/iPhone9,2;addressid/1091472708;hasOCPay/0;appBuild/166315;supportBestPay/0;pv/259.6;pap/JA2015_311210|8.1.0|IOS 12.3.1;apprpd/Home_Main;psn/38276cc01428d153b8a9802e9787d279e0b5cc85|1030;usc/pdappwakeupup_20170001;jdv/0|pdappwakeupup_20170001|t_335139774|appshare|CopyURL|1561092574799|1561092578;umd/appshare;psq/1;ucp/t_335139774;app_device/IOS;adk/;ref/JDMainPageViewController;utr/CopyURL;ads/;Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
      name: "jingdong",
      login_url:
        "https://wq.jd.com/mlogin/mpage/Login?rurl=https%3A%2F%2Fwqs.jd.com%2Fevent%2Fpromote%2Fmobile8%2Findex.shtml%3Fptag%3D17036.106.1%26ad_od%3D4%26cu%3Dtrue%26cu%3Dtrue%26utm_source%3Dkong%26utm_medium%3Djingfen%26utm_campaign%3Dt_2011246109_%26utm_term%3D5adc74e4969b47088e630d31139d99f1%26scpos%3D%23st%3D911",
      state_url:
        "https://home.m.jd.com/myJd/newhome.action?sid=a0726f04feb43ee99a9f7a4af7c605a3",
      handlers: jingdongHandlers,
      // https://m.jr.jd.com/member/rightsCenter/?cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=4fa157535d65429cbdd4a80e012d3f86#/
      coupon_handlers: jingdongCouponHandlers
    });
  }

  resolveUrl = resolveUrl;
  async resolveUrls(text: string) {
    var urls: string[] = [];
    text = text.trim();
    if (/\s/.test(text)) {
      urls = Array.from(text.match(/https?:\/\/\w+(?:\.\w+){2,}[-\w/.]*/g)!);
    } else {
      let url = await resolveUrl(text);
      urls.push(url);
    }
    return Promise.all(urls.map(this.resolveUrl));
  }
  coudan(items: string[]): Promise<any> {
    return this.cartBuy(undefined);
  }
  cartList() {
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
    for (let orderId of data.orderIds) {
      await addComment(orderId);
      await delay(3000);
    }
  }
  commentList(data: { page: number }): Promise<any> {
    // 5:已取消 6:已完成
    return getCommentList(6, data.page);
  }

  async buyDirect(data: ArgBuyDirect): Promise<any> {
    // var data = await getGoodsInfo(skuId);
    var res = this.getNextDataByGoodsInfo(
      { skuId: getSkuId(data.url) },
      data.quantity
    );
    return this.submitOrder(
      Object.assign(
        {
          data: res
        },
        data
      )
    );
  }

  async cartBuy(data: any) {
    return this.submitOrder({
      data: {
        submit_url: "https://p.m.jd.com/norder/order.action"
      },
      other: {}
    });
  }

  async getGoodsInfo(url: string, skus?: number[] | undefined): Promise<any> {
    return {
      skuId: getSkuId(url)
    };
  }

  getNextDataByGoodsInfo({ skuId }: any, quantity: number) {
    var submit_url =
      "https://wq.jd.com/deal/confirmorder/main?" +
      qs.stringify({
        sceneval: "2",
        bid: "",
        wdref: `https://item.m.jd.com/product/${skuId}.html`,
        scene: "jd",
        isCanEdit: "1",
        EncryptInfo: "",
        Token: "",
        commlist: [skuId, "", quantity, skuId, 1, 0, 0].join(","),
        locationid: (getCookie("jdAddrId", this.cookie) || "")
          .split("_")
          .slice(0, 3)
          .join("-"),
        type: "0",
        lg: "0",
        supm: "0"
      });
    return {
      submit_url
    };
  }

  async submitOrder(
    args: ArgOrder<{
      submit_url: string;
    }>
  ): Promise<any> {
    var page = await newPage();
    await page.goto(args.data.submit_url);
    if (typeof args.expectedPrice === "number") {
      let total = await page.evaluate(() =>
        Number(
          document
            .querySelector<HTMLElement>("#pageTotalPrice")!
            .getAttribute("price")
        )
      );
      if (args.expectedPrice < total) {
        page.close();
        throw new Error("太贵了");
      }
    }
    if (!isSubmitOrder) {
      await page.setOfflineMode(true);
    }
    await page.evaluate(pass => {
      document.querySelector<HTMLInputElement>("#shortPassInput")!.value = pass;
      document.querySelector<HTMLElement>("#btnPayOnLine")!.click();
    }, user.paypass);
    var res = await page.waitForResponse(res =>
      res.url().startsWith("https://wqdeal.jd.com/deal/msubmit/confirm?")
    );
    var text = await res.text();
    console.log(text);
    if (
      text.includes("您要购买的商品无货了") ||
      text.includes("多次提交过快，请稍后再试")
    ) {
      await page.close();
      await delay(2000);
      console.log("retry");
      return this.submitOrder(args);
    }
    await page.waitForNavigation();
    await page.close();
  }

  async start() {
    await super.start();
    // await this.preservePcState();
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

  async loginAction(page: Page) {
    await page.waitForNavigation({
      timeout: 0
    });
    await page.type("#username", user.username);
    await page.type("#password", user.password);
    await page.click("#loginBtn");
  }

  onFirstLogin() {
    getShopJindou();
    getVideoHongbao();
    this.req.get("https://vip.jd.com/sign/index");
  }

  onAfterLogin() {
    setReq(this.req, this.cookie);
  }
}
