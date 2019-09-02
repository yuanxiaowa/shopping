/*
 * @Author: oudingyin
 * @Date: 2019-08-26 09:17:48
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-02 14:16:07
 */
import { ArgOrder, ArgBuyDirect, ArgCoudan } from "../struct";
import { requestData, logFile } from "./tools";
import { config } from "../../common/config";
import { Serial, TimerCondition, throwError } from "../../../utils/tools";
import { getGoodsInfo } from "./goods-mobile";
import { getCartList, addCart } from "./cart-mobile";
import setting from "./setting";

const request_tags = {
  agencyPay: true,
  coupon: true,
  deliveryMethod: true,
  promotion: true,
  service: true,
  address: true,
  voucher: true,
  redEnvelope: true,
  postageInsurance: true
};

function transformOrderData(orderdata: any, args: ArgOrder<any>) {
  var {
    data,
    linkage,
    hierarchy: { structure, root }
  } = orderdata;
  var invalids = structure[root].filter(name => name.startsWith("invalid"));
  if (invalids.length > 0) {
    throwError("有失效宝贝");
  }
  var realPay = data.realPay_1;
  if (typeof args.expectedPrice === "number") {
    if (Number(args.expectedPrice) < Number(realPay.fields.price)) {
      throwError("价格太高了，买不起");
    }
  }
  var orderData = Object.keys(data).reduce(
    (state, name) => {
      var item = data[name];
      item._request = request_tags[item.tag];
      if (item.submit) {
        item.fields.value = args.other[item.tag];
        state[name] = item;
      }
      return state;
    },
    <any>{}
  );
  var dataSubmitOrder = data.submitOrder_1;
  var address = data.address_1;
  realPay.fields.currencySymbol = "￥";
  dataSubmitOrder._realPay = realPay;
  if (address) {
    let { fields } = address;
    fields.info = {
      value: fields.options[0].deliveryAddressId.toString()
    };
    fields.url =
      "//buy.m.tmall.com/order/addressList.htm?enableStation=true&requestStationUrl=%2F%2Fstationpicker-i56.m.taobao.com%2Finland%2FshowStationInPhone.htm&_input_charset=utf8&hidetoolbar=true&bridgeMessage=true";
    fields.title = "管理收货地址";
    dataSubmitOrder._address = address;
  }
  var coupon = data.coupon_3;
  if (coupon && coupon.fields.totalValue) {
    coupon.fields.value =
      "-" + Number(/￥(.*)/.exec(coupon.fields.totalValue)![1]).toFixed(2);
  }
  var ua = "";
  var postdata = {
    params: JSON.stringify({
      data: JSON.stringify(orderData),
      hierarchy: JSON.stringify({
        structure
      }),
      linkage: JSON.stringify({
        common: {
          compress: linkage.common.compress,
          submitParams: linkage.common.submitParams,
          validateParams: linkage.common.validateParams
        },
        signature: linkage.signature
      })
    }),
    ua
  };
  return postdata;
}

export class TaobaoOrderMobile {
  @Serial(0)
  async submitOrder(args: ArgOrder<any>, retryCount = 0) {
    var r = Date.now();
    console.time("订单结算" + r);
    // other.memo other.ComplexInput
    console.log("-------------开始进入手机订单结算页-------------");
    var data1;
    try {
      // {
      //   jsv: "2.4.7",
      //   appKey: this.appKey,
      //   api: "mtop.trade.buildOrder.h5",
      //   v: "3.0",
      //   type: "originaljson",
      //   timeout: "20000",
      //   isSec: "1",
      //   dataType: "json",
      //   ecode: "1",
      //   ttid: "#t#ip##_h5_2014",
      //   AntiFlood: "true",
      //   LoginRequest: "true",
      //   H5Request: "true"
      // }
      data1 = await requestData(
        "mtop.trade.buildorder.h5",
        args.data,
        "post",
        "3.0"
      );
    } catch (e) {
      console.error("获取订单信息出错", e);
      if (retryCount >= 2) {
        console.error("已经重试三次，放弃治疗");
        throw e;
      }
      if (e.name === "FAIL_SYS_TRAFFIC_LIMIT" || e.message.includes("被挤爆")) {
        console.log("太挤了，正在重试");
        return this.submitOrder(args, retryCount + 1);
      }
      throw e;
    }
    console.timeEnd("订单结算" + r);
    console.log("-------------已经进入手机订单结算页-------------");
    logFile(data1, "手机订单结算页", ".json");
    console.log("-------------进入手机订单结算页，准备提交-------------");
    var postdata = transformOrderData(data1, args);
    logFile(postdata, "订单结算页提交的数据", ".json");
    /* writeFile("a1.json", getTransformData(postdata));
  writeFile("a2.json", getTransformData(await getPageData(args))); */
    if (!config.isSubmitOrder) {
      return;
    }
    async function handler(retryCount = 0) {
      try {
        r = Date.now();
        console.time("订单提交" + r);
        let ret = await requestData(
          "mtop.trade.createorder.h5",
          postdata,
          "post",
          "3.0"
        );
        logFile(ret, "手机订单提交成功");
        console.log("----------手机订单提交成功----------");
        console.timeEnd("订单提交" + r);
      } catch (e) {
        if (retryCount >= 2) {
          console.error("已经重试三次，放弃治疗");
          throw e;
        }
        if (
          e.message.includes("对不起，系统繁忙，请稍候再试") ||
          e.message.includes("被挤爆")
        ) {
          console.log(e.message, "正在重试");
          return handler(retryCount + 1);
        }
        throw e;
      }
    }
    return handler();
  }

  getNextDataByGoodsInfo({ delivery, skuId, itemId }, quantity: number) {
    return {
      buyNow: true,
      exParams: JSON.stringify({
        addressId:
          delivery.areaSell === "true" ? delivery.addressId : undefined,
        buyFrom: "tmall_h5_detail"
      }),
      itemId,
      quantity,
      serviceId: null,
      skuId
    };
  }

  @TimerCondition()
  async waitForStock(
    args: {
      url: string;
      quantity: number;
      skus?: number[];
    },
    duration: number
  ): Promise<any> {
    var data = await getGoodsInfo(args.url, args.skus);
    return {
      success: data.quantity >= args.quantity,
      data
    };
  }

  async buyDirect(args: ArgBuyDirect, p?: Promise<void>) {
    var data = await getGoodsInfo(args.url, args.skus);
    if (data.quantity < args.quantity) {
      if (args.jianlou) {
        let p = this.waitForStock(args, args.jianlou);
        p.then(async () => {
          console.log("有库存了，开始去下单");
          if (args.from_cart) {
            /* let id = await this.cartAdd({
              url: args.url,
              quantity: args.quantity,
              skus: args.skus
            }); */
            return this.coudan({
              urls: [args.url],
              quantities: [args.quantity],
              expectedPrice: args.expectedPrice!
            });
          }
          return this.submitOrder(
            Object.assign(args, {
              data: this.getNextDataByGoodsInfo(data, args.quantity)
            })
          );
        });
      } else {
        throwError("无库存了");
      }
    } else {
      if (!data.buyEnable) {
        throwError(data.msg || "不能购买");
      }
      if (p) {
        await p;
      }
      return this.submitOrder(
        Object.assign(args, {
          data: this.getNextDataByGoodsInfo(data, args.quantity)
        })
      );
    }
  }

  async coudan(data: ArgCoudan): Promise<any> {
    var ids = await Promise.all(
      data.urls.map((url, i) =>
        addCart({
          url,
          quantity: data.quantities[i]
        })
      )
    );
    var list = await getCartList();
    var datas: any[] = [];
    list.forEach(({ items }) => {
      items.forEach(item => {
        if (ids.includes(item.id)) {
          datas.push(item);
        }
      });
    });
    return this.cartBuy({ items: datas });
  }

  cartBuy(args: { items: any[] }) {
    return this.submitOrder({
      data: {
        buyNow: "false",
        buyParam: args.items.map(({ settlement }) => settlement).join(","),
        spm: setting.spm
      },
      other: {}
    });
  }
}

export const taobaoOrderMobile = new TaobaoOrderMobile();
