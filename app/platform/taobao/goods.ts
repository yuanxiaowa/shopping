import iconv = require("iconv-lite");
import { getJsonpData, createScheduler } from "../../../utils/tools";
import {
  transformMobileGoodsInfo,
  getMobileCartList
} from "./mobile-data-transform";
import moment = require("moment");
import { config } from "../../common/config";
import { ArgOrder } from "../struct";
import cheerio = require("cheerio");
import qs = require("querystring");
import { getComment } from "../comment-tpl";
import { getReq, getItemId, requestData, logFile } from "./tools";

// https://h5api.m.tmall.com/h5/com.taobao.mtop.deliver.getaddresslist/2.0/?jsv=2.4.0&appKey=12574478&t=1563378313960&sign=f0e97945748477d409a623c2cf6cad16&api=com.taobao.mtop.deliver.getAddressList&v=2.0&ecode=1&type=jsonp&dataType=jsonp&callback=mtopjsonp1&data=%7B%22addrOption%22%3A%220%22%2C%22sortType%22%3A%220%22%7D

export function getGoodsUrl(itemId: string) {
  return `https://detail.m.tmall.com/item.htm?id=${itemId}`;
}

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

export async function getChaoshiGoodsList(args) {
  var q = args.keyword;
  delete args.keyword;
  var buf = await getReq().get("https://list.tmall.com/chaoshi_data.htm", {
    qs: Object.assign(
      {
        p: 1,
        user_id: 725677994,
        q,
        cat: 50514008,
        sort: "p",
        unify: "yes",
        from: "chaoshi"
      },
      args
    ),
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    },
    encoding: null
  });
  var text = iconv.decode(buf, "gb2312");
  var { srp, status } = JSON.parse(text);
  if (status.success) {
    return srp;
  }
  throw new Error("出错了");
}

export async function getGoodsList(args: any) {}

export async function getGoodsListCoudan(data: any) {
  var page = data.page;
  var q = data.keyword;
  delete data.page;
  delete data.keyword;
  var qs = Object.assign(
    {
      page_size: "20",
      sort: "p",
      q,
      page_no: page,
      callback: "jsonp_20135"
    },
    data
  );
  var text: string = await getReq().get(
    "https://list.tmall.com/m/search_items.htm",
    {
      // page_size=20&sort=s&page_no=1&spm=a3113.8229484.coupon-list.7.BmOFw0&g_couponFrom=mycoupon_pc&g_m=couponuse&g_couponId=2995448186&g_couponGroupId=121250001&callback=jsonp_90716703
      qs,
      headers: {
        referer: "https://list.tmall.com/coudan/search_product.htm"
      }
    }
  );
  var { total_page, item } = getJsonpData(text);
  return {
    total: total_page,
    page,
    items: item
  };
}

/* getTaolijin(
  "https://uland.taobao.com/taolijin/edetail?__share__id__=1&disablePopup=true&share_crt_v=1&spm=a211b4.23403405&src=fklm_hltk&from=tool&suid=314142A8-883C-40DC-A1BF-35942AAD77A9&activityId=2d8973e12a8244d0a40222489e217801&sight=fklm&eh=OdgudzU9bO2ZuQF0XRz0iAXoB%2BDaBK5LQS0Flu%2FfbSp4QsdWMikAalrisGmre1Id0BFAqRODu10eaAILNVfJVIICW0AShlqRrwGSVh%2BekNn6D0w3zIqy6JCSedajNqGKLca%2FMHHzcWHcqzN657atZujgTFwOoHsR9pXoNEnB3r8GQASttHIRqa9oS51D%2BT%2Ft61UeQv7abqSJZ5sS%2BWPoU6DMYDOAAcFNkv53eLl54N2CEGAk2C5LfegNSpmFJzaIWWIVP3HbMF0pboj7Cd1cQ%2F47SzsQhGnVVW6yqqeGJ%2FI%3D&sp_tk=77%2BlclZtQ1lTWWJjbzDvv6U%3D&sourceType=other&un=edd7dcd5e244e22b7415b581aeef1d0d&disableSJ=1&visa=13a09278fde22a2e&union_lens=lensId%3A0b0b1f78_0c63_16bfeecf056_3e9a%3Btraffic_flag%3Dlm&ttid=201200%40taobao_iphone_8.8.0&pid=mm_115130017_72750206_13960100382&sourceType=other&suid=d8682f98-45b7-4ced-8e3e-dc5cdcd9a311&ut_sk=1.XPxqyg%2F9b3UDABYgpjofB2SA_21646297_1563362314753.TaoPassword-QQ.windvane"
).then(console.log); */
// getCouponEdetail(
//   "https://uland.taobao.com/coupon/edetail?e=YOamQhkx9mMGQASttHIRqbf5Z9N7hSKqLKHbu8BwQo%2Bj9UWXND5EftuQqz1uTc5MU3jGil2r0%2B%2FZLbIdLtK%2Fa9jujJ%2FgN9Zi5MS0TQxqBjMXb7FQThC3mvsnwWZGSCD41ug731VBEQm0m3Ckm6GN2CwynAdGnOngkM20EQQvoa5qE39CYibXZdwlqg42JjTi&traceId=0b88592015633693203312365e&union_lens=lensId:0b153bbd_0b65_16c0012af9f_67cb&xId=ayWegUX8NmYbhUR79FvJEvf3ZEDyY7Jf2dWwLvSozVqrjmkkM0iMm7LOi5iq50nWFhHUqd4viXRxMpreweVB1F&ut_sk=1.utdid_null_1563369321802.TaoPassword-Outside.taoketop&sp_tk=77+lVTJ4Y1lTWERvUmbvv6U="
// ).then(console.log);

export async function getGoodsInfo(url: string, skus?: number[]) {
  var itemId = getItemId(url);
  /* 
    ttid: "2017@taobao_h5_6.6.0",
    AntiCreep: "true",
   */
  var data = await requestData(
    "mtop.taobao.detail.getdetail",
    { itemNumId: itemId },
    "get"
  );
  return transformMobileGoodsInfo(data, skus);
}

const spm = "a222m.7628550.0.0";
export async function getRawCartList() {
  return requestData(
    "mtop.trade.querybag",
    {
      exParams: JSON.stringify({
        mergeCombo: "true",
        version: "1.0.0",
        globalSell: "1",
        spm,
        cartfrom: "detail"
      }),
      isPage: "false",
      extStatus: "0",
      spm,
      cartfrom: "detail"
    },
    "get",
    "5.0"
  );
}

export async function getCartList() {
  return getMobileCartList(await getRawCartList());
}

export async function addCart(args: {
  url: string;
  quantity: number;
  skus?: number[];
}) {
  var itemId;
  var skuId;
  if (/skuId=(\d+)/.test(args.url)) {
    skuId = RegExp.$1;
    itemId = /id=(\d+)/.exec(args.url)![1];
  } else {
    var res = await getGoodsInfo(args.url, args.skus);
    if (res.quantity === 0) {
      throw new Error("无库存了");
    }
    skuId = res.skuId;
    itemId = res.itemId;
  }
  var { cartId } = await requestData(
    "mtop.trade.addbag",
    {
      itemId,
      quantity: args.quantity,
      exParams: JSON.stringify({
        addressId: "9607477385",
        etm: "",
        buyNow: "true",
        _input_charset: "utf-8",
        areaId: "320583",
        divisionId: "320583"
      }),
      skuId
    },
    "post",
    "3.1"
  );
  return cartId;
}

export async function updateCart({ items }, action: string) {
  var { cartId, quantity } = items[0];
  var { hierarchy, data }: any = await getRawCartList();
  var updateKey = Object.keys(data).find(
    key => data[key].fields.cartId === cartId
  )!;
  var key = Object.keys(hierarchy.structure).find(key =>
    hierarchy.structure[key].includes(updateKey)
  )!;
  var cdata = hierarchy.structure[key].reduce((state, key) => {
    var { fields } = data[key];
    state[key] = {
      fields: {
        bundleId: fields.bundleId,
        cartId: fields.cartId,
        checked: fields.checked,
        itemId: fields.itemId,
        quantity: fields.quantity.quantity,
        shopId: fields.shopId,
        valid: fields.valid
      }
    };
    return state;
  }, {});
  cdata[updateKey].fields.quantity = quantity;
  var { cartId } = await requestData(
    "mtop.trade.updatebag",
    {
      p: JSON.stringify({
        data: cdata,
        operate: { [action]: [updateKey] },
        hierarchy
      }),
      extStatus: "0",
      feature: '{"gzip":false}',
      exParams: JSON.stringify({
        mergeCombo: "true",
        version: "1.0.0",
        globalSell: "1",
        spm,
        cartfrom: "detail"
      }),
      spm,
      cartfrom: "detail"
    },
    "post",
    "4.0"
  );
  return cartId;
}

export async function cartToggle() {
  // const page = await newPage();
  // await page.goto("https://cart.taobao.com/cart.htm");
  // // await page.waitForSelector("#J_Go");
  // // @ts-ignore
  // let firstData = await page.evaluate(() => window.firstData);
  // var cartIds: string[] = [];
  // var sellerids: string[] = [];
  // var items: {
  //   cartId: string;
  //   itemId: string;
  //   skuId: string;
  //   quantity: number;
  //   createTime: number;
  //   attr: string;
  // }[] = [];
  // firstData.list.forEach((shop: any) => {
  //   shop.bundles[0].items.forEach((item: any) => {
  //     cartIds.push(item.cartId);
  //     sellerids.push(item.sellerid);
  //     items.push({
  //       cartId: item.cartId,
  //       itemId: item.itemId,
  //       skuId: item.skuId,
  //       quantity: item.amount.now,
  //       createTime: item.createTime,
  //       attr: item.attr
  //     });
  //   });
  // });
  // var data = {
  //   hex: "n",
  //   cartId: cartIds.reverse().join(","),
  //   sellerid: sellerids.join(","),
  //   cart_param: JSON.stringify({
  //     items: items.reverse()
  //   }),
  //   unbalance: "",
  //   delCartIds: cartIds.join(","),
  //   use_cod: false,
  //   buyer_from: "cart",
  //   page_from: "cart",
  //   source_time: Date.now()
  // };
  // await page.evaluate((data: any) => {
  //   var form = document.createElement("form");
  //   form.method = "post";
  //   form.action =
  //     "https://buy.tmall.com/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined";
  //   Object.keys(data).map(key => {
  //     var input = document.createElement("input");
  //     input.type = "hidden";
  //     input.value = data[key];
  //     form.appendChild(input);
  //   });
  //   document.body.appendChild(form);
  //   form.submit();
  // }, data);
  // await page.waitForNavigation();
  // if (!isSubmitOrder) {
  //   await page.setOfflineMode(true);
  // }
  // await page.click(".go-btn");
}

function transformOrderData(orderdata: any, args: ArgOrder<any>) {
  var {
    data,
    linkage,
    hierarchy: { structure, root }
  } = orderdata;
  var invalids = structure[root].filter(name => name.startsWith("invalid"));
  if (invalids.length > 0) {
    throw new Error("有失效宝贝");
  }
  var realPay = data.realPay_1;
  if (typeof args.expectedPrice === "number") {
    if (Number(args.expectedPrice) < Number(realPay.fields.price)) {
      throw new Error("价格太高了，买不起");
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

export async function submitOrder(args: ArgOrder<any>) {
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
    if (e.name === "FAIL_SYS_TRAFFIC_LIMIT" || e.message.includes("被挤爆")) {
      console.log("太挤了，正在重试");
      return submitOrder(args);
    }
    throw e;
  }
  console.timeEnd("订单结算" + r);
  console.log("-------------已经进入手机订单结算页-------------");
  logFile(data1, "手机订单结算页");
  console.log("-------------进入手机订单结算页，准备提交-------------");
  var postdata = transformOrderData(data1, args);
  logFile(postdata, "订单结算页提交的数据");
  /* writeFile("a1.json", getTransformData(postdata));
  writeFile("a2.json", getTransformData(await getPageData(args))); */
  if (!config.isSubmitOrder) {
    return;
  }
  async function handler() {
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
      if (
        e.message.includes("对不起，系统繁忙，请稍候再试") ||
        e.message.includes("被挤爆")
      ) {
        console.log(e.message, "正在重试");
        return handler();
      }
      throw e;
    }
  }
  return handler();
}

export function comment(args: any): Promise<any> {
  /* this.req.post("", {
    form: {
      callback: "RateWriteCallback548",
      _tb_token_: "edeb7b783ff65",
      um_token: "T0eb928a011b00316c98a9fed9edb4b2b",
      action: "new_rate_write_action",
      event_submit_do_write: "any",
      sellerId: "2200811872345",
      bizOrderIdList: "492409251844405857",
      itemId492409251844405857: "591795307112",
      eventId492409251844405857: "",
      parentOrderId: "492409251844405857",
      qualityContent492409251844405857: "fdsfdsafdsaf",
      serviceContent492409251844405857: "fdsaf",
      Filedata: "",
      urls: "",
      merDsr492409251844405857: "5",
      serviceQualityScore: "5",
      saleConsignmentScore: "5",
      anony: "1",
      ishares: "",
      ua:
        "118#ZVWZz7teaQVZ0e/LdH2mpZZTZsHhce/ezeVnvsqTzHRzZRbZXoTXOrezpgqTVHR4Zg2ZOzqTze0cZgYUHDqVze2zZCFhXHvnzhtZZzu7zeRZZgZZ2Yq4zH2zgeu1THWVZZ2ZZ2HhzHRzVgzYcoqVze2ZZVbhXHJmgiguZaq2zeRZZgZZfDqVzOqZzeZ4yH1JZBD1c78nByRuZZYCXfqYZH2zZZCTcHCVx20rEfqhzHWxzZZZV5q44aPiueZhXTVHZg2ZumqTzeRzZZZuVfq4zH2ZZZFhVHW4ZZ2uZ0bTzeRzZZZZ23Z4ze2zZZuXTiXejg2ZjUi5zPErwZubQozqF00nMWTKzLQvxN9m3LIVTHjaVcjjc2L3sKqSh8gTP5S8FDpKyTHCugZCmrDtKHZzhaquuI0DRgZTlItysC/ATH+z8N2Crbz04R4GIE3fdf3gV2gbTR2B7+zF3qqMmOW3N4mlfO6N1SuNkGAumAnxsKbe43gCE87ooXXoLBK3lPdtfJk4fgNaaid3jZa5RF8Y2HhI1WMgXAaXoZuDzJi8DMJT31BZjQHGH2432fvCzMLqB2yvwTQni66GyfOOVCFmOWAV0r+PqIDp5hZ1eB5Bn+p7OMJZSthhoMbH6k0vVh9Quf4xEHzfWFoHsYEPPDKiX23KElhfshnArhpIViJU4HlG5zsJuLxlGC7bW5Oltr5xn91jM4b4w44HlbDpVR9JXL2IQRJRJDV7xegJS2PZd/mtYaf0yA7dr8hb8PGj6N4Snl9fzfvVBqKY7XK/R41in/X1d+tazXEIugNPh4B8nxoRAYgk09rbCXRmoc+ffVjbrkh9hwIywk0m/xX4aP4z0jkihzBTyLDdz3xOp7FdrIbfBA0xlcfAftRigVieQTOVzg==",
      "492409251844405857_srNameList": ""
    }
  }); */
  return Promise.all(args.orderIds.map(commentOrder));
}

export async function seckillList(name: string) {
  if (name === "chaoshi") {
    let {
      resultValue: { data }
    } = await requestData(
      "mtop.tmall.kangaroo.core.service.route.PageRecommendService",
      {
        // https://pages.tmall.com/wow/chaoshi/act/wupr?ut_sk=1.WkOnn8QgYxYDAC42U2ubIAfi_21380790_1564621722050.Copy.chaoshi_act_page_tb&acm=201903280.1003.2.6362801&spm=a3204.12691414.1996846437.dBrand1&disableNav=YES&wh_pid=act%2Fbtbt&pos=1&wh_biz=tm&disableAB=true&suid=F566F29F-EC9D-41E1-94D3-C01BE8CAF17A&sourceType=other&utparam=%7B%22ranger_buckets%22%3A%223042%22%7D&scm=1003.2.201903280.OTHER_1564295073903_6362801&ttid=201200%40taobao_iphone_8.8.0&un=35fb12d24e9c47d946e6040d6f65052e&share_crt_v=1&sp_tk=77+lME0wOFlSV29jemLvv6U=&cpp=1&shareurl=true&short_name=h.eiq3Ce6&sm=4fb1c6&app=chrome
        // https://pages.tmall.com/wow/chaoshi/act/wupr?ut_sk=1.WkOnn8QgYxYDAC42U2ubIAfi_21380790_1563192248243.Copy.chaoshi_act_page_tb&__share__id__=1&share_crt_v=1&disableNav=YES&wh_pid=act%2Fxsj23874&tkFlag=1&disableAB=true&suid=1031708C-2844-47E2-B140-3CF358C1BD43&type=2&sp_tk=77%2BlelYxOVlob1FlTkrvv6U%3D&sourceType=other&tk_cps_param=127911237&un=04ec1ab5583d2c369eedd86203cf18d8&utparam=%7B%22ranger_buckets%22%3A%223042%22%7D&e=PlboetXBlJK4bXDJ8jCpJrfVFcC6KYAblz9f5x7nqEUPJTSplvxzY6R06N4nt-6t_nNM24L0rnGF2sp581q3i4RqxKSGsgCT8sviUM61dt2gxEj7ajbEb4gLMZYNRhg2HXKHH0u77i-I6M_vqqSeLITsM14S2xgDx9iN37b51zJw2qH-L52L1aTWVSTo88aBYOGm2rjvgGhaQJhxUPUeEtKYMBXg69krrlYyo_QbwE_DG_1N5hlzNg&ttid=201200%40taobao_iphone_8.8.0&cpp=1&shareurl=true&spm=a313p.22.kp.1050196516672&short_name=h.eS0ZZuy&sm=933952&app=chrome
        url:
          "https://pages.tmall.com/wow/chaoshi/act/wupr?ut_sk=1.WkOnn8QgYxYDAC42U2ubIAfi_21380790_1564621722050.Copy.chaoshi_act_page_tb&acm=201903280.1003.2.6362801&spm=a3204.12691414.1996846437.dBrand1&disableNav=YES&wh_pid=act%2Fbtbt&pos=1&wh_biz=tm&disableAB=true&suid=F566F29F-EC9D-41E1-94D3-C01BE8CAF17A&sourceType=other&utparam=%7B%22ranger_buckets%22%3A%223042%22%7D&scm=1003.2.201903280.OTHER_1564295073903_6362801&ttid=201200%40taobao_iphone_8.8.0&un=35fb12d24e9c47d946e6040d6f65052e&share_crt_v=1&sp_tk=77+lME0wOFlSV29jemLvv6U=&cpp=1&shareurl=true&short_name=h.eiq3Ce6&sm=4fb1c6&app=chrome",
        cookie: "sm4=320506;hng=CN|zh-CN|CNY|156",
        device: "phone",
        backupParams: "device"
      },
      "get",
      "1.0"
    );
    let key = Object.keys(data).find(key => data[key].secKillItems);
    if (key) {
      let secKillItems = data[key].secKillItems;
      let mapping = {};
      for (let item of secKillItems) {
        let { secKillTime } = item;
        let secKillTimeArr = secKillTime.split(",");
        secKillTimeArr.forEach(t => {
          var data = {
            id: item.itemId,
            quantity: item.itemNum,
            title: item.itemTitle,
            itemSecKillPrice: item.itemSecKillPrice,
            price: item.itemTagPrice
          };
          if (!mapping[t]) {
            mapping[t] = [data];
          } else {
            mapping[t].push(data);
          }
        });
      }
      return Object.keys(mapping)
        .sort()
        .map(time => ({
          time,
          items: mapping[time]
        }));
    }
  }
  return [];
}

export async function getCoupons({ page }: { page: number }) {
  var buf: Buffer = await getReq().get(
    "https://taoquan.taobao.com/coupon/list_my_coupon.htm",
    {
      qs: {
        sname: "",
        ctype: "44,61,65,66,247",
        sortby: "",
        order: "desc",
        page
      },
      encoding: null
    }
  );
  var html: string = iconv.decode(buf, "gb2312");
  var $ = cheerio.load(html);
  var items = $(".tmall-coupon-box:not(.tmall-coupon-out)")
    .not(".tmall-coupon-used")
    .map((index, ele) => {
      var $ele = $(ele);
      var $detail = $(ele).find(".key-detail");
      var title = $detail.text().trim();
      var limit = $ele
        .find(".limit-text")
        .text()
        .trim();
      var time = $detail
        .next()
        .text()
        .trim();
      var url = $ele.find(".btn").attr("href");
      var arr = /满(.*?)可使用(.*?)元/.exec(title)!;
      return {
        title,
        limit,
        time,
        url,
        params: qs.parse(url.substring(url.indexOf("?") + 1)),
        quota: arr[1],
        price: arr[2]
      };
    })
    .get();
  var total = Number(
    $(".vm-page-next")
      .prev()
      .text()
  );
  return {
    page,
    total,
    items
  };
}

export async function getSixtyCourse(actId: string) {
  var {
    answerDate,
    answered,
    courseVOList,
    sellerId,
    lotteryCount
  }: {
    answerDate?: string[];
    answered: ("true" | "false")[];
    sellerId: string;
    lotteryCount: string;
    courseVOList: {
      id: string;
      desc: string;
      options: Record<string, string>;
    }[];
  } = await requestData(
    "mtop.tmall.fansparty.sixty.getAct",
    {
      actId
    },
    "get",
    "1.0"
  );
  var finished = !answered.includes("false");
  var todayAnswered = false;
  var options = {};
  var title = "";
  var courseId = "";
  if (!finished) {
    var i = 0;
    moment.duration(1, "d");
    if (answerDate) {
      todayAnswered =
        moment().diff(
          moment(answerDate[answerDate.length - 1].split(" ")[0], "yyyy-MM-DD")
        ) <= moment.duration(1, "days").asMilliseconds();

      if (todayAnswered) {
        i = answerDate.length - 1;
      } else {
        i = answerDate.length;
      }
    }
    title = courseVOList[i].desc;
    courseId = courseVOList[i].id;
    options = courseVOList[i].options;
  }
  return {
    actId,
    finished,
    todayAnswered,
    title,
    options,
    courseId,
    sellerId,
    lotteryCount: Number(lotteryCount)
  };
}

export async function sixtyCourseList() {
  var html: string = await getReq().get(
    "https://pages.tmall.com/wow/fsp/act/60sclass?q=%E5%A4%A9%E7%8C%AB60%E7%A7%92%E8%AF%BE%E5%A0%82&isFull=true&pre_rn=c21dff5a538d1c77a9e5c29674eefe94&scm=20140655.sc_c21dff5a538d1c77a9e5c29674eefe94"
  );
  var r = /<textarea style="display: none" class="vue-comp-data">(.*)<\/textarea>/g;
  r.test(html);
  var text = r.exec(html)![1];
  var {
    $root: {
      moqieDataWl: { jsonStr }
    }
  } = JSON.parse(text.replace(/&quot;/g, '"'));
  var {
    content: { areas }
  } = JSON.parse(jsonStr);
  var actIds = Object.keys(areas).map(
    key => /actId=(\w+)/.exec(areas[key].data.href)![1]
  );
  return Promise.all(actIds.map(getSixtyCourse));
}

export async function checkLogin() {
  try {
    await requestData("mtop.user.getUserSimple", {}, "get", "1.0");
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 检测是否已关注
 * @param data
 */
export async function checkFollowRelation(data: {
  targetId: string;
  followTag: string;
  source: string;
  bizName: string;
}) {
  var { followResult } = await requestData(
    "mtop.tmall.caitlin.relation.common.follow",
    data,
    "get",
    "1.0"
  );
  return followResult === "true";
}

/**
 * 打开邀请函
 * @param data
 */
export async function openInvitation() {}

export async function sixtyCourseReply({
  actId,
  courseId,
  option,
  sellerId,
  todayAnswered,
  finished
}: {
  actId: string;
  courseId: string;
  option: string;
  sellerId: string;
  todayAnswered: boolean;
  finished: boolean;
}) {
  if (!finished && !todayAnswered) {
    await requestData(
      "mtop.tmall.fansparty.sixty.answer",
      {
        actId,
        courseId,
        option
      },
      "get",
      "1.0"
    );
  }
  var data = await requestData(
    "mtop.tmall.fansparty.sixty.getlotterytoken",
    {
      actId,
      lotteryType: "shareLottery"
    },
    "get",
    "1.0"
  );
  var token = data.result;
  var res3 = await requestData(
    "mtop.tmall.fansparty.fansday.superfansinvation.openinvitation",
    {
      sellerId,
      actId,
      token
    },
    "get",
    "1.0"
  );
  var { awards } = res3;
  return awards;
}

export async function commentList(page = 1) {
  var {
    data: { group, meta }
  } = await requestData(
    "mtop.order.queryboughtlist",
    {
      appName: "tborder",
      appVersion: "1.0",
      tabCode: "waitRate",
      page
    },
    "get",
    "4.0",
    "##h5"
  );
  let items = group.map(obj => {
    let id = Object.keys(obj)[0];
    let list = obj[id].filter(
      ({ cellType, cellData }) => cellType === "sub" && cellData[0].fields.pic
    );
    let title = list.map(({ cellData }) => cellData[0].fields.title).join(",");
    let img = list[0].cellData[0].fields.pic;
    let url = list[0].cellData[0].fields.pic;
    return {
      id,
      items: [
        {
          id,
          title,
          img,
          url
        }
      ]
    };
  });
  return {
    items,
    page,
    more: page < Number(meta.page.fields.totalPage)
  };
}

const executer = createScheduler();

export async function commentOrder(orderId: string) {
  var { subOrderRateInfos } = await requestData(
    "mtop.order.getOrderRateInfo",
    {
      orderId
    },
    "get",
    "1.0"
  );
  var items = subOrderRateInfos.map(item => {
    var ret: any = {
      key: item.key,
      feedback: getComment(),
      rateAnnoy: "1",
      ratePicInfos: [item.auctionInfo.auctionPicUrl]
    };
    if (item.orderMerchandiseScore) {
      ret.orderMerchandiseScore = "5";
    }
    if (item.rateResult) {
      ret.rateResult = "1";
    }
    return ret;
  });
  return executer(() =>
    requestData(
      "mtop.order.doRate",
      {
        mainOrderRateInfo:
          '{"serviceQualityScore":"5","saleConsignmentScore":"5"}',
        subOrderRateInfo: JSON.stringify(items),
        orderId
      },
      "get",
      "3.0"
    )
  );
}
