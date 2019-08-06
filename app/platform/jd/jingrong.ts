import request = require("request-promise-native");
import * as R from "ramda";
import { getJsonpData } from "../../../utils/tools";
import cookieManager from "../../common/cookie-manager";

var req: request.RequestPromiseAPI;

export function onInitJingrong() {
  setReq();
}

export function setReq() {
  req = request.defaults({
    jar: true,
    headers: {
      "Accept-Encoding": "br, gzip, deflate",
      cookie: cookieManager.jinrong.get(),
      // Accept: '*/*',
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/application=JDJR-App&deviceId=7B4C588C-8371-4F85-B91D-F015D8C88E90&clientType=ios&iosType=iphone&clientVersion=5.2.32&HiClVersion=5.2.32&isUpdate=0&osVersion=12.3.1&osName=iOS&platform=iPhone 7 Plus (A1661/A1785/A1786)&screen=736*414&src=App Store&ip=2408:84ec:a012:4fe0:8e8:d4c0:79ca:649e&mac=02:00:00:00:00:00&netWork=1&netWorkType=1&stockSDK=stocksdk-iphone_3.0.0&sPoint=MTAwMDUjSlJMaWZlQ2hhbm5lbFZpZXdDb250cm9sbGVyI3RhbmNodWFuZzQwMDFfSlJMaWZlQ2hhbm5lbFZpZXdDb250cm9sbGVyKihudWxsKSrkvJfnrbnmibbotKvlpKfotZst5YWo6YeP&jdPay=(*#@jdPaySDK*#@jdPayChannel=jdfinance&jdPayChannelVersion=5.2.32&jdPaySdkVersion=2.23.3.0&jdPayClientName=iOS*#@jdPaySDK*#@)"
      // Referer: 'https://m.jr.jd.com/btyingxiao/advertMoney/html/collar.html?iframeSrc=https%3A%2F%2Fccc-x.jd.com%2Fdsp%2Fnc%3Fext%3DaHR0cDovL3JlLm0uamQuY29tL2xpc3QvaXRlbS85NzU2LTMyODU5MTQ0NTEzLmh0bWw_cmVfZGNwPTQ0Z2Ntd3hGVm9rdWhQMFBDc1dBQ0VLZUFiVGFXYTNpanhYNnM0RW1USlY1RjJjWC1mMjNiMkJSMjduT1FWYWkyUlg5NDJvSWRKM0hYZ0pBaFFWYXBscklCQ0c3V29oQkgxamJFd3B4YXM4dCZ3aXRoX2twbD0w%26log%3DyJLB6LIpm9Fe_DYp8oLfiVanGvdXr1CfkU5Ikyj0aKL6d73M6kDEcVTFe4WOBnwC7dPK6vT9y2r_QQGNybqxVFg_8uIauPBm2Z5XRUyLXOdaNrwv6wIKAchuLsy9HRNOmJNs2Oo7Jm0hiq-Pb99EcHX60vNjPyLK9FPZ3e1qXLLlPI71wTijyrYDdVlHcg6lBX7gJ1iZXsY5NN2LDF4c2tXuCazR3sGiChZNxeUTJ6SD2DWc7_uic19ZqHK-gwNL6FesLoTdiX2b0-OBz_F_FAG9c0U3zojLJtlgG_GOwzr6boMfas-od2IcuvG4p9EXzcX5XbgGX5dYtMZcijsNhYG4GOHeRVAzOhgHF-1v9E5NU0RVHDTPueTTkE0HjagEwnGtpxz-2ojaowC6NgKzLbRus02yanoIbKhk3hXtlNCk9MDirVWKwJ_wSaABvsQ-P09G-tr6u8o_N6lEKsI8Kg%26v%3D404%26with_kpl%3D0&adId=764868357&bussource=',
      // 'Accept-Language': 'en-us'
    },
    json: true,
    gzip: true,
    transform(text: string) {
      var data: any;
      if (/^\w/.test(text)) {
        data = getJsonpData(text);
      } else {
        data = JSON.parse(text);
      }
      var { resultCode, resultMsg, resultData } = data;
      if (resultCode !== 0) {
        throw new Error(resultMsg);
      }
      if (resultData && resultData.code === "500") {
        throw new Error(resultData.msg);
      }
      return resultData;
    }
  });
}

async function requestData<T>(
  url: string,
  data: any,
  inner = false
): Promise<T> {
  var res = await req.post(url, {
    qs: {
      _: Date.now()
    },
    form: {
      reqData: JSON.stringify(data)
    },
    headers: {
      Referer: "https://m.jr.jd.com/"
    }
  });
  if (inner) {
    if (!["0000", "200"].includes(res.code)) {
      console.error(res);
      throw new Error(res.msg);
    }
    return res.data;
  }
  return res;
}

/**
 * 查询汇总信息
 */
export function querySignBusiness() {
  interface T {
    resBusiData: {
      prizesNumber: number;
      // 除第一项以外都有用
      prizes: {
        configId: string;
        isPrizes: string;
        value: string;
      }[];
    };
    // 0：操作成功
    resBusiCode: number;
    resBusiMsg: string;
  }
  return requestData<T>(
    "https://ms.jr.jd.com/gw/generic/hy/h5/m/querySignBusinessH5",
    {
      channelSource: "JRAPP"
    }
  );
}

/**
 * 获取签到信息
 */
export function getSignInfo() {
  interface T {
    // 0:操作成功
    resBusiCode: number;
    resBusiData: {
      currentTime: number;
      // 是否已签到
      isFlag: boolean;
      rewardTotal: string;
      historyList: string[];
      // 连签次数
      signContinuity: string;
      // 总签到次数
      signCount: string;
      // 3：钢镚
      rewardType: number;
      accountBalance: string;
    };
    resBusiMsg: string;
  }
  return requestData<T>(
    "https://ms.jr.jd.com/gw/generic/hy/h5/m/querySignHistory",
    { channelSource: "JRAPP" }
  );
}

/**
 * 签到
 */
export function signIn() {
  interface T {
    // 0: 操作成功 15：已经领取过
    resBusiCode: number;
    resBusiMsg: string;
    resBusiData?: {
      totalNumber: number;
      // 连签天数
      continuityDays: string;
      rewardType: number;
      isContinuity: boolean;
      // 钢镚余额
      accountBalance: string;
      continuityAmount: number;
      thisAmount: number;
      isSuccess: boolean;
      isDouble: boolean;
    };
  }
  return requestData<T>(`https://ms.jr.jd.com/gw/generic/hy/h5/m/signIn`, {
    channelSource: "JRAPP"
  });
}

/**
 * 点击商品领取金豆
 */
export function getGoodsJindou() {
  interface T {
    msg: string;
    // 176696
    actKey: string;
    // 0000:成功 2000:今天的京豆已经发完
    code: string;
    // 1
    issuccess: string;
    data: {
      // 获取的金豆数量
      volumn: string;
      // 总共获得的金豆数量
      gbAmount: string;
    };
    canGetGb: boolean;
  }
  return requestData<T>("https://ms.jr.jd.com/gw/generic/jrm/h5/m/sendAdGb", {
    clientType: "ios",
    actKey: "176696",
    userDeviceInfo: { adId: 764868357 + ((Math.random() * 1000) >> 0) },
    deviceInfoParam: {
      macAddress: "02:00:00:00:00:00",
      channelInfo: "appstore",
      IPAddress1: "2408:84ec:a012:4fe0:8e8:d4c0:79ca:649e",
      OpenUDID: "9d6039ba9a88469d7733658d45e3dae4df03af46",
      clientVersion: "5.2.32",
      terminalType: "02",
      osVersion: "12.3.1",
      appId: "com.jd.jinrong",
      deviceType: "iPhone9,2",
      networkType: "WIFI",
      startNo: 100,
      UUID: "",
      IPAddress: "",
      deviceId: "7B4C588C-8371-4F85-B91D-F015D8C88E90",
      IDFA: "3D52573B-D546-4427-BC41-19BE6C9CE864",
      resolution: "1242*2208",
      osPlatform: "iOS"
    },
    bussource: ""
  });
}

export function getSignJRInfo() {
  interface T {
    // 是否已经获得
    isGet: boolean;
    isSignInJr: boolean;
    isSignInJd: boolean;
    // 200:响应成功
    resultCode: number;
    isNewUser: {
      resultCode: number;
      amount: number;
      // no
      isNewUser: string;
      resultMsg: string;
    };
    resultMsg: string;
    longDaySign: boolean;
  }
  return requestData<T>("https://ms.jr.jd.com/gw/generic/jrm/h5/m/signInit", {
    source: "JR"
  });
}

/**
 * 领取双签奖励
 */
export function getSignAwardJR() {
  interface T {
    // 200
    resultCode: number;
    // 响应成功
    resultMsg: string;
    // 0
    status: number;
    awardList: {
      count: number;
      name: string;
      // 1：京豆
      type: number;
    }[];
  }
  return requestData<T>(
    `https://ms.jr.jd.com/gw/generic/jrm/h5/m/getSignAwardJR`,
    {
      riskDeviceParam: JSON.stringify({
        deviceType: "iPhone+7+Plus+(A1661/A1785/A1786)",
        traceIp: "",
        macAddress: "02:00:00:00:00:00",
        imei: "7B4C588C-8371-4F85-B91D-F015D8C88E90",
        os: "iOS",
        osVersion: "12.3.1",
        fp: "919ea8df8ed0351b1f931857fa9000cd",
        ip: "172.16.90.74",
        eid:
          "ZXHJWSWBJENX73DQAH7BW3RFGBNXZFMPJG6FFUDG3F26WRTNTZLAEVZEAERLMWPHRZGFKKG5YCL5XRQYJ7WB6F3NKE",
        appId: "com.jd.jinrong",
        openUUID: "9d6039ba9a88469d7733658d45e3dae4df03af46",
        uuid: "",
        clientVersion: "5.2.32",
        resolution: "736*414",
        channelInfo: "appstore",
        networkType: "WIFI",
        startNo: 105,
        openid: "",
        token: "",
        sid: "",
        terminalType: "02",
        longtitude: "",
        latitude: "",
        securityData: "",
        jscContent: "",
        fnHttpHead: "",
        receiveRequestTime: "",
        port: "",
        appType: 1,
        optType: "",
        idfv: "",
        wifiSSID: "",
        wifiMacAddress: "",
        cellIpAddress: "",
        wifiIpAddress: "",
        sdkToken: ""
      })
    }
  );
}

// ----------------金果----------------

interface TreeInfo {
  // 升级需要
  upgradeDemand: number;
  treeName: string;
  progressLeft: string;
  // 等级
  level: number;
  fruit: number;
  fruitHarvest: number;
  // 树上的果实
  fruitOnTree: number;
  // 工人数量
  workerSum: number;
  // 容量
  capacity: number;
}

/**
 * 获取金果详情
 */
export function getJinguoInfo() {
  interface T {
    // 昵称
    nick: string;
    treeInfo: TreeInfo & {
      coin: number;
    };
    sharePin: string;
    workerList: any[];
    avatar: string;
    firstLogin: boolean;
  }
  return requestData<T>(
    `https://ms.jr.jd.com/gw/generic/uc/h5/m/login`,
    {
      shareType: 1,
      source: 2,
      riskDeviceParam: JSON.stringify({
        deviceType: "iPhone+7+Plus+(A1661/A1785/A1786)",
        traceIp: "",
        macAddress: "02:00:00:00:00:00",
        imei: "7B4C588C-8371-4F85-B91D-F015D8C88E90",
        os: "iOS",
        osVersion: "12.3.1",
        fp: "9d13e4394c1ec6f2c3456e5c5de3dc76",
        ip: "2408:84ec:a012:4fe0:8e8:d4c0:79ca:649e",
        eid:
          "ZXHJWSWBJENX73DQAH7BW3RFGBNXZFMPJG6FFUDG3F26WRTNTZLAEVZEAERLMWPHRZGFKKG5YCL5XRQYJ7WB6F3NKE",
        appId: "com.jd.jinrong",
        openUUID: "9d6039ba9a88469d7733658d45e3dae4df03af46",
        uuid: "",
        clientVersion: "5.2.32",
        resolution: "736*414",
        channelInfo: "appstore",
        networkType: "WIFI",
        startNo: 100,
        openid: "",
        token: "",
        sid: "",
        terminalType: "02",
        longtitude: "",
        latitude: "",
        securityData: "",
        jscContent: "",
        fnHttpHead: "",
        receiveRequestTime: "",
        port: "",
        appType: 1,
        optType: "",
        idfv: "",
        wifiSSID: "",
        wifiMacAddress: "",
        cellIpAddress: "",
        wifiIpAddress: "",
        sdkToken: ""
      })
    },
    true
  );
}

/**
 * 收获金果
 */
export function harvestJinguo() {
  interface T {
    upgrade: boolean;
    treeInfo: TreeInfo;
  }
  return requestData<T>(
    `https://ms.jr.jd.com/gw/generic/uc/h5/m/harvest`,
    { source: 2, sharePin: null },
    true
  );
}

/**
 * 金果签到
 * @param workType
 * @param opType 1:执行前置操作 2:领取奖励
 */
export function signJinguo(workType: number, opType: number) {
  return () => {
    interface T {
      opMsg: string;
      // 0：成功 1：失败
      opResult: number;
      // 获得金果数量
      prizeAmount: number;
    }
    return requestData<T>(
      `https://ms.jr.jd.com/gw/generic/uc/h5/m/doWork`,
      { source: 2, workType, opType },
      true
    );
  };
}

export function getJinguoDayWork() {
  type T = {
    // 奖励数量
    prizeAmount: number;
    prizeType: number;
    workContent: string;
    workName: string;
    // -1:不可操作 0:可操作 1:可领取 2:已完成
    workStatus: -1 | 0 | 1 | 2;
    workType: number;
  }[];
  return requestData<T>(
    `https://ms.jr.jd.com/gw/generic/uc/h5/m/dayWork`,
    { source: 2 },
    true
  );
}

async function requestJsonp<T>(url: string, qs: any, form?: any) {
  var data = await req.post(url, {
    qs: Object.assign({ _: Date.now(), callback: "cb" }, qs),
    transform: R.identity,
    form
  });
  if (Array.isArray(data)) {
    return <T>data[0];
  }
  return <T>data;
}

// ----------------翻牌----------------

interface FanpaiRes<T> {
  // 1: 成功
  code: number;
  msg: string;
  data: {
    // 0:成功 2：未登录
    result: number;
  } & T;
  errcode: number;
  flushTime: any;
  success: boolean;
  systime: number;
  trade: boolean;
  usIsTrade: boolean;
}

export async function getFanpaiInfo() {
  return requestJsonp<
    FanpaiRes<{
      // 是否允许翻牌 0:不允许
      isAllowSignin: number;
      // 今天拥有翻牌次数
      todayCount: number;
      // 总翻牌次数
      totalCount: number;
      rewardList: {
        // 1:代表当前为翻的牌
        checked: number;
        // 1:金豆 2:钢镚 3:小金库还信用卡券
        type: number;
        rewardContent: any;
        // 金豆数
        jingdou: number;
      }[];
    }>
  >("https://gpm.jd.com/signin_new/home", {
    sid: "47a4f6f4335b498f4a462e2d5e5d9f8w",
    uaType: "2"
  });
}

export async function fanpai() {
  return requestJsonp<FanpaiRes<{}>>("https://gpm.jd.com/signin_new/choice", {
    sid: "47a4f6f4335b498f4a462e2d5e5d9f8w",
    uaType: "2",
    position: "1"
  });
}

// --------------------免费领金豆-----------

interface WelfareRes<T> {
  // true
  status: boolean;
  // 00000:成功 70104:单日该唯一标识已达到最大领奖次数 70105:单用户单任务领取频繁
  code: string;
  msg: string;
  data: T;
}

async function requestWelfare<T>(url: string, qs: any, form?: any) {
  var { data, code, msg } = await requestJsonp<WelfareRes<T>>(url, qs, form);
  if (code === "00000") {
    return data;
  }
  throw new Error(msg);
}

export async function getWelfareList() {
  interface T {
    welActList: {
      // 1 2 3 14
      id: number;
      // 2:浏览文章 6:评论 5:分享 7:看活动
      actType: number;
      actName: string;
      alreadyRewardAmountDay: number;
      // 已领取的次数
      alreadyRewardTimesDay: number;
      bizLine: number;
      noTimesDay: boolean;
      rewardAmount: number;
      rewardExtTimesLimit: number;
      rewardRule: string;
      // 显示的文本
      rewardRuleShow: string;
      // 每天能领取的次数
      rewardTimesDayLimit: number;
      // 4
      rewardType: number;
    }[];
  }
  return requestWelfare<T>(
    `https://v-z.jd.com/welfare/act/getActList.action`,
    { bizLine: 2, rewardType: 4 },
    {
      callback: "$"
    }
  ).then(({ welActList }) => welActList);
}

export function doWelfareAction(actType: number) {
  return () =>
    requestWelfare("https://v-z.jd.com/welfare/reward.action", {
      actType,
      bizLine: "2",
      extRule: 121612 + ((Math.random() * 1000) >>> 0)
    });
}

// ---------------金币抽奖-------------------

export function getLotteryInfo() {
  return requestData<{
    remainTimes: number;
    actKey: string;
    memberLevelDesc: string;
    memberLevel: number;
    lotteryCoins: number;
    levelTimes: number;
    memberCoins: number;
    levelRemainTimes: number;
    isPlatinumExp: boolean;
    actName: string;
  }>(
    `https://ms.jr.jd.com/gw/generic/hy/h5/m/lotteryInfo`,
    {
      actKey: "AbeQry"
    },
    true
  );
}

export function getLottery() {
  return requestData<{
    awardId: number;
    awardLink: string;
    orderNo: string;
    awardImage: string;
    awardTitle: string;
    awardName: string;
    awardType: string;
  }>(`https://ms.jr.jd.com/gw/generic/hy/h5/m/lottery`, {
    actKey: "AbeQry"
  });
}

// -------------------健康金-------------------------
interface HealthInsuredRes<T> {
  success: boolean;
  // 500000:请求成功标识 506010:提额流水为空
  resultCode: string;
  resultData: T;
  resultMsg: string;
}

async function requestHealthInsured<T>() {
  var { success, resultData, resultMsg } = await requestData<
    HealthInsuredRes<T>
  >("https://ms.jr.jd.com/gw/generic/bx/h5/m/queryHealthOrder", {
    channel: "JRAPP",
    resourcePlace: "teqiandao",
    systemId: "h5.baoxian.health.front",
    productCode: ""
  });
  if (!success) {
    throw new Error(resultMsg);
  }
  return resultData;
}

export function getHealthInsuredInfo() {
  interface T {
    existOrder: boolean;
    totalInsured: string;
    specialRight: string;
    channel: string;
    unSumInsured: string;
    insuredStatus: string;
    rightStatus: string;
    realName: boolean;
    sumInsured: string;
    productCode: string;
    pin: string;
    maxAge: string;
    needWindows: string;
    minAge: string;
  }
  return requestHealthInsured<T>();
}
export function getHealthInsured() {
  interface T {
    totalInsured: string;
    sumInsured: string;
    productCode: string;
    pin: string;
    resourcePlace: string;
    channel: string;
    unsumInsured: string;
    receiveStatus: string;
    newUserStatus: string;
  }
  return requestHealthInsured<T>();
}

// ---------------金融会员开礼盒----------------
export function getGiftInfo() {
  interface T {
    actCoins: number;
    assistedTimes: number;
    shareId: string;
    assistantLimit: number;
    freeTimes: number;
    myShareId: string;
    nickname: string;
    coinTimes: number;
    userCoins: number;
    assistAddFreeTimes: number;
  }
  return requestData<T>(
    "https://ms.jr.jd.com/gw/generic/hy/h5/m/queryGiftInfo",
    { shareId: "" },
    true
  );
}

export function getGift() {
  return requestData(
    "https://ms.jr.jd.com/gw/generic/hy/h5/m/openGift",
    { shareId: "" },
    true
  );
}

export async function getFupinList() {
  var text: string = await req.get(
    "https://zt.m.jd.com/povertyReliefProjectInfo.action",
    {
      qs: {
        queryType: 3,
        provinceId: "",
        pageSize: 20,
        pageNum: 1
      }
    }
  );
  var { code, data, info } = JSON.parse(text);
  if (code !== 200) {
    throw new Error(info);
  }
  return data;
}

export function dianzhanFupin({ projectId }: any) {
  return req.post("https://z.m.jd.com/assistance.action", {
    json: { projectId, assistanceNum: 5 }
  });
}

// ---------------抽618元现金红包----------------
// https://m.jr.jd.com/spe/acs/hymSystem/index.html?contentParam=100001913&actCode=8D53388E36&actType=1#/

async function requestDataJd(
  body: any,
  {
    api,
    method = "get"
  }: {
    api: string;
    method?: "get" | "post";
  }
) {
  var form;
  var qs: any = {
    source: "jrm",
    _: Date.now()
  };
  if (method === "get") {
    qs.reqData = JSON.stringify(body);
  } else {
    form = {
      reqData: JSON.stringify(body)
    };
  }
  return req(`https://ms.jr.jd.com/gw/generic/jrm/h5/m/${api}`, {
    method,
    qs,
    form
  });
}

export async function get618Hongbao(url: string) {
  var { searchParams } = new URL(url);
  var actCode = searchParams.get("actCode");
  // var actType = searchParams.get("actType");
  // var contentParam = searchParams.get("contentParam");
  var res = await requestDataJd(
    { actCode },
    {
      method: "post",
      api: "taskFreeUserRewardAndLeftTimes"
    }
  );
  var { success, msg, data } = res;
  if (success) {
    for (let i = 0; i < data.leftTimes; i++) {
      let res1 = await requestDataJd(
        {
          actCode,
          riskDeviceParam: JSON.stringify({
            fp: "-1",
            eid: "-1",
            sdkToken: "",
            sid: ""
          })
        },
        {
          api: "taskFreeLottery",
          method: "post"
        }
      );
      console.log(res1.msg);
    }
  }
}

/**
 * 权益中心抽奖
 * @example https://m.jr.jd.com/member/rightsCenter/?cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_1001480949_&utm_term=f98f43e6c88142d580bc8e2f15a39e5f#/
 */
export async function getRightCenterLucky() {
  var { drawNum, floorInfo } = await req.get(
    "https://ms.jr.jd.com/gw/generic/bt/h5/m/queryLuckyInfo?t=0.05648720433022447&callback=__jp4"
  );
  for (let i = 0; i < drawNum; i++) {
    let { couponsDetailVo } = await requestData(
      "https://ms.jr.jd.com/gw/generic/bt/h5/m/luckyDraw",
      {
        activeId: floorInfo[0].activeId,
        t: Math.random()
      }
    );
    console.log("获取到", couponsDetailVo.remark);
  }
}

/**
 * 权益中心定时抢券
 */
export async function getRightCenterCoupons() {
  var {
    limitedResult
  }: {
    limitedResult: {
      time: string;
      floorInfo: {
        classTag: string;
        company: string;
        couponKey: string;
        // 2:可抢 5:已抢光
        couponStatus: number;
        number: string;
        text1: string;
        text2: string;
      }[];
    }[];
  } = await req.get(
    "https://ms.jr.jd.com/gw/generic/bt/h5/m/queryLimitedInfo?callback=__jp5"
  );
  return limitedResult.map(item => {
    item.floorInfo = item.floorInfo.filter(item => item.text1 === "白条立减券");
    return item;
  });
}

export async function receiveCoupon(couponKey: string) {
  var data = requestData(
    "https://ms.jr.jd.com/gw/generic/bt/h5/m/receiveCoupons",
    {
      couponKey: "023847ff1e90ac853e82a91816bf8e21",
      eid: JSON.stringify({
        eid:
          "TNNEVY6UM2645G3OEU4WPA5OIB7A4MZSUPXMQVREJQ2P5IZKD5RUIEF7AXO6RA5W5SMDN3LPMAPSKAOKQWLD4ADVGU",
        ma: "",
        im: "",
        os: "Mac OS X",
        ip: "114.217.10.249",
        ia: "",
        uu: "",
        at: "5",
        fp: "9f1cc52fcecf870674e0e12ce4f64a9b",
        token:
          "2SDF3G2DR6O6EQBMBZDJLIE32QSRXRJUMXFBJEGCFT65HL4ASHBFG5FYDSWP7X2NWMCEJUCAYKYNS"
      }),
      t: Math.random()
    }
  );
  return data;
}
