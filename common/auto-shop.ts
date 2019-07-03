import { RequestAPI, RequiredUriUrl, Response } from "request";
import {
  RequestPromise,
  RequestPromiseOptions,
  default as request
} from "request-promise-native";
import { readFileSync, writeFile, ensureDir } from "fs-extra";
import { Page } from "puppeteer";
import { browser_promise, newPage, injectDefaultPage } from "../utils/page";
import { diffToNow, delayRun } from "../utils/tools";
import iconv from "iconv-lite";

interface AutoShopOptions {
  name: string;
  ua?: string;
  cookie_filename: string;
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
  cookie_filename!: string;
  state_url!: string;
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
  req!: RequestAPI<RequestPromise<any>, RequestPromiseOptions, RequiredUriUrl>;
  cookie!: string;
  interval_check = 1000 * 60 * 30;
  afterSetCookie() {}
  constructor(data: AutoShopOptions) {
    Object.assign(this, data);
    this.init();
  }
  async logFile(content: string, label: string) {
    writeFile(
      `.data/${this.name}/${label}-${new Date()
        .toLocaleString()
        .replace(/:/g, "_")}`,
      content
    );
  }
  async checkUrl(url: string) {
    /* try {
      var p = this.req.get(url, {
        followRedirect: false
      });
      await p;
      return true;
    } catch (e) {
      return false;
    } */
    var page = await newPage();
    await page.goto(url);
    var b = page.url() === url;
    if (b) {
      this.setCookie(await this.getPageCookie(page));
    }
    page.close();
    return b;
  }
  setCookie(cookie: string) {
    this.cookie = cookie;
    var opts: any = {
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
      transform(body: Buffer, { headers }: Response) {
        var ctype = headers["content-type"]!;
        if (/charset=(\w+)/i.test(ctype)) {
          if (RegExp.$1 && RegExp.$1.toLowerCase() !== "utf-8") {
            return iconv.decode(body, RegExp.$1);
          }
        }
        return String(body);
      }
    };
    this.req = request.defaults(opts);
    writeFile(this.cookie_filename, cookie);
    this.afterSetCookie();
  }
  abstract resolveUrl(url: string): Promise<string>;
  abstract resolveUrls(text: string): Promise<string[]>;
  async qiangquan(url: string): Promise<string | Page | undefined> {
    for (let key in this.coupon_handlers) {
      if (this.coupon_handlers[key].test(url)) {
        return this.coupon_handlers[key].handler(url);
      }
    }
  }
  abstract coudan(items: [string, number][]): Promise<any>;
  abstract getCartInfo(): Promise<any>;
  abstract toggleCart(arr: any, checked: boolean): Promise<any>;
  abstract cartBuy(data: any): Promise<any>;
  abstract directBuy(url: string): Promise<any>;
  async loginAction(page: Page) {}
  async getPageCookie(page: Page) {
    var cookies = await page.cookies();
    var cookie_str = cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join("; ");
    return cookie_str;
  }
  async login() {
    let page = await newPage();
    await page.goto(this.login_url);
    await this.loginAction(page);
    await page.waitForNavigation({
      timeout: 1000 * 60 * 5
    });
    this.setCookie(await this.getPageCookie(page));
    await page.close();
  }
  start() {
    injectDefaultPage({
      globalFns: {
        [`${this.name}ResolveUrls`]: this.resolveUrls.bind(this),
        [`${this.name}Coudan`]: this.coudan.bind(this),
        [`${this.name}Qiangquan`]: async (url: string) => {
          url = await this.resolveUrl(url);
          return this.qiangquan(url);
        },
        [`${this.name}Qiangdan`]: async (
          url: string,
          num: number = 1,
          d?: string
        ) => {
          url = await this.resolveUrl(url);
          let r = await this.qiangquan(url);
          let page: Page;
          if (!r || typeof r === "string") {
            page = await newPage();
            await page.goto(r || url);
          } else {
            page = r;
          }
          url = page.url();
          for (let key in this.handlers) {
            if (this.handlers[key].test(url)) {
              await delayRun(d, `${this.name}抢单`);
              await page.reload();
              await this.handlers[key].handler(num, page);
              await page.close();
            }
          }
        },
        [`${this.name}ToggleCart`]: this.toggleCart.bind(this),
        [`${this.name}GetCartInfo`]: this.getCartInfo.bind(this),
        [`${this.name}CartBuy`]: async (d: string, data: any) => {
          await delayRun(d, this.name + "从购物车中结算");
          return this.cartBuy(data);
        },
        [`${this.name}DirectBuy`]: async (d: string, url: any) => {
          await delayRun(d, this.name + "直接购买");
          return this.directBuy(url);
        }
      }
    });
    browser_promise.then(() => {
      this.preserveState();
    });
  }
  private async preserveState() {
    var logined = await this.checkUrl(this.state_url);
    setTimeout(this.preserveState.bind(this), this.interval_check);
    if (!logined) {
      return this.login();
    }
  }
  init() {
    this.setCookie(readFileSync(this.cookie_filename, "utf8"));
    ensureDir(".data/" + this.name);
  }
}
