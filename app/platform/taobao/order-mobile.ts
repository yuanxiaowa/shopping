/*
 * @Author: oudingyin
 * @Date: 2019-08-26 09:17:48
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-27 18:07:07
 */
import { ArgOrder, ArgBuyDirect, ArgCoudan } from "../struct";
import { requestData, logFile, getItemId } from "./tools";
import { config, UA } from "../../common/config";
import {
  Serial,
  TimerCondition,
  throwError,
  delay
} from "../../../utils/tools";
import { getGoodsInfo } from "./goods-mobile";
import { getCartList, addCart } from "./cart-mobile";
import setting from "./setting";
import moment = require("moment");

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

function transformOrderData(
  orderdata: any,
  args: ArgOrder<any>,
  operator?: string
) {
  var {
    data,
    linkage,
    hierarchy: { structure, root },
    endpoint
  } = orderdata;
  var dataSubmitOrder = data.submitOrder_1;
  var price = 0;
  if (dataSubmitOrder.hidden) {
    // var realPay = data.realPay_1;
    var orderData = Object.keys(data).reduce(
      (state, name) => {
        var item = data[name];
        // item._request = request_tags[item.tag];
        if (item.submit) {
          let i = name.indexOf("_");
          let tag = name.substring(0, i);
          let id = name.substring(i + 1);
          item.fields.value = args.other[item.tag] || item.fields.value;
          item.id = id;
          item.tag = tag;
          state[name] = item;
        }
        return state;
      },
      <any>{}
    );
    price = dataSubmitOrder.hidden.extensionMap.showPrice;
  } else {
    let realPay = data.realPay_1;
    endpoint = undefined;
    price = realPay.fields.price;
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
  }
  var ua =
    "120#bX1bSbnosGDVHyn4GCwVLGU/qhVnPz7gXEWbpeS3BWDqxvHnn5lbFazGrvimIXiCHD7UAc0M2w+P7Kfq6seiXL43dPZhT8GsVJxqI1hO5pn0FZqOHHxEb+SDknLFlAPg9GwNUK3PYbkIPXIbbUDONee/P8Lw6HPIbOrA46pVSxtkOyzBz7iDwUM4AoTzGn/90yrFLO3G+rJ6P7+sMwCXDz/N0SfEPlbi7PrCoAFDGtdGZpidU604NtyrUhPPrZdWgGjYcB/El9OAzLmzmr8y2dwGHV7jQ62eEmmJAXLdZR1O1HN659N54xjQn5DvPxZn+QOZlmhE4x82LuhqpkBfqONOw6/Q6bqc3gRTExBUAhYLsjDquA1eIjj7oJ8cHNZp8qRhrqjTLybJadlqKxiCGXED2IYBiu1GrDmVtJFidJHXe3/z83vuWtU9AtSUM1xzE+Zj5Nja2aXk8qxB+WUy0WHZ8XlEmG3+Cn6lVxy1X9rjaZiolupmFWAyWixVo6oNo9t/JU+9x1vuy/Y+SOPcmLNSHhHUI82BO6C3fnGKeanPtZ5eA8T60dCWiXGdNcG0MXaPjwR5fYl7BjrcOb/z4UX1tN7uBZR1RVY6/En0Wj0DvpNy2sUG353sdPT9g4YTsgRcuJA1g9RJySfifhuNEh/Hh2pciXhwrpJUPV3R2aFW//d8UpQbXM+oOjKaDcVQJEMBEqZYjoQDIe6b/aYjfNtpDMsM8O+9jI1QgwXdsId5V2AkxiYFzPNUzsnPgzoO1OpA+yDFf9JEXPOTnzF2TX/a7R0phyFAFGuMBNfqHcQN24fqstfOO0A=";
  var common: any;
  if (operator === "address_1") {
    let { address_1 } = orderData;
    orderData = linkage.input.reduce(
      (state, key) => {
        state[key] = orderData[key];
        return state;
      },
      {
        address_1
      }
    );
    let baseDeliverAddressDO = JSON.parse(
      address_1.hidden.extensionMap.options
    )[0].baseDeliverAddressDO;
    endpoint = undefined;
    let selectedId = address_1.hidden.extensionMap.selectedId;
    let info = {
      value: selectedId,
      addressId: selectedId
    };
    let desc =
      baseDeliverAddressDO.fullName +
      "：" +
      baseDeliverAddressDO.province +
      baseDeliverAddressDO.city +
      baseDeliverAddressDO.area +
      baseDeliverAddressDO.addressDetail;
    address_1.fields.cornerType = "both";
    [
      address_1.fields,
      ...address_1.events.itemClick.map(item => item.fields.params)
    ].forEach(item => {
      item.info = info;
      item.desc = desc;
    });
    common = {
      compress: linkage.common.compress,
      queryParams: linkage.common.queryParams,
      validateParams: linkage.common.validateParams
    };
  } else {
    common = {
      compress: linkage.common.compress,
      submitParams: linkage.common.submitParams,
      validateParams: linkage.common.validateParams
    };
  }
  var postdata = {
    params: JSON.stringify({
      data: JSON.stringify(orderData),
      endpoint,
      hierarchy: JSON.stringify({
        structure
      }),
      linkage: JSON.stringify({
        common,
        signature: linkage.signature
      }),
      operator
    }),
    ua
  };
  if (operator === "address_1") {
    return postdata;
  }
  if (typeof args.expectedPrice === "number") {
    if (Number(args.expectedPrice) < Number(price)) {
      throw {
        data: postdata,
        message: "价格太高，买不起",
        code: 2
      };
    }
  }
  var invalids = structure[root].filter(name => name.startsWith("invalid"));
  if (invalids.length > 0) {
    throw {
      data: postdata,
      message: "有失效宝贝",
      code: 2
    };
  }
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
        "mtop.trade.order.build.h5",
        Object.assign(
          {
            exParams: JSON.stringify({
              tradeProtocolFeatures: "5",
              userAgent: UA.wap
            })
          },
          args.data
        ),
        "post",
        "4.0"
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
    var postdata;
    async function handler(retryCount = 0) {
      try {
        r = Date.now();
        console.time("订单提交" + r);
        let ret = await requestData(
          "mtop.trade.order.create.h5",
          postdata,
          "post",
          "4.0"
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
    let f1 = async (t?: number) => {
      try {
        postdata = transformOrderData(data1, args);
        logFile(postdata, "订单结算页提交的数据", ".json");
        /* writeFile("a1.json", getTransformData(postdata));
  writeFile("a2.json", getTransformData(await getPageData(args))); */
        if (!config.isSubmitOrder) {
          return;
        }
        return handler();
      } catch (e) {
        if (e.code === 2 && t && Date.now() < t) {
          let { params } = transformOrderData(data1, args, "address_1");
          console.log(moment().format(), "淘宝刷单中");
          await delay(30);
          let data = await requestData(
            "mtop.trade.order.adjust.h5",
            {
              params,
              feature: `{"gzip":"false"}`
            },
            "post",
            "4.0",
            "#t#ip##_h5_2019"
          );
          [/* "endpoint",  */ "linkage" /* , "hierarchy" */].forEach(key => {
            if (data[key]) {
              data1[key] = data[key];
            }
          });
          if (data.data.submitOrder_1) {
            data1.data = data.data;
          }
          // data1 = data;
          return f1(t);
        } else {
          throw new Error(e.message);
        }
      }
    };
    let now = Date.now();
    let t = args.jianlou ? now + 1000 * 60 * args.jianlou : undefined;
    f1(t);
    return delay(50);
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

  prev_id = "";
  async buyDirect(args: ArgBuyDirect, p?: Promise<void>) {
    var data = await getGoodsInfo(args.url, args.skus);
    if (this.prev_id === data.itemId) {
      throwError("重复下单");
    }
    this.prev_id = data.itemId;
    // if (data.quantity < args.quantity) {
    //   if (args.jianlou) {
    //     let p = this.waitForStock(args, args.jianlou);
    //     p.then(async () => {
    //       console.log("有库存了，开始去下单");
    //       if (args.from_cart) {
    //         /* let id = await this.cartAdd({
    //           url: args.url,
    //           quantity: args.quantity,
    //           skus: args.skus
    //         }); */
    //         return this.coudan({
    //           urls: [args.url],
    //           quantities: [args.quantity],
    //           expectedPrice: args.expectedPrice!
    //         });
    //       }
    //       return this.submitOrder(
    //         Object.assign(args, {
    //           data: this.getNextDataByGoodsInfo(data, args.quantity)
    //         })
    //       );
    //     });
    //   } else {
    //     throwError("无库存了");
    //   }
    // } else {
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
    // }
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

  async cartBuy(
    args: { items: any[]; jianlou?: number; expectedPrice?: number },
    p?: Promise<void>
  ) {
    if (p) {
      await p;
    }
    return this.submitOrder({
      data: {
        buyNow: "false",
        buyParam: args.items.map(({ settlement }) => settlement).join(","),
        spm: setting.spm
      },
      other: {},
      jianlou: args.jianlou,
      expectedPrice: args.expectedPrice
    });
  }
}

export const taobaoOrderMobile = new TaobaoOrderMobile();
