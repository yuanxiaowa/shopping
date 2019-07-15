import { RequestAPI, RequiredUriUrl, Response } from "request";
import request = require("request-promise-native");
import { RequestPromise, RequestPromiseOptions } from "request-promise-native";
import { writeFile, ensureDir } from "fs-extra";
import { Page } from "puppeteer";
import { newPage } from "../../utils/page";
import iconv = require("iconv-lite");

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
  interval_check = 1000 * 60 * 60;
  async onBeforeLogin(page: Page): Promise<any> {}
  onAfterLogin() {}
  constructor(data: AutoShopOptions) {
    Object.assign(this, data);
    this.init();
  }
  async logFile(content: string, label: string) {
    writeFile(
      `.data/${this.name}/${label}-${new Date()
        .toLocaleString()
        .replace(/(:|\/|,|\s)/g, "_")}` +
        Math.random()
          .toString()
          .substring(2, 6),
      content
    );
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
      transform(body: Buffer, { headers }: Response) {
        var ctype = headers["content-type"]!;
        if (/charset=([-\w]+)/i.test(ctype)) {
          if (RegExp.$1 && RegExp.$1.toLowerCase() !== "utf-8") {
            return iconv.decode(body, RegExp.$1);
          }
        }
        return String(body);
      },
      jar: request.jar()
    };
    this.req = request.defaults(opts);
    writeFile(this.cookie_filename, cookie);
    this.onAfterLogin();
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
  abstract cartList(): Promise<any>;
  abstract cartBuy(data: any): Promise<any>;
  async cartToggle(data: { items: any; checked: boolean }): Promise<any> {}
  async cartToggleAll(data: any): Promise<any> {}
  abstract cartAdd(data: any): Promise<any>;
  abstract cartDel(data: any): Promise<any>;
  abstract cartUpdateQuantity(data: any): Promise<any>;
  abstract comment(data: any): Promise<any>;
  abstract commentList(data: { page: number; type: number }): Promise<any>;
  abstract buyDirect(data: {
    url: string;
    quantity: number;
    skus?: number[];
  }): Promise<any>;
  abstract getGoodsInfo(url: string, skus?: number[]): Promise<any>;
  abstract getNextDataByGoodsInfo(data: any, quantity: number): any;
  abstract submitOrder(data: any, other?: any): Promise<any>;
  async seckillList(name: string): Promise<any> {}

  async loginAction(page: Page) {}
  async getPageCookie(page: Page) {
    var cookies = await page.cookies();
    var cookie_str = cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join("; ");
    return cookie_str;
  }
  async login(page: Page) {
    await page.goto(this.login_url);
    await this.onBeforeLogin(page);
    await this.loginAction(page);
    await page.waitForNavigation({
      timeout: 1000 * 60 * 5
    });
    await page.goto(this.state_url);
  }
  async start() {
    return this.preserveState();
  }
  private async preserveState() {
    var page = await newPage();
    var logined = await this.checkUrl(this.state_url, page);
    setTimeout(this.preserveState.bind(this), this.interval_check);
    if (!logined) {
      await this.login(page);
    }
    await page.goto(this.state_url);
    this.setCookie(await this.getPageCookie(page));
    await page.close();
  }
  init() {
    ensureDir(".data/" + this.name);
  }
}
