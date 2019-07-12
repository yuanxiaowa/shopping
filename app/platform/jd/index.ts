import { newPage } from "../../../utils/page";
import { Page } from "puppeteer";
import AutoShop from "../auto-shop";
import {
  setReq,
  toggleCartChecked,
  getShopJindou,
  getVideoHongbao,
  getCartList
} from "./goods";
import jingdongHandlers from "./handlers";
import jingdongCouponHandlers from "./coupon-handlers";
import { resolveUrl } from "./tools";
import { isSubmitOrder } from "../../common/config";
import { delay, getCookieFilename } from "../../../utils/tools";

const user = require("./user.json");

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
  var id = /(\d+)/.exec(url)![1];
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
  await page.waitForNavigation();
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
      cookie_filename: getCookieFilename("jd-goods"),
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
    return urls;
  }
  coudan(items: [string, number][]): Promise<any> {
    throw new Error("Method not implemented.");
  }
  cartList() {
    return getCartList();
  }
  cartToggle(data: { items: any; checked: boolean }): Promise<any> {
    return toggleCartChecked(data.items, data.checked);
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
    throw new Error("Method not implemented.");
  }
  async cartBuy(data: any) {
    var page = await newPage();
    await page.goto("https://p.m.jd.com/norder/order.action");
    if (!isSubmitOrder) {
      await page.setOfflineMode(true);
    }
    await page.evaluate(() => {
      document.querySelector<HTMLInputElement>("#shortPassInput")!.value =
        "870092";
      document.querySelector<HTMLElement>("#btnPayOnLine")!.click();
    });
    // page.click("#btnPayOnLine");
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
      return this.cartBuy(data);
    }
    // await page.waitForNavigation();
    await page.close();
    // return submitOrder();
  }

  async start() {
    await super.start();
    this.preservePcState();
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
    await page.type("#username", user.username);
    await page.type("#password", user.password);
    await page.click("#loginBtn");
  }

  afterLogin() {
    setReq(this.req, this.cookie);
    getShopJindou();
    getVideoHongbao();
  }
}
