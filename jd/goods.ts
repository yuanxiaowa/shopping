import request = require("request-promise-native");
import { extractJsonpData } from "../utils/tools";
import { RequestAPI, RequiredUriUrl } from "request";

var req: RequestAPI<
  request.RequestPromise<any>,
  request.RequestPromiseOptions,
  RequiredUriUrl
>;
var eid = "";
var fp = "";
var cookie = "";

export function setReq(
  _req: RequestAPI<
    request.RequestPromise<any>,
    request.RequestPromiseOptions,
    RequiredUriUrl
  >,
  _cookie: string
) {
  cookie = _cookie;
  eid = getCookie("3AB9D23F7A4B3C9B");
  fp = "0a2d744505998993736ee93c5880c826";
  req = _req;
}

export async function getGoodsInfo(skuId: string) {
  var ret: string = await req.get(
    `https://item.m.jd.com/product/${skuId}.html`
  );
  return <
    {
      item: {
        skuId: string;
        skuName: string;
        venderID: number;
        category: string[];
        newColorSize: {
          [key: number]: string;
          skuId: number;
          SpecName: string;
        }[];
        saleProp: Record<number, string>;
        salePropSeq: Record<number, string[]>;
      };
      price: {
        p: number;
        op: number;
      };
      stock: {
        // 0：京东
        isJDexpress: string;
        v: number;
      };
      promov2: {
        pis: {
          pid: string;
          subextinfo: string;
        }[];
      }[];
    }
  >JSON.parse(/window\._itemInfo\s*=\s*\(([\s\S]*?})\);/.exec(ret)![1]);
}

export async function queryGoodsCoupon(data: {
  skuId: string;
  vid: number;
  cid: string;
}) {
  var text: string = await req.post(
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
  var { coupons } = extractJsonpData<{
    coupons: {
      key: string;
      roleId: number;
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
    }[];
    use_coupons: {
      id: number;
      type: number;
      quota: string;
      parValue: string;
      // 0：不展示 1：展示
      couponKind: number;
      name: string;
    }[];
  }>(text, "getCouponListCBA");
  return coupons;
}

export async function obtainGoodsCoupon(data: { roleId: number; key: string }) {
  var text: string = await req.get(
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
  return extractJsonpData<{
    batchid: string;
    code: number;
    couponid: string;
    message: string;
  }>(text, "ObtainJdShopFreeCouponCallBackA");
}

/**
 * 查询楼层优惠券
 * @param url
 * @example https://wqs.jd.com/event/promote/game11/index.shtml?cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=3f8d9f58aed14a30a581d169f573ced2
 * @example https://wqs.jd.com/event/promote/zdm18/index.shtml?cu=true&sid=b3234f60d61e8b4e3b5a8e703c321b0w&un_area=19_1601_50258_50374&_ts=1557200825024&ad_od=share&scpos=#st=6455&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=c842a3cb81d948899b818c0602bd9b8d
 */
export async function queryFloorCoupons(url: string) {
  let html: string = await req.get(url);
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
        // 0:已领 1:可领 2:已领光
        // status: string;
        begin: string;
        end: string;
      }[];
    };
  }[] = JSON.parse(text);
  let coupon_items = items.filter(({ name }) => name === "coupon");
  // 校验状态，暂时不需要
  // https://wq.jd.com/active/querybingo?callback=cb_quan_daogou06A&active=daogou06&g_tk=1461522350&g_ty=ls
  // Referer: https://wqs.jd.com/event/promote/game11/index.shtml
  let now = Date.now();
  return coupon_items.map(({ data: { list } }) =>
    list.filter(
      ({ begin, end }) =>
        now >= new Date(begin).getTime() && now < new Date(end).getTime()
    )
  );
}

export async function obtainFloorCoupon(data: { key: string; level: string }) {
  /* let g_pt_tk: any = getCookie("pt_key") || undefined;
  if (g_pt_tk) {
    g_pt_tk = time33(g_pt_tk);
  } */
  var ret: string = await req.get("https://wq.jd.com/active/active_draw", {
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
  });
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
  return ret;
}

/**
 * 查询活动主题优惠券
 * @param url
 * @example https://pro.m.jd.com/mall/active/4FziapEprFVTPwjVx19WRDMTbbbF/index.html?utm_source=pdappwakeupup_20170001&utm_user=plusmember&ad_od=share&utm_source=androidapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL
 */
export async function queryActivityCoupons(url: string) {
  let html: string = await req.get(url);
  let text = /window.dataHub\d+=(.*);/.exec(html)![1];
  let data = JSON.parse(text);
  let ret: {
    cpId: string;
    args: string;
    srv: string;
    jsonSrv: string;
    // 0:满减 2:白条
    status: string;
    // 1
    scene: string;
    beginPeriod?: string;
    endPeriod?: string;
    scope: string;
    limit: string;
  }[][] = Object.keys(data)
    .filter(key => data[key].couponList)
    .map(key => data[key].couponList);
  return ret;
}

export async function obtainActivityCoupon(data: {
  activityId: string;
  args: string;
  scene: string;
  childActivityUrl: string;
}) {
  var ret: string = await req.post(
    `https://api.m.jd.com/client.action?functionId=newBabelAwardCollection`,
    {
      form: {
        body: JSON.stringify({
          activityId: data.activityId,
          from: "H5node",
          scene: data.scene,
          args: data.args,
          platform: "3",
          orgType: "2",
          openId: "-1",
          pageClickKey: "Babel_Coupon",
          eid,
          fp,
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
          innerAnchor: ""
        }),
        client: "wh5",
        clientVersion: "1.0.0",
        sid: "",
        uuid: "15617018266251592388825",
        area: ""
      }
    }
  );
  return ret;
}

/**
 * 领取全品券
 * @param url
 * @param phone
 * @example https://h5.m.jd.com/dev/2tvoNZVsTZ9R1aF1T4fDthhd6bm1/index.html?type=out_station&id=f128d673441d4afa9fa52b2f61818591&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=d88e8a25670040f38f3d0dfc8f9542b9
 */
export async function getQuanpinCoupon(url: string, phone = "18605126843") {
  await req.get("https://api.m.jd.com/", {
    qs: {
      client: "nc",
      clientVersion: "1.0.0",
      agent:
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.90 Safari/537.36",
      lang: "zh_CN",
      networkType: "4g",
      eid,
      fp,
      functionId: "activityLongPage",
      body: JSON.stringify({
        actId: /id=(\w+)/.exec(url)![1],
        phone,
        code: "",
        country: "cn",
        platform: "3",
        pageClickKey: "-1",
        eid,
        fp,
        userArea: ""
      }),
      jsonp: "jQuery191006758729777738859_1561716359085",
      _: Date.now()
    }
  });
}

function time33(str: string) {
  for (var i = 0, len = str.length, hash = 5381; i < len; ++i) {
    hash += (hash << 5) + str.charAt(i).charCodeAt(0);
  }
  return hash & 0x7fffffff;
}
function getCookie(name: string) {
  var reg = new RegExp("(^| )" + name + "(?:=([^;]*))?(;|$)"),
    val = cookie.match(reg);
  if (!val || !val[2]) {
    return "";
  }
  var res = val[2];
  try {
    if (/(%[0-9A-F]{2}){2,}/.test(res)) {
      return decodeURIComponent(res);
    } else {
      return unescape(res);
    }
  } catch (e) {
    return unescape(res);
  }
}

export async function getCartInfo() {
  var html: string = await req.get(
    "https://p.m.jd.com/cart/cart.action?sceneval=2"
  );
  var text = /window.cartData =([\s\S]*)if \(window._MCart\) {/.exec(html)![1];
  var data: {
    traceId: string;
    areaId: string;
    cart: {
      allChecked: string;
      venderCart: {
        // 价格×100
        price: string;
        // 1: 选中 0:未选中
        checkType: string;
        popInfo: {
          vid: string;
          vname: string;
          type: string;
          fbpVender: string;
        };
        sortedItems: {
          itemId: string;
          polyType: string;
          polyItem: {
            checkType: string;
            ts: string;
            price: string;
            products: {
              checkType: string;
              mainSku: {
                id: string;
                name: string;
                maxNum: string;
              };
            }[];
          };
        }[];
      }[];
    };
  } = JSON.parse(text);
  return data;
}

export async function toggleCartChecked(
  data: {
    areaId: string;
    traceId: string;
    items: [string, string, string][];
  },
  checked = true
) {
  var qs = {
    templete: "1",
    version: "20190418",
    sceneval: "2",
    // mainSku.id,,1,mainSku.id,11,itemid,0
    commlist: data.items
      .map(
        ([sid, itemId, polyType]) =>
          `${sid},,1,${sid},${Number(polyType).toString(2)},${itemId},0`
      )
      .join("$"),
    callback: "checkCmdyCbA",
    type: "0",
    all: "0",
    reg: "1",
    traceid: data.traceId,
    locationid: data.areaId,
    t: Math.random()
  };
  console.log(qs);
  var text: string = await req.get(
    `https://wqdeal.jd.com/deal/mshopcart/${
      checked ? "checkcmdy" : "uncheckcmdy"
    }`,
    {
      qs,
      headers: {
        Referer: "https://p.m.jd.com/cart/cart.action?sceneval=2"
      }
    }
  );
  return JSON.parse(text.replace(/\w+\(([\s\S]+)\)/, "$1"));
}

export async function submitOrder() {
  var html: string = await req.get("https://p.m.jd.com/norder/order.action");
  var text = /window.dealData =([\s\S]*?)<\/script>/.exec(html)![1];
  var data: {
    token2: string;
    skulist: string;
    traceId: string;
  } = eval(`(${text})`);
  await req.post("https://wqdeal.jd.com/deal/msubmit/confirm", {
    qs: {
      paytype: "0",
      paychannel: "1",
      action: "0",
      reg: "1",
      type: "0",
      token2: data.token2,
      dpid: "",
      skulist: data.skulist,
      scan_orig: "",
      gpolicy: "",
      platprice: "0",
      ship: "2|67|663630|||||||||||0",
      pick: "",
      savepayship: "0",
      callback: "cbConfirmA",
      uuid: "",
      validatecode: "",
      valuableskus: "48579522590,1,20080,3399",
      r: "0.5329083863388784",
      sceneval: "2",
      rtk: "b69f5a15d5003d27283fd9f4f218ea34",
      traceid: data.traceId
    }
  });
}
