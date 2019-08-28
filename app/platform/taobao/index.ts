/*
 * @Author: oudingyin
 * @Date: 2019-07-01 09:10:22
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-28 18:00:49
 */
import AutoShop from "../auto-shop";
import { delay } from "../../../utils/tools";
import { Page } from "puppeteer";
import taobaoHandlers from "./handlers";
import { resolveTaokouling, resolveUrl } from "./tools";
import { newPage } from "../../../utils/page";
import { readJSONSync } from "fs-extra";
import { ArgBuyDirect, ArgCoudan } from "../struct";
import cheerio = require("cheerio");
import taobaoCouponHandlers from "./coupon-map";
import bus_global from "../../common/bus";
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

export class Taobao extends AutoShop {
  mobile = true;
  interval_check = 1000 * 10 * 60;

  constructor() {
    super({
      name: "taobao",
      login_url: "https://login.taobao.com/member/login.jhtml",
      state_url:
        "https://main.m.taobao.com/mytaobao/index.html?spm=a215s.7406091.toolbar.i2",
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

  cartBuy(args: any) {
    if (args.from_pc) {
      return taobaoOrderPc.cartBuy(args);
    }
    return this.cartBuy(args);
  }

  submitOrder(data) {
    if (data.from_pc) {
      return taobaoOrderPc.submitOrder(data);
    }
    return taobaoOrderMobile.submitOrder(data);
  }

  getGoodsInfo = getGoodsInfo;

  getNextDataByGoodsInfo(data, quantity: number) {
    return taobaoOrderMobile.getNextDataByGoodsInfo(data, quantity);
  }

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
    var res = await page.waitForResponse(res =>
      res.url().startsWith("https://img.alicdn.com/imgextra")
    );
    return res.url();
  }

  onAfterLogin() {
    bus_global.emit("taobao:cookie", this.req, this.cookie);
    setting.spm = `a1z0d.6639537.1997196601.${(Math.random() * 100) >>
      0}.412f7484UFYI5e`;
  }

  async testOrder(args) {
    var page = await newPage();
    await page.setRequestInterception(true);
    page.on("request", e => {
      if (
        /\/(mtop.trade.buildorder.h5|mtop.trade.order.build.h5)\//.test(e.url())
      ) {
        e.respond({
          status: 200,
          body: JSON.stringify({
            api: RegExp.$1,
            ret: ["SUCCESS::调用成功"],
            data: readJSONSync(args.file)
          })
        });
      } else {
        e.continue();
      }
    });
    page.goto(
      "https://buy.m.tmall.com/order/confirm_order_wap.htm?enc=%E2%84%A2&itemId=538364857603&exParams=%7B%22addressId%22%3A%229607477385%22%2C%22etm%22%3A%22%22%7D&skuId=3471693791586&quantity=1&divisionCode=320583&userId=842405758&buyNow=true&_input_charset=utf-8&areaId=320583&addressId=9607477385&x-itemid=538364857603&x-uid=842405758"
    );
    return;
  }

  async getShopCollection(args: any) {
    var fhtml = await this.req(
      "https://shoucang.taobao.com/shop_collect_list_n.htm?spm=a1z0k.7386009.1997992801.3.46381019lOtNMa"
    );
    var token = /_tb_token_:\s*'([^']+)'/.exec(fhtml)![1];
    var html: string = await this.req.get(
      "https://shoucang.taobao.com/nodejs/shop_collect_list_chunk.htm?spm=a1z0k.7386009.1997992801.3.46381019lOtNMa",
      {
        qs: {
          ifAllTag: "0",
          tab: "0",
          categoryCount: "0",
          tagName: "",
          type: "0",
          categoryName: "",
          needNav: "false",
          startRow: args.page - 1,
          t: Date.now()
        }
      }
    );
    var $ = cheerio.load(html);
    var items = $(".shop-card")
      .map((i, ele) => {
        var $ele = $(ele);
        var $a = $ele.find(".shop-name-link");
        var img = $ele.find(".logo-img").attr("src");
        var url = $a.attr("href");
        return {
          id: /shop_id=(\d+)/.exec(url)![1],
          title: $a.text().trim(),
          img,
          url,
          token
        };
      })
      .get();
    return {
      page: args.page,
      items,
      more: items.length > 0
    };
  }

  async deleteShop(items: { id: string; token: string }[]) {
    var text: string = await this.req.post(
      "https://shoucang.taobao.com/favorite/api/CollectOperating.htm",
      {
        form: {
          _tb_token_: items[0].token,
          _input_charset: "utf-8",
          favType: 0,
          "favIdArr[]": items.map(({ id }) => id),
          operateType: "delete"
        },
        headers: {
          "x-requested-with": "XMLHttpRequest",
          referer:
            "https://shoucang.taobao.com/shop_collect_list_n.htm?spm=a1z0k.7386009.1997992801.3.46381019lOtNMa"
        }
      }
    );
    var { errorMsg, success } = JSON.parse(text);
    if (!success) {
      throw new Error(errorMsg);
    }
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
}
