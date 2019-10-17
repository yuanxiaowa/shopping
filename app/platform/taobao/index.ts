/*
 * @Author: oudingyin
 * @Date: 2019-07-01 09:10:22
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-30 16:45:00
 */
import AutoShop from "../auto-shop";
import { delay } from "../../../utils/tools";
import { Page } from "puppeteer";
import taobaoHandlers from "./handlers";
import { resolveUrl, setReq } from "./tools";
import { newPage } from "../../../utils/page";
import { readJSONSync, readFileSync } from "fs-extra";
import { ArgBuyDirect, ArgCoudan } from "../struct";
import taobaoCouponHandlers from "./coupon-map";
import { getCartList as getCartListFromPc } from "./cart-pc";
import {
  getCartList as getCartListFromMobile,
  addCart,
  updateCart,
  cartToggle
} from "./cart-mobile";
import { taobaoComment } from "./comment";
import { taobaoOrderMobile } from "./order-mobile";
import setting from "./setting";
import { taobaoOrderPc } from "./order-pc";
import {
  getGoodsInfo,
  getChaoshiGoodsList,
  getGoodsList
} from "./goods-mobile";
import { getCoupons } from "./member";
import { sixtyCourseList, sixtyCourseReply } from "./activity";
import { seckillList } from "./seckill";
import { getStoreCollection, delStoreCollection } from "./store";
import { getGoodsCollection, delGoodsCollection } from "./goods-pc";
import path = require("path");
import iconv = require("iconv-lite");
import { jar } from "../../common/config";

export class Taobao extends AutoShop {
  constructor() {
    super({
      name: "taobao",
      login_url: "https://login.taobao.com/member/login.jhtml",
      state_urls: [
        "https://main.m.taobao.com/mytaobao/index.html?spm=a215s.7406091.toolbar.i2",
        "https://buy.tmall.com/auction/order/TmallConfirmOrderError.htm?__buy_error_code=F-10000-15-15-014&__buy_error_trace_id=b7d515cc15686464991268068e&__buy_error_original_code=F-10000-15-15-014"
        // "https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm"
      ],
      handlers: taobaoHandlers,
      coupon_handlers: taobaoCouponHandlers
    });
  }

  async checkUrl(url: string, page: Page) {
    page.goto(url);
    var res = await page.waitForResponse(
      res =>
        res
          .url()
          .startsWith(
            "https://h5api.m.taobao.com/h5/mtop.user.getusersimple/1.0/"
          ) ||
        res
          .url()
          .startsWith(
            "https://h5api.m.taobao.com/h5/mtop.taobao.mclaren.index.data.get.h5/1.0"
          )
    );
    var text: string = await res.text();
    return !text.includes("FAIL_SYS_SESSION_EXPIRED::");
    // return checkLogin();
  }
  resolveUrl = resolveUrl;

  async cartList(args) {
    var items;
    if (!args.from_pc) {
      items = await getCartListFromMobile();
    } else {
      items = await getCartListFromPc();
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
  comment(args) {
    return taobaoComment.comment(args);
  }
  commentList(args) {
    return taobaoComment.getCommentList(/* args.type,  */ args.page);
  }
  buyDirect(data: ArgBuyDirect, p?: Promise<void>): Promise<any> {
    if (data.from_pc) {
      return taobaoOrderPc.buyDirect(data, p);
    }
    return taobaoOrderMobile.buyDirect(data, p);
  }
  async coudan(data: ArgCoudan): Promise<any> {
    return taobaoOrderMobile.coudan(data);
  }

  cartBuy(args: any, p: Promise<void>) {
    if (args.from_pc) {
      return taobaoOrderPc.cartBuy(args, p);
    }
    return taobaoOrderMobile.cartBuy(args, p);
  }

  getGoodsInfo = getGoodsInfo;

  async goodsList(args) {
    if (args.name === "chaoshi") {
      return getChaoshiGoodsList(args);
    }
    return getGoodsList(args);
  }

  coupons = getCoupons;
  seckillList = seckillList;
  sixtyCourseList = sixtyCourseList;
  sixtyCourseReply = sixtyCourseReply;
  getStoreCollection = getStoreCollection;
  getGoodsCollection = getGoodsCollection;
  delStoreCollection = delStoreCollection;
  delGoodsCollection = delGoodsCollection;

  cartToggle = cartToggle;

  async loginAction(page: Page) {
    /* await page.waitForNavigation({
      timeout: 0
    });
    await page.click(".J_Quick2Static");
    await page.evaluate(username => {
      document.querySelector<HTMLInputElement>(
        "#TPL_username_1"
      )!.value = username;
    }, user.username);
    await page.type("#TPL_password_1", user.password);
    var [bar, area] = await Promise.all([
      page.$("#nc_1_n1z"),
      page.$("#nc_1__scale_text")
    ]);
    var bar_box = (await bar!.boundingBox())!;
    var start_x = bar_box.x + bar_box.width / 2 + 10 - 10 * Math.random();
    var start_y = bar_box.y + bar_box.height / 2 + 10 - 10 * Math.random();
    var area_rect = await area!.boundingBox();
    var mouse = page.mouse;
    console.log(bar_box, area_rect);
    await mouse.move(start_x, start_y);
    await mouse.down();
    var len = (600 + Math.random() * 500) / 16.66;
    for (let i = 0; i < len; i++) {
      await mouse.move(
        start_x + (i / len) * area_rect!.width,
        start_y + (Math.random() - 0.5) * 10
      );
      await delay(16.66);
    }
    await mouse.up(); */
    /* var url = await page.evaluate(() => {
      var img = (<HTMLImageElement>document.getElementById('J_QRCodeImg'))
      if (img) {
        return img.src
      }
    })
    if (url) {
      return url
    } */
    var res = await page.waitForResponse(
      res => res.url().endsWith("xcode.png"),
      {
        timeout: 0
      }
    );
    return res.url();
  }

  onAfterLogin() {
    setting.spm = `a1z0d.6639537.1997196601.${(Math.random() * 100) >>
      0}.412f7484UFYI5e`;
    setReq();
  }

  async testOrder(args) {
    var dirname = path.dirname(args.file);
    var body: any;
    var url: string;
    var test_fn: Function;
    if (path.basename(dirname).startsWith("pc-")) {
      body = readFileSync(args.file, "utf8");
      let i = body.indexOf("\n");
      url = body.substring(0, i);
      body = iconv.encode(body.substring(i), "gb2312");
      test_fn = _url => _url === url;
    } else {
      body = JSON.stringify({
        api: RegExp.$1,
        ret: ["SUCCESS::调用成功"],
        data: readJSONSync(args.file)
      });
      url =
        "https://main.m.taobao.com/order/index.html?buyNow=false&buyParam=601897585216_1_4210849008339_null_0_null_null_1514914344292_null_null_null_0_null_buyerCondition~0~~dpbUpgrade~null~~cartCreateTime~1568983417000_0_0_null_null_null_null_null_null_null_null_null&spm=a21202.12579950.settlement-bar.0";
      test_fn = (url: string) =>
        /\/(mtop.trade.buildorder.h5|mtop.trade.order.build.h5)\//.test(url);
    }
    var page = await newPage();
    await page.setRequestInterception(true);
    page.on("request", e => {
      if (test_fn(e.url())) {
        e.respond({
          status: 200,
          body
        });
      } else {
        e.continue();
      }
    });
    page.goto(url);
    return;
  }

  async miaosha(url: string, _dt = 0) {
    var page = await newPage();
    var viewport = await page.evaluate(() => {
      return {
        width: window.outerWidth,
        height: window.outerHeight
      };
    });
    await page.setViewport(viewport);
    await page.setRequestInterception(true);
    page.on("request", request => {
      if (request.url().startsWith("http://img1.tbcdn.cn/tfscom")) {
        request.continue();
        return;
      }
      var type = request.resourceType();
      if (type === "image" || type === "stylesheet" || type === "font") {
        request.respond({
          body: ""
        });
      } else {
        request.continue();
      }
    });
    await page.goto(url);
    var source = await page.content();
    var to = Number(/dbst\s*:\s*(\d+)/.exec(source)![1]);
    var now = Date.now();
    var dt = to - now - _dt;
    console.log(`等待${(dt / 1000) >> 0}s开始秒杀`);
    await delay(dt);
    await page.reload();
    var b = page.evaluate(() => {
      var refresh_btn = document.querySelector<HTMLDivElement>(
        ".J_RefreshStatus"
      );
      if (refresh_btn) {
        refresh_btn.click();
        return false;
      }
      return true;
    });
    if (!b) {
      await page.waitForResponse(res =>
        res.url().startsWith("http://m.ajax.taobao.com/qst.htm")
      );
    }
    page.evaluate(() => {
      document.querySelector<HTMLInputElement>(".answer-input")!.focus();
    });
  }
  setCookies(cookies: any[], url: string) {
    super.setCookies(cookies, url);
    if (url.includes(".taobao.com")) {
      cookies.forEach(cookie => {
        jar.setCookie(
          cookie.name + "=" + encodeURIComponent(cookie.value),
          "https://www.tmall.com/"
        );
      });
    }
  }
}
