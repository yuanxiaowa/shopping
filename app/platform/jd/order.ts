/*
 * @Author: oudingyin
 * @Date: 2019-08-26 15:02:23
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-02 14:21:53
 */
import setting from "./setting";
import { getCookie, time33, getSkuId } from "./tools";
import { ArgBuyDirect, ArgOrder, ArgCoudan } from "../struct";
import {
  delay,
  TimerCondition,
  throwError,
  Serial,
  taskManager
} from "../../../utils/tools";
import { getStock, getGoodsInfo } from "./goods";
import { newPage } from "../../../utils/page";
import { config } from "../../common/config";
import qs = require("querystring");
import { Page } from "puppeteer";
import moment = require("moment");
const user = require("../../../.data/user.json").jingdong;

export class JingDongOrder {
  @TimerCondition(0)
  async waitForStock(
    args: Parameters<typeof getStock>[0],
    duration: number
  ): Promise<any> {
    var data = await getStock(args, {});
    return {
      success: JSON.stringify(data).includes("无货"),
      data
    };
  }
  async buyDirect(args: ArgBuyDirect, p?: Promise<void>): Promise<any> {
    var skuId = getSkuId(args.url);
    var data = await getGoodsInfo(skuId);
    if (args.diejia) {
      if (args.quantity === 1) {
        let num = (args.diejia / data.price.p) >> 0;
        if (args.diejia - num * data.price.p > 1) {
          num++;
        }
        args.quantity = num;
      }
    }
    var next = async () => {
      let res = this.getNextDataByGoodsInfo(
        { skuId },
        args.quantity,
        data.miao
      );
      if (p) {
        await p;
      }
      return this.submitOrder(
        Object.assign(
          {
            data: res
          },
          args
        )
      );
    };
    if (args.jianlou && data.stock.StockState === 34) {
      this.waitForStock(
        [
          {
            skuId,
            num: String(args.quantity)
          }
        ],
        args.jianlou
      ).then(() => {
        console.log("有库存了，去下单");
        next();
      });
      return;
    }
    return next();
  }
  async cartBuy(data: any, p?: Promise<void>) {
    if (p) {
      await p;
    }
    return this.submitOrder(
      Object.assign(
        {
          data: {
            submit_url: "https://p.m.jd.com/norder/order.action"
          },
          other: {}
        },
        data
      )
    );
  }

  @Serial(0)
  async submitOrder(
    args: ArgOrder<{
      submit_url: string;
    }>
  ): Promise<any> {
    var page = await newPage();
    page.setRequestInterception(true);
    page.on("request", request => {
      var type = request.resourceType();
      if (type === "image" || type === "stylesheet") {
        request.respond({
          body: ""
        });
      } else {
        request.continue();
      }
    });
    page.goto(args.data.submit_url);
    let text_userasset = await page
      .waitForResponse(res => res.url().includes("userasset"))
      .then(res => res.text());
    if (typeof args.expectedPrice === "number") {
      let {
        order: {
          orderprice: { totalPrice }
        }
      } = JSON.parse(/\((.*)\)\}catch/.exec(text_userasset)![1]);
      totalPrice = totalPrice / 100;
      if (args.expectedPrice < totalPrice) {
        page.close();
        throwError(
          `太贵了，期望价格:${args.expectedPrice}, 实际价格：${totalPrice}`
        );
      }
    }
    if (!config.isSubmitOrder) {
      await page.setOfflineMode(true);
    }
    await page.evaluate(pass => {
      document.querySelector<HTMLInputElement>("#shortPassInput")!.value = pass;
    }, user.paypass);
    let action = async () => {
      page.evaluate(() => {
        document.querySelector<HTMLElement>("#btnPayOnLine")!.click();
      });
      var res = await page.waitForResponse(res =>
        res.url().startsWith("https://wqdeal.jd.com/deal/msubmit/confirm?")
      );
      var text = await res.text();
      console.log(text);
      return text;
    };
    let submit = async () => {
      let text = await action();
      if (text.includes("您要购买的商品无货了") && args.jianlou) {
        console.log(moment().format(), "开始刷库存");
        let {
          order: { address, venderCart }
          // @ts-ignore
        } = await page.evaluate(() => window.dealData);
        var skulist: any[] = [];
        venderCart.forEach(({ products }) => {
          products.forEach(({ mainSku }) => {
            skulist.push({
              skuId: mainSku.id,
              num: mainSku.num
            });
          });
        });
        var comment = await page.evaluate(() => {
          return Array.from(
            document.querySelectorAll<HTMLLinkElement>(".fn strong")
          ).map(link => link.textContent!.trim()).join('~').substring(0, 50);
        });
        await taskManager.registerTask(
          {
            name: "刷库存",
            platform: "jingdong",
            comment,
            async handler() {
              var result = await getStock(skulist, address);
              var n = Object.keys(result).find(key =>
                result[key].status.includes("无货")
              );
              return !n;
            },
            time: Date.now() + args.jianlou * 1000 * 60
          },
          0
        );
        return submit();
      }
      throw new Error(text);
    };
    (async () => {
      try {
        await submit();
        console.log("下单成功");
        await page.waitForNavigation();
      } catch (e) {
        if (e.message.includes("多次提交过快，请稍后再试")) {
          await delay(2000);
          console.log("retry");
          return this.submitOrder(args);
        }
        throw e;
      } finally {
        await page.close();
      }
    })();
    return delay(50);
    // "errId":"9075","errMsg":"您的下单操作过于频繁，请稍后再试."
    // "errId":"8730","errMsg":"您要购买的商品无货了，换个收货地址或者其他款式的商品试试"
  }

  getNextDataByGoodsInfo({ skuId }: any, quantity: number, isSeckill = false) {
    var submit_url =
      (isSeckill
        ? "https://wqs.jd.com/order/s_confirm_miao.shtml?"
        : "https://wq.jd.com/deal/confirmorder/main?") +
      qs.stringify({
        sceneval: "2",
        bid: "",
        wdref: `https://item.m.jd.com/product/${skuId}.html`,
        scene: "jd",
        isCanEdit: "1",
        EncryptInfo: "",
        Token: "",
        commlist: [skuId, "", quantity, skuId, 1, 0, 0].join(","),
        locationid: (getCookie("jdAddrId") || "")
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

  async coudan(data: ArgCoudan): Promise<any> {
    var ret = await setting.req.get(
      `https://cart.jd.com/reBuyForOrderCenter.action`,
      {
        qs: {
          wids: data.urls.map(getSkuId).join(","),
          nums: data.quantities.join(",")
        }
      }
    );
    return this.cartBuy(data);
  }
}

export const jingDongOrder = new JingDongOrder();

/**
 * @deprecated
 */
export async function submitOrder___() {
  var html: string = await setting.req.get(
    "https://p.m.jd.com/norder/order.action"
  );
  var text = /window.dealData =([\s\S]*?)<\/script>/.exec(html)![1];
  var dealData: {
    token2: string;
    skulist: string;
    traceId: string;
    order: any;
  } = eval(`(${text})`);
  var { token2, order, traceId } = dealData;

  var valuableskus = (() => {
    var ret: any[] = [];
    order.venderCart.forEach(({ mfsuits }: any) => {
      mfsuits.forEach(({ products }: any) => {
        products.forEach(({ mainSku }: any) => {
          var u;
          if (mainSku.cid.includes("_")) {
            u = mainSku.cid.split("_")[2];
          }
          if (!u) {
            u = mainSku.cid;
          }
          ret.push(
            [
              mainSku.id,
              mainSku.num,
              parseInt(mainSku.promotion.price) -
                parseInt(mainSku.promotion.discount),
              u
            ].join(",")
          );
        });
      });
    });
    return ret.join("|");
  })();
  var ship = (() => {
    return order.venderCart
      .map((vender: any) => {
        var o = new Array(14).fill("");
        o[0] = vender.shipment[0].type;
        o[1] = vender.shipment[0].id;
        o[2] = vender.venderId;
        o[13] = 0;
        return o.join("|");
      })
      .join("$");
  })();
  var qs = {
    paytype: "0", // 1
    paychannel: "1", // dealData.kaplerSource !== '0'时候为'6'，否则为1
    action: "0", // R.action
    reg: 1, // 1
    type: "0", // url:type || '0'
    token2, // dealData.token2
    dpid: "", // url:dpid || ''
    skulist: dealData.skulist, // 1
    scan_orig: "", // url:scan_orig || ''
    gpolicy: "", // 1
    platprice: order.usePcPrice, // dealData.order.usePcPrice
    ship, // h[0] || ''
    // '2|67|675918|||||||||||0$5|68|749057|2019-7-8|09:00-21:00|{"1":2,"35":4,"161":0,"30":2}|1|||||||0$2|67|10072685|||||||||||0',
    pick: "", // h[1] || ''
    savepayship: "0", // 1
    callback: "cbConfirmA", // 1
    uuid: getCookie("mba_muid"), // 1
    validatecode: "", // 1
    valuableskus,
    r: Math.random(), // 1
    sceneval: "2", // url:sceneVal || url:sceneval || ""
    rtk: "b0683b27fb2f9f98629907f6ba04c4db",
    traceid: traceId, // dealData.traceid
    g_tk: time33(getCookie("wq_skey")),
    g_ty: "ls" // 1
  };

  var ret = await setting.req.post(
    "https://wqdeal.jd.com/deal/msubmit/confirm",
    {
      qs,
      headers: {
        Referer: "https://p.m.jd.com/norder/order.action"
      }
    }
  );
  return ret;
}

export async function buy(page: Page) {
  if (page.url().startsWith("https://item.m.jd.com/")) {
    await page.click("#buyBtn2");
  } else {
    await page.click("#InitCartUrl");
  }
}
