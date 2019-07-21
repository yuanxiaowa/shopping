import { RequestPromise } from "request-promise-native";
import request = require("request-promise-native");
import cookieManager from "../../common/cookie-manager";
import { identity } from "ramda";
import { getJsonpData } from "../../../utils/tools";

enum STATUS {
  NOT_LOGIN = "3",
  SIGNED = "2",
  NOT_SIGN = "1"
}

export function onInitJingdong() {
  setReq();
}

var req: request.RequestPromiseAPI;

export function setReq() {
  req = request.defaults({
    headers: {
      "Accept-Encoding": "br, gzip, deflate",
      Cookie: cookieManager.jingdong.get(),
      // Accept: '*/*',
      "User-Agent":
        "jdapp;iPhone;8.1.0;12.3.1;38276cc01428d153b8a9802e9787d279e0b5cc85;network/wifi;ADID/3D52573B-D546-4427-BC41-19BE6C9CE864;supportApplePay/3;hasUPPay/0;pushNoticeIsOpen/0;model/iPhone9,2;addressid/1091472708;hasOCPay/0;appBuild/166315;supportBestPay/0;pv/259.6;pap/JA2015_311210|8.1.0|IOS 12.3.1;apprpd/Home_Main;psn/38276cc01428d153b8a9802e9787d279e0b5cc85|1030;usc/pdappwakeupup_20170001;jdv/0|pdappwakeupup_20170001|t_335139774|appshare|CopyURL|1561092574799|1561092578;umd/appshare;psq/1;ucp/t_335139774;app_device/IOS;adk/;ref/JDMainPageViewController;utr/CopyURL;ads/;Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"
      // Referer: 'https://bean.m.jd.com/continuity/index',
      // 'Accept-Language': 'en-us'
    },
    gzip: true,
    jar: true,
    transform(body) {
      if (typeof body === "string") {
        if (body.startsWith("jsonp")) {
          body = body.replace(/^\w+\((.*)\);?/, "$1");
        }
        let { code, data } = JSON.parse(body);
        if (code !== "0") {
          throw body;
        }
        return data;
      }
      return body;
    }
  });
}

// ----------签到---------------

/**
 * 签到
 */
export function signIn(): RequestPromise<{
  status: STATUS;
}> {
  return req.post("https://api.m.jd.com/client.action", {
    qs: {
      functionId: "signBeanIndex"
    },
    form: {
      adid: "3D52573B-D546-4427-BC41-19BE6C9CE864",
      area: "12_988_40034_51587",
      body: JSON.stringify({
        jda: "-1",
        monitor_source: "bean_app_bean_index",
        shshshfpb: "",
        fp: "-1",
        eid: "",
        shshshfp: "-1",
        monitor_refer: "",
        userAgent: "-1",
        rnVersion: "4.0",
        shshshfpa: "-1",
        referUrl: "-1"
      }),
      build: "166315",
      client: "apple",
      clientVersion: "8.1.0",
      d_brand: "apple",
      d_model: "iPhone9,2",
      isBackground: "N",
      joycious: "277",
      lang: "zh_CN",
      networkType: "wifi",
      networklibtype: "JDNetworkBaseAF",
      openudid: "38276cc01428d153b8a9802e9787d279e0b5cc85",
      osVersion: "12.3.1",
      partner: "apple",
      scope: "01",
      screen: "1242*2208",
      sign: "6d78be68bd08ad9e6eea153ea362cbd8",
      st: "1561685238868",
      sv: "100",
      uuid: "hjudwgohxzVu96krv/T6Hg==",
      wifiBssid: "unknown"
    }
  });
}

interface SignStatusInfo {
  // 2:成功
  status: string;
  // 1
  userState: string;
  beanUserType: number;
  totalUserBean: string;
  continuousDays: string;
  pageLink: string;
  beanDetailUrl: string;
  maskSwitch: number;
  abRan: string;
  recomFlag: number;
  backTopImg: string;
  immersiveTopImg: string;
  shareInfo: {
    shareTitle: string;
    shareContent: string;
    shareIcon: string;
    shareUrl: string;
  };
  floorList: any[];
  seckillBeanFloor: {
    countDown: string;
    seckillBeanList: {
      skuId: string;
      name: string;
      imgUrl: string;
      promotionPrice: string;
      beanPayedCounts: string;
      jdPrice: string;
      realStock: number;
      linkedType: string;
      linkedUrl: string;
      needLogin: number;
    }[];
  };
  shoppBeanFloor: {
    countDown: string;
    shoppBeanList: {
      skuId: string;
      name: string;
      imgUrl: string;
      promotionPrice: string;
      refundBean: string;
      jdPrice: string;
      realStock: number;
      linkedType: string;
      linkedUrl: string;
      needLogin: number;
    }[];
  };
  plantEntry: {
    entryData: {
      entryId: string;
      iconImgUrl: string;
      actName: string;
      linkUrl: string;
      preState: string;
    };
  };
  hangingBtn: {
    btnImg: string;
    btnUrl: string;
    horizontal: number;
    upright: number;
    pageEdgeSpace: number;
    slideState: number;
    loadDelayState: number;
    delayMsec: number;
    needLogin: number;
  };
  promotionSign: {
    state: string;
    backTopImg: string;
    immersiveTopImg: string;
    receiveContent: {
      endDown: string;
      carveChance: string;
      signButText: string;
      carveBeans: string;
    };
  };
}

export function getSignStatus(): RequestPromise<SignStatusInfo> {
  return req.get(`https://api.m.jd.com/client.action`, {
    qs: {
      functionId: "findBeanIndex",
      body: JSON.stringify({
        source: "apphome",
        monitor_refer: "",
        rnVersion: "3.9",
        rnClient: "1",
        monitor_source: "bean_m_bean_index"
      }),
      appid: "ld",
      client: "apple",
      clientVersion: "8.1.0",
      networkType: "wifi",
      osVersion: "12.3.1",
      uuid: "38276cc01428d153b8a9802e9787d279e0b5cc85",
      jsonp: "jsonp_1561462819024_25606"
    }
  });
}

// ------------------转盘-------------------
export function getZhuanpanInfo(): RequestPromise<{
  lotteryCount: string;
  myAward: string;
  beanIndex: string;
  ruleLink: string;
  shareBtImage: string;
  encrytPin: string;
  shareTitle: string;
  helpState: string;
  lotteryCode: string;
  shareBtTitle: string;
  helpPeopleCount: number;
  activityState: number;
  isCanShare: boolean;
  prizeInfo: {
    prizeType: string;
    prizeId: string;
    prizeName: string;
    prizeImage: string;
    prizeNumber: string;
  }[];
  winnerList: any[];
}> {
  return req.get(`https://api.m.jd.com/client.action`, {
    qs: {
      functionId: "wheelSurfIndex",
      body: JSON.stringify({ actId: "jgpqtzjhvaoym", appSource: "jdhome" }),
      appid: "ld",
      client: "apple",
      clientVersion: "8.1.0",
      networkType: "wifi",
      osVersion: "12.3.1",
      uuid: "38276cc01428d153b8a9802e9787d279e0b5cc85",
      jsonp: "jsonp_1561549904178_23463"
    }
  });
}

export function getZhuanpan(): RequestPromise<{
  isWinner: string;
  // 剩余的抽奖次数
  chances: string;
  prizeType: string;
  prizeId: string;
  prizeName: string;
  prizeImage: string;
  tips: string;
  prizeSendNumber: string;
  toastTxt: string;
}> {
  return req.get(`https://api.m.jd.com/client.action`, {
    qs: {
      functionId: "lotteryDraw",
      body: JSON.stringify({
        actId: "jgpqtzjhvaoym",
        appSource: "jdhome",
        lotteryCode:
          "mwsevpvqu3t57je23kq7pva3wb6e2sbuc4ihzru63p5pso7sqeq5fz65ajnlm2llhiawzpccizuck"
      }),
      appid: "ld",
      client: "apple",
      clientVersion: "8.1.0",
      networkType: "wifi",
      osVersion: "12.3.1",
      uuid: "38276cc01428d153b8a9802e9787d279e0b5cc85",
      jsonp: "jsonp_1561550234465_31307"
    }
  });
}

// -------------豆子--------------
// export function getBeanInfo(): RequestPromise<{
//   timeNutrientsRes: { state: string; bottleState: string; nutrCount: string };
// }> {
//   return req.post(
//     "http://api.m.jd.com/client.action?functionId=plantBeanIndex",
//     {
//       form: {
//         adid: "3D52573B-D546-4427-BC41-19BE6C9CE864",
//         area: "12_988_40034_51587",
//         body:
//           '{"shareUuid":"","monitor_refer":"","wxHeadImgUrl":"","followType":"1","monitor_source":"plant_app_plant_index"}',
//         build: "166315",
//         client: "apple",
//         clientVersion: "8.1.0",
//         d_brand: "apple",
//         d_model: "iPhone9,2",
//         isBackground: "N",
//         joycious: "277",
//         lang: "zh_CN",
//         networkType: "wifi",
//         networklibtype: "JDNetworkBaseAF",
//         openudid: "38276cc01428d153b8a9802e9787d279e0b5cc85",
//         osVersion: "12.3.1",
//         partner: "apple",
//         scope: "01",
//         screen: "1242*2208",
//         sign: "f0f0e5e0f1e35a1facfcb9917046c23f",
//         st: "1561548694482",
//         sv: "100",
//         uuid: "hjudwgohxzVu96krv/T6Hg==",
//         wifiBssid: "unknown"
//       }
//     }
//   );
// }
// export function getBean(): RequestPromise<{
//   timeNutrientsRes: {};
// }> {
//   return req.post(
//     "http://api.m.jd.com/client.action?functionId=receiveNutrients",
//     {
//       form: {
//         adid: "3D52573B-D546-4427-BC41-19BE6C9CE864",
//         area: "12_988_40034_51587",
//         body:
//           '{"shareUuid":"","monitor_refer":"","wxHeadImgUrl":"","followType":"1","monitor_source":"plant_app_plant_index"}',
//         build: "166315",
//         client: "apple",
//         clientVersion: "8.1.0",
//         d_brand: "apple",
//         d_model: "iPhone9,2",
//         isBackground: "N",
//         joycious: "277",
//         lang: "zh_CN",
//         networkType: "wifi",
//         networklibtype: "JDNetworkBaseAF",
//         openudid: "38276cc01428d153b8a9802e9787d279e0b5cc85",
//         osVersion: "12.3.1",
//         partner: "apple",
//         scope: "01",
//         screen: "1242*2208",
//         sign: "f0f0e5e0f1e35a1facfcb9917046c23f",
//         st: "1561548694482",
//         sv: "100",
//         uuid: "hjudwgohxzVu96krv/T6Hg==",
//         wifiBssid: "unknown"
//       }
//     }
//   );
// }

/**
 * 查询商品优惠券信息
 * @param id
 */
export function queryCouponInfo(id: number) {
  return req
    .post("https://ms.jr.jd.com/gw/generic/hyqy/h5/m/queryCouponCenterDetail", {
      qs: {
        _: Date.now()
      },
      form: {
        reqData: JSON.stringify({ id, couponListType: "4" })
      }
    })
    .then(
      ({
        resultData: { couponDetailDeto }
      }: {
        resultData: {
          couponDetailDeto: {
            detailBizfit: string;
            detailButtonText: string;
            detailContent: string;
            detailInstruction: string;
            detailPlatform: string;
            // 4: 全部抢光 2: 可抢 1: 未开始
            detailStatus: "2";
            // "白条券"
            detailSubTile: string;
            // "¥2.00"
            detailTitle: string;
            // 8: 可领取 2：已领取
            detailType: string;
            detailTypeName: string;
            detailValidDesc: string;
            id: string;
            isGoldBrief: "2";
          };
        };
      }) => couponDetailDeto
    );
}

/**
 * 获取优惠券
 * @param id
 */
export function getCoupon(id: number) {
  return req
    .post(`https://ms.jr.jd.com/gw/generic/hyqy/h5/m/drawCouponCente`, {
      qs: {
        _: Date.now()
      },
      form: {
        reqData: JSON.stringify({ id, couponListType: "4" })
      }
    })
    .then(
      ({
        resultData: { drawCouponDto }
      }: {
        resultData: {
          code: "0";
          drawCouponDto: { id: string; briefStatus: "3"; percent: "93" };
        };
      }) => drawCouponDto
    );
}

/**
 * 获取店铺奖励
 */
export async function getShopJindou() {
  await req.get("https://bean.jd.com/myJingBean/list");
  var text: string = await req.post(
    "https://bean.jd.com/myJingBean/getPopSign"
  );
  console.log(text);
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

var cookie_wx =
  'versionFlag=new; __jdu=15634625843651286523454; _jrda=1; qd_uid=JY8T970W-9FQAARXIPYDDNR47EF17; qd_fs=1563462584526; shshshfpb=172ddc9da311d4fa5b34c7b3041d0488085f53564252388725b72caffe; shshshfpa=79739304-c220-db00-a4e7-92a23ae3b4f2-1563462587; mba_muid=15634625843651286523454; __jdc=122270672; areaId=12; retina=1; webp=1; sc_width=1440; wlfstk_smdl=fj0wsmnjt0lfaw6hoqfafuyqwdr6abgq; TrackID=1dkXczQ4DeEY0o4ss5gSgZFpKpqr3_qShjT9VIbhUdIc8YJziL9ljdOIy6CFsIbie3xOeMbKAV-DnSW31UE-ZVFWPxYnOFEdO-fRy6ssiP7xAckQAA4GA_rP7YbrwTvsM; pinId=o33LALMZuHAw7XCGO7xh8Q; unick=jd_%E9%80%9D%E6%B0%B4%E6%B5%81%E5%B9%B4; ceshi3.com=201; _tp=TC6EhQQH1Rx7lV8X05H6rA%3D%3D; _pst=yuanxiaowa_m; user-key=a9ed0a15-e1b9-4be9-953b-efccc0317fdf; ipLocation=%u6c5f%u82cf; __tak=3a619abdf70bbd8f829dba49d983d462cbd99884b2654b78e39ba28d53698a159b11ac87829326c40b8289d0bddbae4065fbef6ef230089efa21ba02d4a16811f0040fd3a811d72e08d88a673f2a0ef0; wxa_level=1; cn=79; ipLoc-djd=12-988-40034-51587; qd_ls=1563556740076; qd_ts=1563585952497; qd_sq=3; visitkey=23310851676889090; sk_history=45412920914%2C5587243%2C4563017%2C; wq_logid=1563640419.1660363176; __jda=122270672.15634625843651286523454.1563462584.1563640421.1563678697.22; RT="z=1&dm=jd.com&si=5wsggwhgvln&ss=jycdx7x4&sl=1&tt=1lo&ld=2dz&ul=6mj&hd=6qn"; wq_area=12_988_0%7C3; unpl=V2_ZzNtbRVSFxJ9AUAAehFZB2JTQFlKVkoTIQFEUyxJWA1nB0UPclRCFX0UR1JnGlwUZwMZX0NcQhZFCEJkexhdBWIKE1VHX3MlfQAoVDYZMgYJA18QD2dAFUUIR2R7HVsHYgQRWUtSQRJxCEVdfB1fB2IHF21yV0UlRVMTOn0QXlZvVhtfQgMUFCU4R2R6KV01LG0TEEJTRBdwD0VQchxeAmMDEVRFU0AXcAxDZHopXw%3d%3d; CCC_SE=ADC_Wbqdk6YvrfktDRevsHCGKmy1Hxzj%2bgT2dx%2fYTkDm5mOJ%2bQbDBy4%2fD4h7h5FrktoDoO1DqtyG2P066X6q0mOgZ%2bdQManHoAJHM9ybhts3fbxdWfoUxmUx0bU3ScTqIuSgoTa7DTfwtSqorGpUXj23nSxKotTlRdkAgPhmoUl0yZMl9LN8bf2lDKQArkevQJkvU654uoVqJTptYTZMIGdKyjkcFn9oGaVuyZn8v6fCO%2bR8iVCgqL3vifHVhZxDbOmL7rsyzWf1QcAMIO8FjpJ2Ch12f71UbB7Kb1jU2gFZmbDxYZHPEIl8MflKrbBfPhMwIkYOBC%2f8ryDv6GLI9usI7JNRFEfFgmB0wzCmuY45hnlVBB4Kw5At09UiLqeSmvdpOCzigQLDww7uI7dHBxiaA1YpIu0q34mdkfOKU8BDX8%2foMaudkGc1UjlWZwt3DZgdngP%2bYfHpxedNFBOTICCjwwUvxK9D7vxYVW78spU%2fBKWGClZ1B7ZuizxnC46w1jWzkS86zzBacRL2lrtCpMxD%2fA%3d%3d; PPRD_P=UUID.15634625843651286523454-LOGID.1563640102132.1428912946-CT.138631.36.4; rurl=https%3A%2F%2Fwqs.jd.com%2Fpromote%2F201801%2Fbean%2Findex.html%3Fcu%3Dtrue%26utm_source%3Dkong%26utm_medium%3Djingfen%26utm_campaign%3Dt_1001480949_%26utm_term%3D81f9c3eea11f43f0823965906318dd3a; lsid=iya1oscniy0n15keouw430ry1dj5nks6; __jdb=122270672.4.15634625843651286523454|22.1563678697; mba_sid=15636786975455272128965176703.3; __jd_ref_cls=MLoginRegister_QQLogin; TrackerID=E_cTaX-rGApz9O6D5STcQwn-SAt7nbAN69-aATZceI36wJ_e1FHA-vK7rsUxhAfC3koCUx9CQxES_Cta525KWcZ0RwBOxQmpGRKwl-naCFCkUDzE-5wNTgG1uML-dk7Q; pt_key=AAJdM94zADAHvLzBZXsYf8evksYM9obOADbxjxMXnoEOOSH_AgVrpTjnllg5WUoPvmwA4r4XWjc; pt_pin=yuanxiaowa_m; pt_token=26bx3n84; pwdt_id=yuanxiaowa_m; buy_uin=15475729444; jdpin=yuanxiaowa_m; pin=yuanxiaowa_m; wq_skey=zm8A404FA5983623B60E018A8B977463E028544BAE3380979CB939F97FC688BDC700FD7F96804E16AF175BB00C79EF403EBF541BD588AEE6CCC1A473A657ACF0EC7ABBA749EF0D98AA3F3ACD180082EB9F; wq_uin=15475729444; 3AB9D23F7A4B3C9B=TNNEVY6UM2645G3OEU4WPA5OIB7A4MZSUPXMQVREJQ2P5IZKD5RUIEF7AXO6RA5W5SMDN3LPMAPSKAOKQWLD4ADVGU; __wga=1563680308505.1563679789858.1563638208914.1563465868622.17.6; __jdv=122270672%7Ckong%7Ct_1001480949_%7Cjingfen%7C81f9c3eea11f43f0823965906318dd3a%7C1563680308510; promotejs=e390c4f1e4032c192f3ae91a00010154aSd412kSd; shshshfp=eb696a668ccae6f3bc87963052c8ab0f; shshshsID=92c88bd05a8d267e2f84fe1929a5ed60_21_1563680309056; cid=3; wqmnx1=MDEyNjM4MnRzL2g9MTh6MHR0TzFwdCAgY28uMi8yWW5CMVVGIUg%3D';
async function requestWx(url: string, qs?: any) {
  var text: string = await request.get(url, {
    qs,
    headers: {
      cookie: cookie_wx,
      "user-agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 QQ/8.0.8.458 V1_IPH_SQ_8.0.8_1_APP_A Pixel/1080 Core/WKWebView Device/Apple(iPhone 7Plus) NetType/WIFI QBWebViewType/1 WKType/1",
      Referer:
        "https://wqs.jd.com/promote/201801/bean/index.html?cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_1001480949_&utm_term=81f9c3eea11f43f0823965906318dd3a"
    },
    transform: identity
  });
  var res = getJsonpData(text);
  if ("iRet" in res) {
    if (res.iRet !== "0") {
      throw new Error(res.errMsg);
    }
  } else {
    if (res.ret !== 0) {
      throw new Error(res.msg);
    }
  }
  return res;
}

export async function checkWxLogin() {
  try {
    await requestWx(
      `https://wq.jd.com/mlogin/wxv3/LoginCheckJsonp?callback=validateLoginCallbackA&_t=${Math.random()}`
    );
    return true;
  } catch (e) {
    return false;
  }
}

export async function getWxSign() {
  var { status } = await requestWx(
    "https://wq.jd.com/activep3/singjd/SignQuery",
    {
      active: "",
      sId: "",
      _: Date.now(),
      g_login_type: "0",
      callback: "SignQuery",
      g_tk: "802406820",
      g_ty: "ls"
    }
  );
  return status === 0;
}

export async function getWxJindou() {
  return requestWx("https://wq.jd.com/activep3/singjd/DrawQuery", {
    sactive: "",
    sId: "",
    _: Date.now(),
    g_login_type: "0",
    callback: "DrawQuery",
    g_tk: "802406820",
    g_ty: "ls"
  });
}

export async function getWxCoupons() {
  var data = await requestWx(
    "https://wq.jd.com/activepersistent/component/querybeanexchangecoupon",
    {
      keys: "JBE_ew7yz4c,JBE_evk0z5y,JBE_evkrz1g,JBE_zew7y44,JBE_ezw7pmp",
      _: Date.now(),
      g_login_type: "0",
      callback: "jsonpCBKE",
      g_tk: "802406820",
      g_ty: "ls"
    }
  );
  console.log(data);
}

// var ins = new JinDong();
// 1694276
// getGoodsInfo(3857389).then(console.log);
// queryGoodsCoupon(3857389).then(console.log);
// ins.resolveUrl("https://u.jd.com/cvPKW6").then(console.log);

// 领优惠券
// get https://coupon.m.jd.com/coupons/show.action?key=aec58667c0c14d7bae2422b73b83ef0f&roleId=20889698
// click .btn
// xhr: get https://s.m.jd.com/activemcenter/mfreecoupon/getcoupon?key=aec58667c0c14d7bae2422b73b83ef0f&roleId=20889698&to=&verifycode=&verifysession=&_=1561266410625&sceneval=2&g_login_type=1&callback=jsonpCBKA&g_ty=ls
