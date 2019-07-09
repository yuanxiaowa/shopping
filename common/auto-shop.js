"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_native_1 = __importDefault(require("request-promise-native"));
const fs_extra_1 = require("fs-extra");
const page_1 = require("../utils/page");
const tools_1 = require("../utils/tools");
const iconv_lite_1 = __importDefault(require("iconv-lite"));
class AutoShop {
    constructor(data) {
        this.ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1";
        this.interval_check = 1000 * 60 * 60;
        Object.assign(this, data);
        this.init();
    }
    afterLogin() { }
    async logFile(content, label) {
        fs_extra_1.writeFile(`.data/${this.name}/${label}-${new Date()
            .toLocaleString()
            .replace(/(:|\/|,|\s)/g, "_")}` +
            Math.random()
                .toString()
                .substring(2, 6), content);
    }
    async checkUrl(url, page) {
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
    setCookie(cookie) {
        this.cookie = cookie;
        var opts = {
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
            transform(body, { headers }) {
                var ctype = headers["content-type"];
                if (/charset=([-\w]+)/i.test(ctype)) {
                    if (RegExp.$1 && RegExp.$1.toLowerCase() !== "utf-8") {
                        return iconv_lite_1.default.decode(body, RegExp.$1);
                    }
                }
                return String(body);
            },
            jar: request_promise_native_1.default.jar()
        };
        this.req = request_promise_native_1.default.defaults(opts);
        fs_extra_1.writeFile(this.cookie_filename, cookie);
        this.afterLogin();
    }
    async qiangquan(url) {
        for (let key in this.coupon_handlers) {
            if (this.coupon_handlers[key].test(url)) {
                return this.coupon_handlers[key].handler(url);
            }
        }
    }
    async loginAction(page) { }
    async getPageCookie(page) {
        var cookies = await page.cookies();
        var cookie_str = cookies
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join("; ");
        return cookie_str;
    }
    async login(page) {
        await page.goto(this.login_url);
        await this.loginAction(page);
        await page.waitForNavigation({
            timeout: 1000 * 60 * 5
        });
        await page.goto(this.state_url);
    }
    async start() {
        await page_1.injectDefaultPage({
            globalFns: {
                [`${this.name}ResolveUrls`]: this.resolveUrls.bind(this),
                [`${this.name}Coudan`]: this.coudan.bind(this),
                [`${this.name}Qiangquan`]: async (url) => {
                    url = await this.resolveUrl(url);
                    return this.qiangquan(url);
                },
                [`${this.name}Qiangdan`]: async (url, num = 1, d) => {
                    url = await this.resolveUrl(url);
                    let r = await this.qiangquan(url);
                    let page;
                    if (!r || typeof r === "string") {
                        page = await page_1.newPage();
                        await page.goto(r || url);
                    }
                    else {
                        page = r;
                    }
                    url = page.url();
                    for (let key in this.handlers) {
                        if (this.handlers[key].test(url)) {
                            await tools_1.delayRun(d, `${this.name}抢单`);
                            await page.reload();
                            await this.handlers[key].handler(num, page);
                            await page.close();
                        }
                    }
                },
                [`${this.name}ToggleCart`]: this.toggleCart.bind(this),
                [`${this.name}GetCartInfo`]: this.getCartInfo.bind(this),
                [`${this.name}CartBuy`]: async (d, data) => {
                    await tools_1.delayRun(d, this.name + "从购物车中结算");
                    // await delay(50);
                    return this.cartBuy(data);
                },
                [`${this.name}DirectBuy`]: async (d, url, quantity = 1) => {
                    await tools_1.delayRun(d, this.name + "直接购买");
                    return this.directBuy(url, quantity);
                }
            }
        });
        this.preserveState();
    }
    async preserveState() {
        var page = await page_1.newPage();
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
        fs_extra_1.ensureDir(".data/" + this.name);
    }
}
exports.default = AutoShop;
