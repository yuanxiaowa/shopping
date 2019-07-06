import { newPage, browser_promise, injectDefaultPage } from "../utils/page";
import { Page } from "puppeteer";
import { startsWith } from "ramda";
import request = require("request-promise-native");
import AutoShop from "../common/auto-shop";
import { setReq, getCartInfo, submitOrder, toggleCartChecked } from "./goods";
import { isSubmitOrder } from "../common/config";

import {
  getGoodsInfo,
  queryGoodsCoupon,
  obtainGoodsCoupon,
  queryFloorCoupons,
  obtainFloorCoupon,
  queryActivityCoupons,
  obtainActivityCoupon
} from "./goods";
import { getPeriodCoupon, getHongbao } from "./other";

const user = require("./user.json");

export async function getGoodsCoupons(skuId: string) {
  var { item } = await getGoodsInfo(skuId);
  var coupons = await queryGoodsCoupon({
    skuId,
    vid: item.venderID,
    cid: item.category[item.category.length - 1]
  });
  return Promise.all(
    coupons.map(item =>
      obtainGoodsCoupon({
        roleId: item.roleId,
        key: item.key
      })
    )
  );
}

export async function getFloorCoupons(url: string) {
  var items = await queryFloorCoupons(url);
  return Promise.all(
    items.map(_items =>
      Promise.all(
        _items.map(item =>
          obtainFloorCoupon({
            key: item.key,
            level: item.level
          })
        )
      )
    )
  );
}

export async function getActivityCoupons(url: string) {
  var items = await queryActivityCoupons(url);
  var activityId = /(\w+)\/index.html/.exec(url)![1];
  return Promise.all(
    items.map(_items =>
      Promise.all(
        _items.map(item =>
          obtainActivityCoupon({
            activityId,
            args: item.args,
            scene: item.scene,
            childActivityUrl: encodeURIComponent(url)
          })
        )
      )
    )
  );
}

async function resolveUrl(url: string) {
  if (!url.startsWith("https://u.jd.com/")) {
    return url;
  }
  let html: string = await request.get(url, {
    // encoding: null
    gzip: true
  });
  let hrl = /var hrl='([^']+)/.exec(html)![1];
  let p = request.get(hrl, {
    followRedirect: false,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
    }
  });
  await p.catch(() => {});
  let l = p.response!.headers.location!;
  return l;
}
// @ts-ignore
submitOrder = submitOrder;

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
      cookie_filename: __dirname + "/cookie-goods.txt",
      handlers: {
        jindong: {
          test: startsWith("https://item.jd.com"),
          handler: async (num: number, page: Page) => {
            // var {
            //   skuCoupon
            // }: {
            //   skuCoupon: {
            //     id: number;
            //     quota: number;
            //     discount: number;
            //     trueDiscount: number;
            //   }[];
            // } = await page
            //   .waitForResponse(res =>
            //     res.url().startsWith("https://cd.jd.com/promotion/v2?")
            //   )
            //   .then(res => res.text())
            //   .then(text => JSON.parse(text.replace(/\w+\((.*)\)/, "$1")));
            page.click(".quan-item");
            await page.waitForResponse(res =>
              res.url().startsWith("https://item.jd.com/coupons?")
            );
            let frame = page.frames()[1];
            let eles = await frame.$$(".sku_coupon_item .btn-get");
            eles.forEach(ele => ele.click());

            await page.type("#buy-num", String(num));
            await page.click("#InitCartUrl");
            /* await page.goto("https://cart.jd.com/cart.action");
      await page.waitForSelector('.submit-btn')
      await page.click(".submit-btn");
      await page.waitForNavigation(); */
            await page.goto(
              "https://trade.jd.com/shopping/order/getOrderInfo.action"
            );
            if (!isSubmitOrder) {
              await page.setOfflineMode(true);
            }
            await page.click("#order-submit");
          }
        },
        jindong_m: {
          test: startsWith("https://item.m.jd.com"),
          async handler(num: number, page: Page) {
            await page.evaluate((num: number) => {
              let df = document.querySelector<HTMLDivElement>("#discountFloor");
              if (df) {
                df.click();
                Array.from(
                  document.querySelectorAll<HTMLDivElement>(
                    ".coupon_voucher3:not(.coupon_voucher3_spec_tag) span.coupon_voucher3_info_btn:not(.disabled)"
                  )
                ).forEach(ele => {
                  ele.click();
                });
                document
                  .querySelector<HTMLDivElement>("#discountPopup i.close")!
                  .click();
              }
              document.querySelector<HTMLDivElement>("#skuWindow")!.click();
              document.querySelector<HTMLInputElement>(
                "#buyNum1"
              )!.value = String(num);
              document.querySelector<HTMLDivElement>("#popupConfirm")!.click();
              var ele_guide = document.querySelector<HTMLDivElement>(".guide");
              if (ele_guide) {
                ele_guide.click();
                return;
              }
              document.querySelector<HTMLDivElement>("#buyBtn2")!.click();
            }, num);
            await page.waitForNavigation();
            if (!isSubmitOrder) {
              await page.setOfflineMode(true);
              throw new Error("");
            }
            await page.click("#btnPayOnLine");
          }
        },
        pingou: {
          test: startsWith("https://wqs.jd.com/pingou/detail.shtml"),
          async handler(num: number, page: Page) {
            var ele = await page.$("#pcprompt-viewpc");
            if (ele) {
              ele.click();
            }
            await page.click(".tuan_status_btns");
            await page.click(".sku_panel__confirm");
            await page.waitForNavigation();
            ele = await page.$("#pcprompt-viewpc");
            if (ele) {
              ele.click();
            }
            if (!isSubmitOrder) {
              await page.setOfflineMode(true);
            }
            await page.click("#appConfirm");
          }
        }
      },
      // https://m.jr.jd.com/member/rightsCenter/?cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=4fa157535d65429cbdd4a80e012d3f86#/
      coupon_handlers: {
        wq: {
          // https://wq.jd.com/webportal/event/25842?cu=true&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=4b1871b719e94013a1e77bb69fee767e&scpos=#st=460
          // https://wq.jd.com/webportal/event/25842?cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=c39350c2555145809ef3f4c05465cdf0&scpos=#st=376
          test: startsWith("https://wq.jd.com/webportal/event/"),
          handler: async url => {
            var html: string = await this.req.get(url);
            var text = /window._componentConfig\s*=\s*(.*);/.exec(html)![1];
            var items = JSON.parse(text).filter(
              ({ name }: any) => name === "coupon"
            );
            var now = Date.now();
            items.forEach(({ data: { list } }: any) => {
              list.forEach(({ begin, end, key, level }: any) => {
                if (
                  new Date(begin).getTime() < now &&
                  new Date(end).getTime() > now
                ) {
                  obtainFloorCoupon({
                    key,
                    level
                  });
                }
              });
            });
            /* var page = await newPage();
            await page.goto(url);
            await page.evaluate(() => {
              Array.from(
                document.querySelectorAll<HTMLDivElement>(
                  ".atmosphere_coupon_1600_591_skin_ft_cloud:not(.disabled)"
                )
              ).forEach(ele => {
                ele.click();
              });
              Array.from(
                document.querySelectorAll<HTMLDivElement>(
                  ".coupon_2030_294_item"
                )
              ).forEach(ele => ele.click());
            });
            return page; */
          }
        },
        couponCenter: {
          test: startsWith(
            "https://coupon.m.jd.com/center/getCouponCenter.action"
          ),
          async handler(url) {
            var page = await newPage();
            await page.goto(url);
            await page.evaluate(() => {
              Array.from(
                document.querySelectorAll<HTMLDivElement>(".coupon_btn")
              ).forEach(ele => ele.click());
            });
            return page;
          }
        },
        jingfen: {
          test: startsWith("https://jingfen.jd.com/item.html"),
          async handler(url) {
            var page = await newPage();
            await page.goto(url);
            var b = await page.evaluate(() => {
              let button = document.querySelector<HTMLElement>(".btnget span")!;
              let text = button.innerText;
              if (text === "立即领取") {
                button.click();
              } else if (text === "已领完") {
                if (!confirm("券已领完，确定要继续吗？")) {
                  return false;
                }
              } else {
                document
                  .querySelector<HTMLParagraphElement>(".content")!
                  .click();
              }
            });
            if (b === false) {
              page.close();
              throw new Error("券光了~");
            }
            await page.waitForNavigation();
            return page;
          }
        },
        goods_m: {
          test: startsWith("https://item.m.jd.com/product/"),
          async handler(url) {
            await getGoodsCoupons(/product\/(\w+)/.exec(url)![1]);
          }
        },
        floor: {
          // https://wqs.jd.com/event/promote/mobile8/index.shtml?ptag=17036.106.1&ad_od=4&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=e653d855fd454bfe86b29fa2bf38fdb2&scpos=#st=592
          test: startsWith("https://wqs.jd.com/event/promote"),
          async handler(url) {
            await getFloorCoupons(url);
          }
        },
        activity: {
          test: startsWith("https://pro.m.jd.com/mall/active"),
          async handler(url) {
            await getActivityCoupons(url);
          }
        }
      }
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
  getCartInfo() {
    return getCartInfo();
  }
  toggleCart = toggleCartChecked;
  async cartBuy() {
    var page = await newPage();
    await page.goto("https://p.m.jd.com/norder/order.action");
    if (!isSubmitOrder) {
      await page.setOfflineMode(true);
    }
    page.click("#btnPayOnLine");
    await page.waitForNavigation();
    await page.close();
  }
  directBuy(url: string, quantity: number): Promise<any> {
    throw new Error("Method not implemented.");
  }

  start() {
    super.start();
    injectDefaultPage({
      globalFns: {
        getCartInfo: getCartInfo
      }
    });
    browser_promise.then(() => {
      this.preservePcState();
      getPeriodCoupon();
      getHongbao();
    });
  }

  async preservePcState() {
    var page = await newPage();
    var b = await this.checkUrl("https://home.jd.com/", page);
    setTimeout(
      this.preservePcState.bind(this),
      this.interval_check + 1000 * 60 * 5
    );
    if (!b) {
      await browser_promise;
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
  }
}
