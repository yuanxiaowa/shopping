/*
 * @Author: oudingyin
 * @Date: 2019-07-01 09:10:22
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-02 18:13:17
 */
import { RequestAPI, RequiredUriUrl, Response } from "request";
import request = require("request-promise-native");
import { RequestPromise, RequestPromiseOptions } from "request-promise-native";
import { writeFile, ensureDir, readFileSync } from "fs-extra";
import { Page } from "puppeteer";
import { newPage, getPageCookie } from "../../utils/page";
import iconv = require("iconv-lite");
import cookieManager, { Cookie } from "../common/cookie-manager";
import {
  ArgBuyDirect,
  ArgOrder,
  ArgCartBuy,
  ArgSearch,
  ArgCoudan
} from "./struct";

interface AutoShopOptions {
  name: string;
  ua?: string;
  state_url: string;
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
  ua =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1";
  state_url!: string;
  handlers!: Record<
    string,
    {
      test(url: string): boolean;
      handler(num: number, page: Page): Promise<any>;
    }
  >;
  state_other_urls?: string[];
  coupon_handlers!: Record<
    string,
    { test(url: string): boolean; handler(url: string): Promise<any> }
  >;
  req!: RequestAPI<RequestPromise<any>, RequestPromiseOptions, RequiredUriUrl>;
  cookie!: string;
  cookier!: Cookie;
  interval_check = 1000 * 60 * 60;
  onAfterLogin() {}
  constructor(data: AutoShopOptions) {
    Object.assign(this, data);
    this.init();
  }
  setCookie(cookie: string) {
    this.cookie = cookie;
    var opts: RequestPromiseOptions = {
      headers: {
        "Accept-Encoding": "br, gzip, deflate",
        Cookie: cookie,
        // Accept: '*/*',
        "User-Agent": this.ua
        // Referer: 'https://bean.m.jd.com/continuity/index',
        // 'Accept-Language': 'en-us'
      },
      gzip: true,
      encoding: null,
      transform(body: any, { headers }: Response) {
        var ctype = headers["content-type"]!;
        if (/charset=([-\w]+)/i.test(ctype)) {
          if (RegExp.$1 && RegExp.$1.toLowerCase() !== "utf-8") {
            return iconv.decode(body, RegExp.$1);
          }
        }
        if (body instanceof Buffer) {
          return String(body);
        }
        return body;
      },
      jar: request.jar()
    };
    this.req = request.defaults(opts);
    cookieManager[this.name].set(cookie);
    this.onAfterLogin();
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
  abstract cartBuy(data: ArgCartBuy): Promise<any>;
  async cartToggle(data: { items: any; checked: boolean }): Promise<any> {}
  async cartToggleAll(data: any): Promise<any> {}
  abstract cartAdd(data: any): Promise<any>;
  abstract cartDel(data: any): Promise<any>;
  abstract cartUpdateQuantity(data: any): Promise<any>;
  abstract comment(data: any): Promise<any>;
  abstract commentList(data: { page: number; type: number }): Promise<any>;
  abstract buyDirect(data: ArgBuyDirect, p?: Promise<void>): Promise<any>;
  abstract getGoodsInfo(url: string, skus?: number[]): Promise<any>;
  abstract submitOrder(data: ArgOrder<any>): Promise<any>;
  async seckillList(name: string): Promise<any> {}
  abstract goodsList(args: ArgSearch): Promise<any>;
  async testOrder(args: { file: string }): Promise<any> {}
  async coupons(args: { page: number }): Promise<any> {}
  async calcPrice(args: { url: string }): Promise<any> {}
  abstract getShopCollection(args: any): Promise<any>;
  abstract deleteShop(items: any[]): Promise<any>;

  async loginAction(page: Page): Promise<any> {
    return page.waitForNavigation({
      timeout: 0
    });
  }
  is_prev_login = true;
  async login(page: Page, cb?: Function) {
    this.is_prev_login = false;
    page.goto(this.login_url);
    let p = this.loginAction(page);
    await page.waitForNavigation();
    (async () => {
      await page.waitForNavigation({
        timeout: 0
      });
      await page.goto(this.state_url);
      cb && cb();
      this.is_prev_login = true;
    })();
    return p;
  }
  async start() {
    return this.preserveState();
  }
  async checkUrl(url: string, page: Page) {
    /* try {
      var p = this.req.get(url, {
        followRedirect: false
      });
      await p;
      return true;
    } catch (e) {
      return false;
    } */
    await page.goto(url);
    return page.url() === url;
  }
  private async preserveState() {
    var page = await newPage();
    var logined = await this.checkUrl(this.state_url, page);
    setTimeout(this.preserveState.bind(this), this.interval_check);
    if (!logined) {
      try {
        setTimeout(() => {
          if (!this.is_prev_login) {
            page.close();
          }
        }, 2 * 60 * 1000);
        await new Promise(resolve => {
          this.login(page, resolve);
        });
      } catch (e) {
        page.close();
        return;
      }
    }
    await page.goto(this.state_url);
    if (this.state_other_urls) {
      for (let url of this.state_other_urls) {
        await page.goto(url);
      }
    }
    this.setCookie(await getPageCookie(page));
    await page.close();
  }
  init() {
    this.cookier = cookieManager[this.name];
    this.setCookie(this.cookier.get());
    return ensureDir(".data/" + this.name);
  }
  async checkStatus() {
    var page = await newPage();
    var logined = await this.checkUrl(this.state_url, page);
    var p: any;
    if (!logined) {
      p = await this.login(page);
    } else {
      (async () => {
        await page.goto(this.state_url);
        this.setCookie(await getPageCookie(page));
        await page.close();
      })();
    }
    return p;
  }
}
