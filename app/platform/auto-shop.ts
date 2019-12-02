/*
 * @Author: oudingyin
 * @Date: 2019-07-01 09:10:22
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-03 16:26:49
 */
import { Page } from "puppeteer";
import { newPage } from "../../utils/page";
import { ArgBuyDirect, ArgCartBuy, ArgSearch, ArgCoudan } from "./struct";
import { jar, global_req } from "../common/config";
import { Cookie } from "tough-cookie";
import { timer } from "../../utils/decorators";

interface AutoShopOptions {
  name: string;
  ua?: string;
  state_urls: string[];
  login_url: string;
  handlers: Record<
    string,
    {
      test(url: string): boolean;
      handler(num: number, page: Page): Promise<any>;
    }
  >;
  coupon_handlers: Record<
    string,
    {
      test(url: string): boolean;
      handler(url: string): Promise<any>;
    }
  >;
}

export default abstract class AutoShop implements AutoShopOptions {
  login_url!: string;
  name!: string;
  ua?: string;
  state_urls!: string[];
  handlers!: Record<
    string,
    {
      test(url: string): boolean;
      handler(num: number, page: Page): Promise<any>;
    }
  >;
  coupon_handlers!: Record<
    string,
    { test(url: string): boolean; handler(url: string): Promise<any> }
  >;
  onAfterLogin() {}
  constructor(data: AutoShopOptions) {
    Object.assign(this, data);
    this.init();
  }
  abstract resolveUrl(url: string): Promise<string>;
  async qiangquan(url: string): Promise<string | Page | undefined> {
    for (let key in this.coupon_handlers) {
      if (this.coupon_handlers[key].test(url)) {
        return this.coupon_handlers[key].handler(url);
      }
    }
  }
  abstract coudan(data: ArgCoudan): Promise<any>;
  abstract cartList(args: { from_pc: boolean }): Promise<any>;
  abstract cartBuy(data: ArgCartBuy, p?: Promise<void>): Promise<any>;
  async cartToggle(data: { items: any; checked: boolean }): Promise<any> {}
  async cartToggleAll(data: any): Promise<any> {}
  abstract cartAdd(data: any): Promise<any>;
  abstract cartDel(data: any): Promise<any>;
  abstract cartUpdateQuantity(data: any): Promise<any>;
  abstract comment(data: any): Promise<any>;
  abstract commentList(data: { page: number; type: number }): Promise<any>;
  abstract buyDirect(data: ArgBuyDirect, p?: Promise<void>): Promise<any>;
  abstract goodsDetail(url: string): Promise<any>;
  async seckillList(name: string): Promise<any> {}
  abstract goodsList(args: ArgSearch): Promise<any>;
  async testOrder(args: { file: string }): Promise<any> {}
  async coupons(args: { page: number }): Promise<any> {}
  async calcPrice(args: { url: string }): Promise<any> {}
  abstract getStoreCollection(page?: number): Promise<any>;
  abstract getGoodsCollection(page?: number): Promise<any>;
  abstract delStoreCollection(items: any[]): Promise<any>;
  abstract delGoodsCollection(items: any[]): Promise<any>;
  getCollection(arg: { type: "store" | "goods"; page: number }) {
    if (arg.type === "store") {
      return this.getStoreCollection(arg.page);
    }
    return this.getGoodsCollection(arg.page);
  }
  delCollection(arg: { type: "store" | "goods"; items: any[] }) {
    if (arg.type === "store") {
      return this.delStoreCollection(arg.items);
    }
    return this.delGoodsCollection(arg.items);
  }

  async loginAction(page: Page): Promise<any> {
    /* return page.waitForNavigation({
      timeout: 0
    }); */
  }
  is_prev_login = true;
  async login(page: Page, cb?: Function) {
    this.is_prev_login = false;
    page.goto(this.login_url);
    let p = this.loginAction(page);
    (async () => {
      await p;
      await page.waitForNavigation({
        timeout: 0
      });
      for (let state_url of this.state_urls) {
        await page.goto(state_url);
      }
      cb && cb();
      this.is_prev_login = true;
    })();
    return p;
  }
  async start() {
    return this.preserveState();
  }
  async checkUrlFromPage(url: string): Promise<any> {
    let page = await newPage();
    try {
      await page.goto(url);
      return page.url() === url;
    } finally {
      page.close();
    }
  }
  async checkUrlFromApi(url: string): Promise<any> {
    let p = global_req.get(url);
    await p;
    return p.href === url;
  }
  isFirstCheck = true;
  @timer(1000 * 10 * 60)
  private async preserveState() {
    var logined = false;
    if (this.isFirstCheck) {
      logined = await this.checkUrlFromPage(this.state_urls[0] /* , page */);
      if (logined) {
        await this.setDatas();
      }
      this.isFirstCheck = false;
    } else {
      logined = await this.checkUrlFromApi(this.state_urls[0]);
      if (!logined) {
        logined = await this.checkUrlFromPage(this.state_urls[0] /* , page */);
        if (logined) {
          await this.setDatas();
        }
      }
    }
    if (logined === false) {
      var page = await newPage();
      try {
        setTimeout(() => {
          if (!this.is_prev_login) {
            page.close();
          }
        }, 2 * 60 * 1000);
        await new Promise(resolve => {
          this.login(page, resolve);
        });
        await this.setDatas();
      } catch (e) {
      } finally {
        page.close();
      }
      return;
    }
    // await page.goto(this.state_url);
    // console.log(await page.cookies());
    // if (this.state_other_urls) {
    //   for (let url of this.state_other_urls) {
    //     await page.goto(url);
    //   }
    // }
  }
  setCookies(cookies: any[], url: string) {
    var t = new Date("2018-12-31 23:59:59");
    cookies.forEach(item => {
      jar.setCookie(
        new Cookie({
          key: item.name,
          value: item.value,
          domain: item.domain,
          path: item.path,
          // expires: item.expires < t ? undefined : new Date(item.expires),
          httpOnly: item.httpOnly,
          secure: item.secure
        }).toString(),
        url
      );
    });
  }
  init() {}
  async checkStatus() {
    var logined = false;
    if (this.isFirstCheck) {
      logined = await this.checkUrlFromPage(this.state_urls[0] /* , page */);
      if (logined) {
        await this.setDatas();
      }
      this.isFirstCheck = false;
    } else {
      logined = await this.checkUrlFromApi(this.state_urls[0]);
      if (!logined) {
        logined = await this.checkUrlFromPage(this.state_urls[0] /* , page */);
        if (logined) {
          await this.setDatas();
        }
      }
    }
    var p: any;
    if (logined === false) {
      let page = await newPage();
      p = await this.login(page, () =>
        this.setDatas().then(() => page.close())
      );
    } else {
      // this.setDatas(page).then(() => page.close());
      return logined;
    }
    return p;
  }

  async setDatas() {
    var page = await newPage();
    try {
      for (let state_url of this.state_urls) {
        await page.goto(state_url);
        var cookies = await page.cookies();
        this.setCookies(cookies, page.url());
      }
      this.onAfterLogin();
    } finally {
      page.close();
    }
  }
}
