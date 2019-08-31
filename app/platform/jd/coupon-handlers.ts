/*
 * @Author: oudingyin
 * @Date: 2019-07-12 15:37:17
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-31 16:08:15
 */
import {
  logFile,
  getBaseData,
  getCookie,
  executer,
  requestData,
  getGoodsUrl
} from "./tools";
import { getJsonpData, delay } from "../../../utils/tools";
import moment = require("moment");
import setting from "./setting";
import { DT } from "../../common/config";
import { flatten } from "ramda";

export async function queryGoodsCoupon(data: {
  skuId: string;
  vid: number;
  cid: string;
}) {
  var text: string = await setting.req.post(
    `https://wq.jd.com/mjgj/fans/queryusegetcoupon`,
    {
      qs: {
        callback: "getCouponListCBA",
        platform: 3,
        cid: data.cid,
        sku: data.skuId,
        popId: data.vid,
        t: Math.random(),
        // g_tk: time33(getCookie("wq_skey")),
        g_ty: "ls"
      }
    }
  );
  interface T {
    key: string;
    roleId: number;
    owned?: boolean;
    name: string;
    // 0:满减 1:打折
    couponType: number;
    discount: number;
    quota: number;
    discountdesc: {
      // 最高减多少
      high: string;
      info: {
        // 满多少减
        quota: string;
        // 多少折
        discount: string;
      }[];
    };
  }
  var { coupons, use_coupons } = getJsonpData<{
    coupons: T[];
    use_coupons: {
      id: number;
      type: number;
      quota: string;
      parValue: string;
      // 0：不展示 1：展示
      couponKind: number;
      name: string;
    }[];
  }>(text);
  return <T[]>[
    ...coupons,
    ...use_coupons
      .filter(item => item.type === 1)
      .map(item => ({
        owned: true,
        name: item.name,
        id: item.id,
        quota: +item.quota,
        discount: +item.parValue,
        couponType: item.type
      }))
  ];
}

export async function obtainGoodsCoupon(data: { roleId: number; key: string }) {
  var text: string = await setting.req.get(
    `https://wq.jd.com/activeapi/obtainjdshopfreecouponv2`,
    {
      qs: {
        sceneval: "2",
        callback: "ObtainJdShopFreeCouponCallBackA",
        scene: "2",
        key: data.key,
        roleid: data.roleId,
        t: Math.random(),
        // g_tk: time33(getCookie("wq_skey")),
        g_ty: "ls"
      },
      headers: {
        Referer: "https://item.m.jd.com/product/36850022644.html"
      }
    }
  );
  logFile(text, "商品下方领券");
  return getJsonpData<{
    batchid: string;
    code: number;
    couponid: string;
    message: string;
  }>(text);
}

/**
 * 查询楼层优惠券
 * @param url
 * @example https://wqs.jd.com/event/promote/game11/index.shtml?cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=3f8d9f58aed14a30a581d169f573ced2
 * @example https://wqs.jd.com/event/promote/zdm18/index.shtml?cu=true&sid=b3234f60d61e8b4e3b5a8e703c321b0w&un_area=19_1601_50258_50374&_ts=1557200825024&ad_od=share&scpos=#st=6455&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=c842a3cb81d948899b818c0602bd9b8d
 * @example https://wq.jd.com/webportal/event/25842?cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_1001480949_&utm_term=fd39ee31c9ee43e1b1b9a8d446c74bf3&scpos=#st=0
 */
export async function queryFloorCoupons(url: string) {
  let html: string = await setting.req.get(url);
  let text = /window\._componentConfig=(.*);/.exec(html)![1];
  let items: {
    name: string;
    data: {
      list: {
        key: string;
        gate: string;
        price: string;
        // 1
        type: number;
        level: string;
        name: string;
        // 0:可领 1:已领 2:已领光
        status: string | number;
        begin: string;
        end: string;
      }[];
      extend: {
        active: {
          key: string;
          level: string;
        }[];
      };
    };
  }[] = JSON.parse(text);
  let coupon_items = items.filter(
    ({ name }) => name === "coupon" || name === "userbenefit"
  );
  // 校验状态，暂时不需要
  // https://wq.jd.com/active/querybingo?callback=cb_quan_daogou06A&active=daogou06&g_tk=1461522350&g_ty=ls
  // Referer: https://wqs.jd.com/event/promote/game11/index.shtml
  let now = Date.now();
  return coupon_items
    .map(({ data, name }) => {
      if (name === "coupon") {
        return data.list.filter(
          ({ begin, end, status }) =>
            now >= new Date(begin).getTime() &&
            now < new Date(end).getTime() &&
            (typeof status === "undefined" || status === 0)
        );
      }
      return data.extend.active;
    })
    .filter(items => items.length > 0);
}

export async function obtainFloorCoupon(data: { key: string; level: string }) {
  /* let g_pt_tk: any = getCookie("pt_key") || undefined;
  if (g_pt_tk) {
    g_pt_tk = time33(g_pt_tk);
  } */
  var ret: string = await setting.req.get(
    "https://wq.jd.com/active/active_draw",
    {
      qs: {
        active: data.key,
        level: data.level,
        _: Date.now(),
        g_login_type: "0",
        callback: "jsonpCBKE",
        // g_tk: time33(getCookie("wq_skey")),
        // g_pt_tk,
        g_ty: "ls"
      },
      headers: {
        Referer: "https://wqs.jd.com/event/promote/mobile8/index.shtml"
      }
    }
  );
  /* try{ jsonpCBKA(
{
   "active" : "daogou06",
   "award" : {
      "awardcode" : "",
      "awardmsg" : "",
      "awardret" : 2
   },
   "bingo" : {
      "bingolevel" : 0,
      "bingomsg" : "",
      "bingoret" : 2
   },
   "ret" : 2,
   "retmsg" : "未登录"
}
);}catch(e){} */
  var result = getJsonpData(ret);
  // "retmsg" : "您参与得太频繁了，请稍后再试"
  if (result.ret === 145) {
    await delay(1000);
    return obtainFloorCoupon(data);
  }
  return result;
}

/**
 * 查询活动主题优惠券
 * @param url
 * @example https://pro.m.jd.com/mall/active/4FziapEprFVTPwjVx19WRDMTbbbF/index.html?utm_source=pdappwakeupup_20170001&utm_user=plusmember&ad_od=share&utm_source=androidapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL
 * @example https://pro.m.jd.com/mall/active/4BgbZ97pC8BvPgCDDTvPaSTYWaME/index.html?cu=true&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_1001480949_&utm_term=db75fe82545e4f18aaee199a2831c0fa
 * @example https://pro.m.jd.com/mall/active/4M3v49dheo7VXKXnQ8Y7yT99QGmo/index.html?cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=caf8ffe18b8a416e9d9a3c22e01c83f1
 */
export async function queryActivityCoupons(url: string) {
  let html: string = await setting.req.get(url);
  let arr = /window.(dataHub\d+|__react_data__)\s*=(.*?)(;|\n)/.exec(html)!;
  let key = arr[1];
  let data = JSON.parse(arr[2]);
  if (key === "__react_data__") {
    data = data.activityData.floorList;
  }
  let activityId = /active\/(\w+)/.exec(url)![1];
  let simpleCoupons = arr[2].match(/\/\/jrmkt\.jd\.com\/[^"]+/g) || [];
  simpleCoupons = simpleCoupons.concat(
    arr[2].match(/\/\/btmkt\.jd\.com\/[^"]+/g) || []
  );
  simpleCoupons = simpleCoupons.map(url => `https:${url}`);
  let items: {
    cpId: string;
    args: string;
    srv: string;
    jsonSrv: string;
    // 0:满减 2:白条
    // 0:可领 1:已领取 3:今日已领取 4:今日已抢完
    status: string;
    // 1
    scene: string;
    beginPeriod?: string;
    endPeriod?: string;
    scope: string;
    limit: string;
    discount: string;
  }[] = flatten<any>(
    Object.keys(data)
      .filter(key => data[key].couponList)
      .map(key =>
        data[key].couponList
          .filter(({ status }) => status === "0")
          .map(item =>
            Object.assign(item, {
              activityId,
              actKey: item.cpId,
              dp: Number(/\d+/.exec(item.limit)![0]) - Number(item.discount)
            })
          )
      )
  ).sort((keyA, keyB) => {
    return keyA.dp - keyB.dp;
  });
  return {
    items,
    simpleCoupons
  };
}

export async function obtainActivityCoupon(data: {
  activityId: string;
  args: string;
  scene: string;
  childActivityUrl: string;
  actKey: string;
  discount: string;
  limit: string;
}) {
  var ret: string = await setting.req.post(
    `https://api.m.jd.com/client.action?functionId=newBabelAwardCollection`,
    {
      form: {
        body: JSON.stringify({
          actKey: data.actKey,
          activityId: data.activityId,
          from: "H5node",
          scene: data.scene,
          args: data.args,
          platform: "3",
          orgType: "2",
          openId: "-1",
          pageClickKey: "Babel_Coupon",
          shshshfp: getCookie("shshshfp"),
          shshshfpa: getCookie("shshshfpa"),
          shshshfpb: getCookie("shshshfpb"),
          childActivityUrl: data.childActivityUrl,
          mitemAddrId: "",
          geo: { lng: "", lat: "" },
          addressId: "",
          posLng: "",
          posLat: "",
          focus: "",
          innerAnchor: "",
          ...getBaseData()
        }),
        client: "wh5",
        clientVersion: "1.0.0",
        sid: "",
        uuid: "15617018266251592388825",
        area: ""
      }
    }
  );
  var resData = JSON.parse(ret);
  // A7:您来早了，活动还没开始哟，请稍后再来~
  // D2:本时段优惠券已抢完，请10:00再来吧！
  // A1:领取成功！感谢您的参与，祝您购物愉快~
  console.log(data.discount + "," + data.limit);
  if (resData.subCode === "A7" || resData.subCode === "A28") {
    console.log(resData.subCodeMsg);
    (() => {
      let hours = ["08", "10", "12", "14", "16", "18", "20"];
      let now = moment();
      let h = "00";
      for (let _h of hours) {
        if (now.get("h") < Number(_h)) {
          h = _h;
          break;
        }
      }
      let to_date = moment(h, "HH");
      if (h === "00") {
        to_date.add("d", 1);
      }
      console.log(to_date.format(), "开始抢券");
      delay(to_date.valueOf() - Date.now() - DT.jingdong).then(() =>
        obtainActivityCoupon(data)
      );
    })();
  } else if (resData.subCode === "D2") {
    console.log(resData.subCodeMsg);
    (() => {
      let to_date = moment(/\d{2}:\d{2}/.exec(resData.subCodeMsg)![0], "HH");
      console.log(to_date.format(), "开始抢券");
      delay(to_date.valueOf() - Date.now() - DT.jingdong).then(() =>
        obtainActivityCoupon(data)
      );
    })();
  }
  return resData;
}

/**
 * 领取全品券
 * @param url
 * @param phone
 * @example https://h5.m.jd.com/dev/2tvoNZVsTZ9R1aF1T4fDthhd6bm1/index.html?type=out_station&id=f128d673441d4afa9fa52b2f61818591&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=d88e8a25670040f38f3d0dfc8f9542b9
 */
export async function getQuanpinCoupon(url: string, phone = "18605126843") {
  var { searchParams } = new URL(url);
  var data = await requestData(
    {
      actId: searchParams.get("id"),
      phone,
      code: "",
      country: "cn",
      platform: "3",
      pageClickKey: "-1",
      userArea: "",
      ...getBaseData()
    },
    {
      functionId: "activityLongPage",
      api: ""
    }
  );
  let {
    returnStatus,
    status: { minorTitle, activityUrl }
  }: {
    // 1:已抢光 3:没领到
    returnStatus: number;
    status: {
      minorTitle: string;
      activityUrl: string;
    };
  } = data;
  logFile(data, "手机号领取全品券");
  return {
    success: returnStatus !== 1 && returnStatus !== 3,
    url: activityUrl,
    msg: minorTitle
  };
}

/**
 *
 * @param url
 * @example https://h5.m.jd.com/babelDiy/Zeus/qYwUMpSiiovLbsS5Lw4XNf8u58r/index.html?lng=104.758990&cu=true&un_area=12_911_914_51563&sid=e14edc99d2ab2581774bbbd84f47296w&_ts=1564765855849&utm_user=plusmember&ad_od=share&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=f693db4b94cd4620afcb394dcff92bdf
 */
export async function getCouponZeus(url: string) {
  // var { searchParams } = new URL(url);
  var { bankCoupons, normalCoupons } = await requestData(
    {
      activityId: "00461561",
      pageId: "1044474",
      qryParam: JSON.stringify([
        {
          type: "advertGroup",
          id: "03590654",
          mapTo: "normalCoupons",
          next: [
            {
              type: "plusCoupon",
              subType: "material",
              mapKey: "comment[0]",
              mapTo: "cate"
            }
          ]
        },
        {
          type: "advertGroup",
          id: "03592688",
          mapTo: "bankCoupons",
          next: [{ type: "jrCoupon", mapKey: "extension.key", mapTo: "cate" }]
        },
        {
          type: "productGroup",
          id: "09963245",
          mapTo: "giftskus",
          diversityFilter: "1,5,9,13,17",
          dupliRemovalFlag: 1
        },
        { type: "advertGroup", id: "03602534", mapTo: "loveListDataGirl" },
        { type: "advertGroup", id: "03602977", mapTo: "loveListDataBoy" },
        { type: "advertGroup", id: "03607171", mapTo: "loveListDataSingle" },
        { type: "advertGroup", id: "03603919", mapTo: "rankTab" },
        {
          type: "productGroup",
          id: "09965963",
          mapTo: "more",
          diversityFilter: "1,5,9,13,17"
        }
      ])
    },
    {
      functionId: "qryCompositeMaterials",
      api: "client.action"
    }
  );
  return Promise.all(
    bankCoupons.list.concat(normalCoupons.list).map(item =>
      executer(() =>
        requestData(
          {
            scene: 3,
            actKey: item.link,
            activityId: /Zeus\/(\w+)/.exec(url)![1]
          },
          {
            functionId: "newBabelAwardCollection",
            api: "client.action"
          }
        )
      )
    )
  );
}

/**
 * 领取单张优惠券
 * @param url
 * @example https://coupon.m.jd.com/coupons/show.action?key=95f6d76c6af84f61b6431c128938a9a6&roleId=20962745&to=https://pro.m.jd.com/mall/active/VfaRyNj2vtwfoWgUEFoqGzF4B1Z/index.html&sceneval=2&time=1563640816871
 */
export async function getCouponSingle(url: string) {
  var { searchParams } = new URL(url);
  var text: string = await setting.req.get(
    "https://s.m.jd.com/activemcenter/mfreecoupon/getcoupon",
    {
      qs: {
        key: searchParams.get("key"),
        roleId: searchParams.get("roleId"),
        to: searchParams.get("to"),
        verifycode: "",
        verifysession: "",
        _: Date.now(),
        sceneval: searchParams.get("sceneval"),
        g_login_type: "1",
        callback: "jsonpCBKA",
        g_ty: "ls"
      },
      headers: {
        Referer: url
      }
    }
  );
  var { ret, errmsg } = getJsonpData(text);
  // 145:提交频繁 16:已抢完
  return {
    success: ret === 0,
    msg: errmsg
  };
}

export async function getShopCoupons(url: string) {
  var html: string = await setting.req.get(url);
  var text = /window.SHOP_COUPONS\s*=\s*(\[[\s\S]*?\])\s*;/.exec(html)![1];
  var now = Date.now();
  var coupons: any[] = JSON.parse(text).filter(
    item =>
      moment(item.beginTime, "yyyy.MM.DD").valueOf() <= now &&
      now < moment(item.endTime, "yyyy.MM.DD").valueOf()
  );
  var urls: string[] =
    html.match(
      /https?:\/\/coupon\.m\.jd\.com\/coupons\/show\.action\?[^"']+/g
    ) || [];
  return { urls, coupons };
}

/**
 * 领取内部优惠券
 * @param url
 * @example https://jingfen.jd.com/item.html?sku=46004095519&q=FXYTFBFuGHUWFRxfEHYQFRVsQCNGExRpFXQVFhxoE3cTFkZtESEUQBY/FiUiFhRrEHkaExFfVyVNQEAsfgZzBxI8GXAWE0M8FXQbExE/QyEbFR1pESUSRxE/EHIaFRJtIHERFxVvFnUQEQ==&d=9GSoGc&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_1001480949_&utm_term=ba3d0b36811c4075bece3cc17c6a3e56
 */
export async function getJingfen(url: string) {
  var { searchParams } = new URL(url);
  var sku = searchParams.get("sku")!;
  var q = searchParams.get("q");
  /* var { status }:{
    // 0:可领取 1:领取限制
    status: number
    // 1:优惠券
    couponType: number
  } = await requestData(
    {
      sku,
      q,
      eid: "-1",
      fp: "-1",
      shshshfp: "-1",
      shshshfpa: "-1",
      shshshfpb: "-1",
      referUrl: url,
      childActivityUrl: url,
      pageClickKey: "MJDAlliance_CheckDetail"
    },
    {
      functionId: "skuWithCoupon"
    }
  );
  var success = status === 0 */
  var success = true;
  var msg = "";
  try {
    await requestData(
      {
        sku,
        q,
        wxtoken: "",
        shshshfp: getCookie("shshshfp"),
        shshshfpa: getCookie("shshshfpa"),
        shshshfpb: getCookie("shshshfpb"),
        referUrl: url,
        childActivityUrl: url,
        pageClickKey: "MJDAlliance_CheckDetail",
        ...getBaseData()
      },
      {
        functionId: "jingfenCoupon"
      }
    );
  } catch (e) {
    msg = e.message;
    success = msg === "您今天已经参加过此活动，别太贪心哟，明天再来~";
  }
  return {
    success,
    url: getGoodsUrl(sku),
    msg
  };
}

export async function getFanliCoupon(url: string) {
  var { searchParams } = new URL(url);
  /* 
  var text = await req.get("https://ifanli.m.jd.com/rebate/act/getCouponSkuDetail", {
    qs: {
      platform: searchParams.get("platform"),
      skuId: searchParams.get("skuId"),
      type: searchParams.get("type"),
      activityId: searchParams.get("activityId")
    }
  });
  var {content,code,msg} = JSON.parse(text)
  if (code !== 1) {
    throw new Error(msg)
  } */
  var text = await setting.req.get(
    "https://ifanli.m.jd.com/rebate/userCenter/takeCoupon",
    {
      qs: {
        platform: null,
        skuId: searchParams.get("skuId"),
        type: searchParams.get("type"),
        activityId: searchParams.get("activityId") || "",
        pageClickKey: `"coupon_icon${searchParams.get(
          "couponIndex"
        )}goods${searchParams.get("goodIndex")}get2"`
      },
      headers: {
        Referer: url
        // "user-agent":
        // "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3835.0 Safari/537.36"
      }
    }
  );
  var { content, code, msg } = JSON.parse(text);
  if (code !== 1) {
    throw new Error(msg);
  }
  return content;
}

/**
 * 领券中心可叠加券
 * @param page
 */
export async function getCouponCenterQuanpinList(
  page = 1
): Promise<
  {
    key: string;
  }[]
> {
  var text = await setting.req.get(
    "https://a.jd.com/indexAjax/getCouponListByCatalogId.html",
    {
      qs: {
        callback: "jQuery6429763",
        catalogId: 118,
        page,
        pageSize: 30
      },
      headers: {
        "x-requested-with": "XMLHttpRequest",
        referer: "https://a.jd.com/"
      }
    }
  );
  var { couponList } = getJsonpData(text);
  console.log(couponList.length);
  return couponList.filter(
    item => item.overlying && item.limitStr.startsWith("全品类")
  );
}

/**
 * 领取领券中心优惠券
 * @param key
 */
export async function getCouponCenterQuanpin(
  key: string
): Promise<{
  /**
   * 15:已参加过
   * 22:此时排队领券的人太多，休息一会儿再试试吧
   */
  code: string;
  message: string;
}> {
  var text = await setting.req.get(
    "https://a.jd.com/indexAjax/getCoupon.html",
    {
      qs: {
        callback: "jQuery4276212",
        key,
        type: 1
      },
      headers: {
        "x-requested-with": "XMLHttpRequest",
        referer: "https://a.jd.com/"
      }
    }
  );
  return getJsonpData(text);
}

/**
 * 获取plus全品券
 */
export async function getPlusQuanpinList(): Promise<
  {
    batchId: string;
    couponKey: string;
    discount: number;
  }[]
> {
  var text = await setting.req.get(
    "https://plus.jd.com/coupon/dayCoupons?locationCode=10006"
  );
  var {
    result: { coupons }
  } = JSON.parse(text);
  return coupons;
}

/**
 * 领取plus全品
 * @param item
 */
export async function getPlusQuanpin(item: any) {
  var text = await setting.req.get(
    "https://plus.jd.com/coupon/receiveDayCoupon",
    {
      qs: {
        couponKey: item.couponKey,
        discount: item.discount,
        locationCode: 10006,
        platform: 0,
        eventId: "plus2017|keycount|MonthlyCoupon|Get",
        eid: -1,
        fp: -1
      }
    }
  );
  return JSON.parse(text);
}

export async function getMyCoupons() {
  var text = await setting.req.get(
    "https://wq.jd.com/activeapi/queryjdcouponlistwithfinance?state=3&wxadd=1&_=1566400385806&sceneval=2&g_login_type=1&callback=queryjdcouponcb3&g_ty=ls",
    {
      headers: {
        Referer:
          "https://wqs.jd.com/my/coupon/index.shtml?ptag=7155.1.18&sceneval=2"
      }
    }
  );
  var text2 = /\(([\s\S]*)\);/.exec(text)![1];
  var {
    coupon: { useable }
  } = JSON.parse(text2);
  return useable;
}
