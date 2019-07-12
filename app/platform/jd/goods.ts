import request = require("request-promise-native");
import { delayRun, getJsonpData } from "../../../utils/tools";
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
  var { coupons } = getJsonpData<{
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
  }>(text);
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

export async function getCartList() {
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

  var ret = await req.post("https://wqdeal.jd.com/deal/msubmit/confirm", {
    qs,
    headers: {
      Referer: "https://p.m.jd.com/norder/order.action"
    }
  });
}

export async function getShopJindou() {
  await req.get("https://bean.jd.com/myJingBean/list");
  var text: string = await req.post(
    "https://bean.jd.com/myJingBean/getPopSign"
  );
  var { data } = JSON.parse(text);
  data.forEach(
    async ({ shopUrl, signed }: { shopUrl: string; signed: boolean }) => {
      if (!signed) {
        let id: string;
        if (/mall\.jd\.com\/index-(\w+)/.test(shopUrl)) {
          id = RegExp.$1;
        } else {
          let html: string = await req.get(shopUrl);
          id = /var shopId = "(\d+)"/.exec(html)![1];
        }
        await req.get(`https://mall.jd.com/shopSign-${id}.html`);
      }
    }
  );
}

export function getUuid() {
  return getCookie("mba_muid");
}

export async function getVideoHongbao() {
  console.log("检查视频红包活动");
  var uuid = getUuid();
  var config_text = await req.get(
    "https://storage.360buyimg.com/babel/00395792/873571/production/dev/config.js",
    {
      qs: {
        t: Date.now()
      }
    }
  );
  var {
    custom: { answerTime, adIds },
    activityId,
    activityIdKey,
    pageId
  } = eval(
    `(${
      /\{[\s\S]*\}/.exec(config_text.replace("window.location.href", "1"))![0]
    })`
  );
  let now = new Date();
  let h: any = now.getHours();
  if (h < answerTime[0]) {
    if (h < 10) {
      h = "0" + h;
    }
    await delayRun(`${h}:00:20`);
  } else if (h > answerTime[1]) {
    return;
  }
  // 获取视频信息
  var text: string = await req.get("https://api.m.jd.com/client.action", {
    qs: {
      functionId: "getBabelAdvertInfo",
      body: JSON.stringify({
        ids: [
          adIds.video,
          adIds.shopId,
          adIds.question,
          adIds.actid,
          adIds.other
        ].join(",")
      }),
      uuid,
      clientVersion: "1.0.0",
      client: "wh5",
      callback: "jsonp0"
    }
  });
  // jsonp2({"currentTimeVal":1562548286595,"currentTimeStr":"2019-07-08 09:11:26","returnMsg":"success","code":"0","subCode":"0","biTestId":"1","advertInfos":[{"groupName":"H5标题","deliveryId":"","stageName":"708蒙牛","groupId":"03303157","deliveryType":"1","list":[{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":{},"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"蒙牛纯甄发红包啦","copy2":"","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","tab3Flag":"0"},"pictureUrl":"","link":"","progId":"","materialId":"4301201749","advertId":"4301201749","biClk":"2","appointed":false,"mcInfo":"03303157-09477169-4301201749-N#0--99--0--#1-0-#1-#","name":"1","linkType":"99","comment":[],"advertModuleId":"advert_4301201749","beginTime":"2019-06-21 00:00:00","endTime":"2019-06-22 00:00:00","desc":""}],"stageId":"09477169"},{"groupName":"游戏规则","deliveryId":"","stageName":"","groupId":"03303159","deliveryType":"1","list":[{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":{},"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"看视频赢红包攻略： 1.用户观看视频，根据视频内容答题。答题正确可获得相应红包奖励，红包将自动发放至账户；<br/> 2.答题错误需根据页面引导，在弹窗中完成相应小任务，获得再次答题机会；<br/> 3.参与活动所获得红包需在红包有效期内使用，红包过期时间等信息可在“我的->钱包->红包”查看。<br/> 4.红包每日数量有限，按参与顺序先到先得；<br/> 5.6月26日起每日答题时间恢复为9点开始；<br/>","copy2":"红包规则：1.红包可在京东主站、手机京东v7.2.0及以上版本、M版京东、微信京东购物、手机QQ京东购物等渠道使用。<br/>  2.红包无使用门槛，可与其它资产叠加使用，在提交订单时抵减商品金额（不抵减运费）。<br/> 3.未使用完红包在有效期内可累积至下次使用，若超出有效期，则无法继续使用。   <br/> 4.使用红包的订单，若订单未拆分，则订单取消后，返还相应红包；若订单被拆分，则取消全部子订单后，返还相应红包；若只取消部分子订单，红包不予返还。 使用红包的订单，若发生售后退货，则红包不予返还。具体使用规则遵守红包使用的相关规则，可在京东首页>帮助中心中查阅。<br/> 5.红包发放可能存在一定延迟，请耐心等待。若24小时后仍未到账，请联系客服<br/>","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","tab3Flag":"0"},"pictureUrl":"","link":"","progId":"","materialId":"0301102452","advertId":"0301102452","biClk":"2","appointed":false,"mcInfo":"03303159-08618316-0301102452-N#0--99--0--#1-0-#1-#","name":"111","linkType":"99","comment":[],"advertModuleId":"advert_0301102452","beginTime":"2019-04-26 16:53:43","endTime":"2019-04-27 00:00:00","desc":""}],"stageId":"08618316"},{"groupName":"优惠券","deliveryId":"","stageName":"708蒙牛","groupId":"03303417","deliveryType":"204","list":[{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":[],"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"","copy2":"","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","inputType":"2","cl":[{"cn1":"食品饮料","c1":"1320"}],"disCount":"10.0","quota":"99.0","limitStr":"仅可购买蒙牛品牌部分商品","beginTime":"2019-07-09 00:00:00","endTime":"2019-07-09 23:59:59","couponValid":0,"couponInfo":"","couponNewName":"","soldOut":0,"couponStyle":0,"couponType":1,"totalInventory":"","jumpLink":"","beanJumpUrl":"","beanAmount":"","couponActLink":"","useCpnType":"0","useCpnLink":"","identity":"","pcLink":"","mLink":"","jdShareValue":"","createTime":"2019-07-03 16:58:52","couponKind":"1","venderId":"0","batchId":"236860374","userLabel":"0","addDays":0,"shopId":0,"limitPlatform":null,"discountDesc":"","key":"ceb16acf7040496494c6e0272e2724ef","roleId":"21205692","limitOrganization":"[1]","couponKey":"FP_ewqu4zf","userClass":10000,"overLap":"1","overLapDesc":"[]","platformType":0,"hourCoupon":"1","couponTitle":"7.9纯甄大牌秒杀日新客专享99-10","yn":1,"expireType":5,"couponMsg":"success","configStatus":6,"cpnResultCode":200,"cpnResultMsg":"查询活动成功"},"pictureUrl":"//m.360buyimg.com/babel/jfs/t1/61585/25/3795/21107/5d20874aE1e6d4bc4/290858587073461c.png","link":"21205692","progId":"","materialId":"2201187315","advertId":"2201187315","biClk":"1#fc4b7294197d5ef4d20bf91e5333d1320872c96d-104-619139#14378395","appointed":false,"mcInfo":"03303417-09477331-2201187315-N#0-6-98--70--#1-0-#204-14378395#","name":"","linkType":"98","comment":[],"advertModuleId":"advert_2201187315","beginTime":"2019-06-22 00:00:00","endTime":"2019-06-22 00:00:00","desc":""},{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":[],"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"","copy2":"","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","inputType":"2","cl":[{"cn1":"食品饮料","c1":"1320"}],"disCount":"20.0","quota":"199.0","limitStr":"仅可购买蒙牛品牌部分商品","beginTime":"2019-07-09 00:00:00","endTime":"2019-07-09 23:59:59","couponValid":0,"couponInfo":"","couponNewName":"","soldOut":0,"couponStyle":0,"couponType":1,"totalInventory":"","jumpLink":"","beanJumpUrl":"","beanAmount":"","couponActLink":"","useCpnType":"0","useCpnLink":"","identity":"","pcLink":"","mLink":"","jdShareValue":"","createTime":"2019-07-03 17:03:31","couponKind":"1","venderId":"0","batchId":"236872482","userLabel":"0","addDays":0,"shopId":0,"limitPlatform":null,"discountDesc":"","key":"7e2ca1cb989c492d8e8996b69a335b21","roleId":"21205894","limitOrganization":"[1]","couponKey":"FP_ezwqm0d","userClass":10000,"overLap":"1","overLapDesc":"[]","platformType":0,"hourCoupon":"1","couponTitle":"7.9纯甄大牌秒杀日199-20","yn":1,"expireType":5,"couponMsg":"优惠券无效，不在有效期范围内","configStatus":6,"cpnResultCode":200,"cpnResultMsg":"查询活动成功"},"pictureUrl":"//m.360buyimg.com/babel/jfs/t1/69104/31/3838/19767/5d208777E54b33e0a/7c037c1692520773.png","link":"21205894","progId":"","materialId":"2201187316","advertId":"2201187316","biClk":"1#fc4b7294197d5ef4d20bf91e5333d1320872c96d-104-619139#14378395","appointed":false,"mcInfo":"03303417-09477331-2201187316-N#0-6-98--70--#1-0-#204-14378395#","name":"","linkType":"98","comment":[],"advertModuleId":"advert_2201187316","beginTime":"2019-06-22 00:00:00","endTime":"2019-06-22 00:00:00","desc":""}],"stageId":"09477331"},{"groupName":"banner","deliveryId":"","stageName":"708蒙牛","groupId":"03303171","deliveryType":"1","list":[{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":{},"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"https://pro.m.jd.com/mall/active/293w63AzYhueNpFMKqKDrV1pZKPE/index.html","copy2":"","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","tab3Flag":"0"},"pictureUrl":"//m.360buyimg.com/babel/jfs/t1/41231/20/8487/103193/5d20848eE6ca7940e/d058550cb10c50a5.jpg!q70.jpg","link":"","progId":"","materialId":"0701210193","advertId":"0701210193","biClk":"2","appointed":false,"mcInfo":"03303171-09477309-0701210193-N#0--99--0--#1-0-#1-#","name":"1","linkType":"99","comment":[],"advertModuleId":"advert_0701210193","beginTime":"2019-06-21 00:00:00","endTime":"2019-06-22 00:00:00","desc":""}],"stageId":"09477309"},{"groupName":"预告","deliveryId":"","stageName":"528京东空调","groupId":"03303189","deliveryType":"1","list":[{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":{},"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"","copy2":"","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","tab3Flag":"0"},"pictureUrl":"//m.360buyimg.com/babel/jfs/t11014/106/2972232484/60748/4c88098c/5cde7e5fN142378ac.jpg!q70.jpg","link":"","progId":"","materialId":"8001111196","advertId":"8001111196","biClk":"2","appointed":false,"mcInfo":"03303189-08737069-8001111196-N#0--99--0--#1-0-#1-#","name":"111","linkType":"99","comment":[],"advertModuleId":"advert_8001111196","beginTime":"2019-04-26 16:59:05","endTime":"2019-04-27 00:00:00","desc":""}],"stageId":"08737069"},{"groupName":"头图","deliveryId":"","stageName":"708蒙牛","groupId":"03381049","deliveryType":"1","list":[{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":{},"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"","copy2":"","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","tab3Flag":"0"},"pictureUrl":"//m.360buyimg.com/babel/jfs/t1/71170/20/3869/135230/5d20b01cE869eacb5/81c0f72104525e3c.png","link":"","progId":"","materialId":"8001203159","advertId":"8001203159","biClk":"2","appointed":false,"mcInfo":"03381049-09477315-8001203159-N#0--99--0--#1-0-#1-#","name":"1","linkType":"99","comment":[],"advertModuleId":"advert_8001203159","beginTime":"2019-06-21 00:00:00","endTime":"2019-06-22 00:00:00","desc":""}],"stageId":"09477315"}],"biDisplayTmpr":"1#fc4b7294197d5ef4d20bf91e5333d1320872c96d-104-619139-204"})
  var { advertInfos } = JSON.parse(/\((.*)\)/.exec(text)![1]);
  let shopId = advertInfos.find((item: any) => item.groupId === "03303162")
    .list[0].extension.copy1;
  let state_text = await req.get("https://api.m.jd.com/client.action", {
    qs: {
      appid: "answer_20190513",
      t: Date.now(),
      functionId: "answerInfo",
      body: JSON.stringify({
        activityId,
        pageId,
        reqSrc: "mainActivity",
        platform: "APP/m",
        shopId
      }),
      client: "wh5",
      clientVersion: "1.0.0",
      uuid
    }
  });
  let {
    data: { answerStatusCode, hbStockPercent, userVo }
  } = JSON.parse(state_text);
  if (answerStatusCode === 3) {
    console.log("看视频赢红包活动，已获得", userVo.hbAmount);
    return;
  }
  if (hbStockPercent === 1) {
    console.log("视频红包已发放完");
    return;
  }
  // {"data":{"answerStatusCode":0,"answerUserNum":40276,"currentTime":1562548286331,"hbStockPercent":0.82,"playTime":20,"shopLogoUrl":"","shopName":"","userVo":{"additionalCount":0,"answerCount":0,"answerResult":0,"answerSelect":"","hbAmount":0}},"code":"0"}
  // {"data":{"answerStatusCode":3,"answerUserNum":41704,"currentTime":1562548313562,"hbStockPercent":0.81,"playTime":20,"shopLogoUrl":"","shopName":"","userVo":{"additionalCount":0,"answerCount":1,"answerResult":1,"answerSelect":"丹麦进口菌种","hbAmount":0.5}},"code":"0"}
  let answer = advertInfos.find(
    (item: any) =>
      item.groupId === "03303165" || item.groupName === "题目/选项/答案"
  );
  let res = await req.get("https://api.m.jd.com/client.action", {
    qs: {
      appid: "answer_20190513",
      t: now.getTime(),
      functionId: "answerSendHb",
      body: JSON.stringify({
        activityId,
        pageId,
        reqSrc: "mainActivity",
        platform: "APP/m",
        answer: 1,
        select: answer.list[0].desc
      }),
      client: "wh5",
      clientVersion: "1.0.0",
      uuid
    }
  });
  console.log(res);

  // {"data":{"currentTime":1562548312483,"awardType":["1"],"couponList":null,"discount":0.50},"code":"0"}
}
