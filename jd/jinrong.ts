import request, { RequestPromise } from "request-promise-native";
import * as R from "ramda";

var req = request.defaults({
  headers: {
    "Accept-Encoding": "br, gzip, deflate",
    Cookie:
      "__jda=64921067.1557764020721597043068.1557764021.1562288986.1562294456.201; __jdb=64921067.1.1557764020721597043068|201.1562294456; __jdc=64921067; __jdu=1557764020721597043068; _jrda=32; _jrdb=1562294456534; qd_ad=-%7C-%7C-%7C-%7C0; qd_fs=1560773554496; qd_ls=1562288188193; qd_sid=JX0CASDN-IFCFKZAZISPAY7IPAANM-50; qd_sq=50; qd_ts=1562294456235; qd_uid=JX0CASDN-IFCFKZAZISPAY7IPAANM; pt_key=app_openAAJdHqA6ADBRFI9jt6J7Vo19xsvZY6x8dQAfv3cZpvFP3ysdFTZZNLeRdPCdeCAhc4VwrvMYYvc; pt_pin=yuanxiaowa_m; pwdt_id=yuanxiaowa_m; sid=b055297cd3eaa8765d2f09ad752c77bw; 3AB9D23F7A4B3C9B=ZXHJWSWBJENX73DQAH7BW3RFGBNXZFMPJG6FFUDG3F26WRTNTZLAEVZEAERLMWPHRZGFKKG5YCL5XRQYJ7WB6F3NKE; mba_muid=1557764020721597043068; PPRD_P=LOGID.1562203335678.108026117; __jdv=168871293%7Ckong%7Ct_1000603438_%7Ctuiguang%7C71546f2d8eb1458c933895b3238fc8b5%7C1562203335657; unpl=V2_ZzNtbURXRxByX0UBck0PBWIHGw9KVUEcfQwVVngbVVI1CkFZclRCFX0UR1JnGFkUZgsZXkFcQxFFCEdkexhdBGACEFhAXnMlRQtGZHsYbAVjBxRbRVJCFnQORVR%2fEVoEYgETWktncxJ1AXZkrbHQ0suTxvn1g%2b2qRQhFUn0eWQFmAxttQ2dDHHcNTlJ%2bGl0HV0h8XA9XRxFzDkFRehpdA2QDFlVEVkYXdA9PZHopXw%3d%3d; shshshfp=421402fc07d389d37eab077fe72c74b9; shshshfpb=m8WE%201VKX0Or7E4I3aBvbsQ%3D%3D; _mkjdcn=fd8d899a70c1070cf3b8e4b0532cb2ff; _mkjdcnsl=001; mt_xid=V2_52007VwMWVlteVV8eShhaBmcHGlRcXVBbGEApDAAzVEJQCFpOWRhJH0AAYApFTg0LAl4DSU0LBjILFQddC1AKL0oYXA17AhROXFtDWR1CGlsOZwsiUG1aYlkeTxFZAFcGElZf; sk_history=37294065093%2C10026059799%2C1580955%2C231415%2C33258879686%2C33259162148%2C1753876811%2C18238296370%2C32771981785%2C41634409625%2C46373343651%2C; __wga=1560773579734.1560773569623.1560357192664.1557764625554.2.8; cid=10; retina=1; wq_logid=1560773579.2030954301; wqmnx1=MDEyNjM5NToucjIuNDhpKENlX2FBaTEsY2wvaUFlODQtOG5zPWxpMnMzdHIzZXRvc0E4biZTMS4yMGVucGtrbnNBcE1QZEBubmFWLmFpM0NlZEBtNllVNFdTSCk%3D; wxa_level=1; promotejs=2b487cbe88478e9842863debc0beb783112; buy_uin=15475729444; jdpin=yuanxiaowa_m; pin=yuanxiaowa_m; wq_skey=zmBCF90D9A530B14356EBB3018EBAD7B32EFC7B2B3BF38253A4A9F1F24707EE6AB28037E9F17F085E51E9EC0E5724EDAB455EE64DFE7117C79228C6B3491352DEB6F142EC196F44A71E4FC0DBE7378190F; wq_uin=15475729444; wq_area=12_904_0%7C2; sc_width=414; visitkey=69434676247894202; webp=0; shshshfpa=200a6c75-1d11-7edd-183a-ee2da878a5dc-1557764204; __jrr=B5A0081E3CEFAC3893ECA6F1385D50",
    // Accept: '*/*',
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/application=JDJR-App&deviceId=7B4C588C-8371-4F85-B91D-F015D8C88E90&clientType=ios&iosType=iphone&clientVersion=5.2.32&HiClVersion=5.2.32&isUpdate=0&osVersion=12.3.1&osName=iOS&platform=iPhone 7 Plus (A1661/A1785/A1786)&screen=736*414&src=App Store&ip=2408:84ec:a012:4fe0:8e8:d4c0:79ca:649e&mac=02:00:00:00:00:00&netWork=1&netWorkType=1&stockSDK=stocksdk-iphone_3.0.0&sPoint=MTAwMDUjSlJMaWZlQ2hhbm5lbFZpZXdDb250cm9sbGVyI3RhbmNodWFuZzQwMDFfSlJMaWZlQ2hhbm5lbFZpZXdDb250cm9sbGVyKihudWxsKSrkvJfnrbnmibbotKvlpKfotZst5YWo6YeP&jdPay=(*#@jdPaySDK*#@jdPayChannel=jdfinance&jdPayChannelVersion=5.2.32&jdPaySdkVersion=2.23.3.0&jdPayClientName=iOS*#@jdPaySDK*#@)"
    // Referer: 'https://m.jr.jd.com/btyingxiao/advertMoney/html/collar.html?iframeSrc=https%3A%2F%2Fccc-x.jd.com%2Fdsp%2Fnc%3Fext%3DaHR0cDovL3JlLm0uamQuY29tL2xpc3QvaXRlbS85NzU2LTMyODU5MTQ0NTEzLmh0bWw_cmVfZGNwPTQ0Z2Ntd3hGVm9rdWhQMFBDc1dBQ0VLZUFiVGFXYTNpanhYNnM0RW1USlY1RjJjWC1mMjNiMkJSMjduT1FWYWkyUlg5NDJvSWRKM0hYZ0pBaFFWYXBscklCQ0c3V29oQkgxamJFd3B4YXM4dCZ3aXRoX2twbD0w%26log%3DyJLB6LIpm9Fe_DYp8oLfiVanGvdXr1CfkU5Ikyj0aKL6d73M6kDEcVTFe4WOBnwC7dPK6vT9y2r_QQGNybqxVFg_8uIauPBm2Z5XRUyLXOdaNrwv6wIKAchuLsy9HRNOmJNs2Oo7Jm0hiq-Pb99EcHX60vNjPyLK9FPZ3e1qXLLlPI71wTijyrYDdVlHcg6lBX7gJ1iZXsY5NN2LDF4c2tXuCazR3sGiChZNxeUTJ6SD2DWc7_uic19ZqHK-gwNL6FesLoTdiX2b0-OBz_F_FAG9c0U3zojLJtlgG_GOwzr6boMfas-od2IcuvG4p9EXzcX5XbgGX5dYtMZcijsNhYG4GOHeRVAzOhgHF-1v9E5NU0RVHDTPueTTkE0HjagEwnGtpxz-2ojaowC6NgKzLbRus02yanoIbKhk3hXtlNCk9MDirVWKwJ_wSaABvsQ-P09G-tr6u8o_N6lEKsI8Kg%26v%3D404%26with_kpl%3D0&adId=764868357&bussource=',
    // 'Accept-Language': 'en-us'
  },
  transform(body) {
    if (typeof body === "string") {
      body = JSON.parse(body);
    }
    var { resultCode, resultMsg, resultData } = body;
    if (resultCode !== 0) {
      throw new Error(resultMsg);
    }
    return resultData;
  }
});

function getFormData(data: any) {
  return {
    reqData: JSON.stringify(data)
  };
}

function getJsonpData(body: string) {
  return JSON.parse(body.replace(/[\w$]+\((.*)\)/, "$1"));
}

/**
 * 查询汇总信息
 */
export function querySignBusiness(): RequestPromise<{
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
}> {
  return req.post(
    "https://ms.jr.jd.com/gw/generic/hy/h5/m/querySignBusinessH5",
    {
      qs: {
        _: Date.now()
      },
      form: getFormData({ channelSource: "JRAPP" })
    }
  );
}

/**
 * 获取签到信息
 */
export function getSignInfo(): RequestPromise<{
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
}> {
  return req.post("https://ms.jr.jd.com/gw/generic/hy/h5/m/querySignHistory", {
    qs: {
      _: Date.now()
    },
    form: getFormData({ channelSource: "JRAPP" })
  });
}

/**
 * 签到
 */
export function signIn(): RequestPromise<{
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
}> {
  return req.post(`https://ms.jr.jd.com/gw/generic/hy/h5/m/signIn`, {
    qs: {
      _: Date.now()
    },
    form: getFormData({ channelSource: "JRAPP" })
  });
}

/**
 * 点击商品领取金豆
 */
export function getGoodsJindou(): RequestPromise<{
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
}> {
  return req.post("https://ms.jr.jd.com/gw/generic/jrm/h5/m/sendAdGb", {
    form: getFormData({
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
    })
  });
}

export function getSignJRInfo(): RequestPromise<{
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
}> {
  return req.post("https://ms.jr.jd.com/gw/generic/jrm/h5/m/signInit", {
    qs: {
      _: Date.now()
    },
    form: getFormData({ source: "JR" })
  });
}

/**
 * 领取双签奖励
 */
export function getSignAwardJR(): RequestPromise<{
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
}> {
  return req.post(`https://ms.jr.jd.com/gw/generic/jrm/h5/m/getSignAwardJR`, {
    qs: {
      _: Date.now()
    },
    form: getFormData({
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
    })
  });
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
export function getJinguoInfo(): Promise<{
  // 昵称
  nick: string;
  treeInfo: TreeInfo & {
    coin: number;
  };
  sharePin: string;
  workerList: any[];
  avatar: string;
  firstLogin: boolean;
}> {
  return req
    .post(`https://ms.jr.jd.com/gw/generic/uc/h5/m/login`, {
      qs: {
        _: Date.now()
      },
      form: getFormData({
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
      })
    })
    .then(({ data }) => data);
}

/**
 * 收获金果
 */
export function harvestJinguo(): Promise<{
  upgrade: boolean;
  treeInfo: TreeInfo;
}> {
  return req
    .post(`https://ms.jr.jd.com/gw/generic/uc/h5/m/harvest`, {
      qs: {
        _: Date.now()
      },
      form: getFormData({ source: 2, sharePin: null })
    })
    .then(({ data }) => data);
}

/**
 * 金果签到
 * @param workType
 * @param opType 1:执行前置操作 2:领取奖励
 */
export function signJinguo(workType: number, opType: number) {
  return (): Promise<{
    opMsg: string;
    // 0：成功 1：失败
    opResult: number;
    // 获得金果数量
    prizeAmount: number;
  }> => {
    return req
      .post(`https://ms.jr.jd.com/gw/generic/uc/h5/m/doWork`, {
        qs: {
          _: Date.now()
        },
        form: getFormData({ source: 2, workType, opType })
      })
      .then(({ data }) => data);
  };
}

export function getJinguoDayWork(): Promise<
  {
    // 奖励数量
    prizeAmount: number;
    prizeType: number;
    workContent: string;
    workName: string;
    // -1:不可操作 0:可操作 1:可领取 2:已完成
    workStatus: -1 | 0 | 1 | 2;
    workType: number;
  }[]
> {
  return req
    .post(`https://ms.jr.jd.com/gw/generic/uc/h5/m/dayWork`, {
      qs: {
        _: Date.now()
      }
    })
    .then(({ data }) => data);
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

export async function getFanpaiInfo(): Promise<
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
> {
  var body: string = await req.post("https://gpm.jd.com/signin_new/home", {
    qs: {
      sid: "47a4f6f4335b498f4a462e2d5e5d9f8w",
      uaType: "2",
      _: Date.now(),
      callback: "Zepto1561530641091"
    },
    gzip: true,
    transform: R.identity
  });
  return getJsonpData(body)[0];
}

export async function fanpai(): Promise<FanpaiRes<{}>> {
  var body: string = await req.get("https://gpm.jd.com/signin_new/choice", {
    qs: {
      sid: "47a4f6f4335b498f4a462e2d5e5d9f8w",
      uaType: "2",
      position: "1",
      _: Date.now(),
      callback: "Zepto1561531571875"
    },
    transform: R.identity,
    gzip: true
  });
  return getJsonpData(body)[0];
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

export async function getWelfareList(): Promise<
  WelfareRes<{
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
  }>
> {
  var body: string = await req.post(
    `https://v-z.jd.com/welfare/act/getActList.action`,
    {
      qs: { bizLine: 2, rewardType: 4 },
      form: {
        callback: "$"
      },
      gzip: true,
      transform: R.identity
    }
  );
  return getJsonpData(body);
}

export function doWelfareAction(actType: number) {
  return async (): Promise<
    WelfareRes<{
      amount: number;
      // 4
      rewardType: number;
    }>
  > => {
    var body = await req.get("https://v-z.jd.com/welfare/reward.action", {
      qs: {
        actType,
        bizLine: "2",
        extRule: 121612 + ((Math.random() * 1000) >>> 0),
        callback: "callbackName1561533551104"
      },
      gzip: true,
      transform: R.identity
    });
    return getJsonpData(body);
  };
}

// ---------------金币抽奖-------------------

interface LotteryRes<T> {
  remainTimes: number;
  msg: string;
  actKey: string;
  // 0000
  code: string;
  lotteryCoins: number;
  data: T;
}

export function getLotteryInfo(): RequestPromise<
  LotteryRes<{
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
  }>
> {
  return req.get(`https://ms.jr.jd.com/gw/generic/hy/h5/m/lotteryInfo`, {
    qs: getFormData({ actKey: "AbeQry", t: Date.now() })
  });
}

export function getLottery(): RequestPromise<
  LotteryRes<{
    awardId: number;
    awardLink: string;
    orderNo: string;
    awardImage: string;
    awardTitle: string;
    awardName: string;
    awardType: string;
  }>
> {
  return req.get(`https://ms.jr.jd.com/gw/generic/hy/h5/m/lottery`, {
    qs: getFormData({ actKey: "AbeQry", t: Date.now() })
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

export function getHealthInsuredInfo(): RequestPromise<
  HealthInsuredRes<{
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
  }>
> {
  return req.post("https://ms.jr.jd.com/gw/generic/bx/h5/m/queryHealthOrder", {
    form: getFormData({
      channel: "JRAPP",
      resourcePlace: "teqiandao",
      systemId: "h5.baoxian.health.front",
      productCode: ""
    })
  });
}
export function getHealthInsured(): RequestPromise<
  HealthInsuredRes<{
    totalInsured: string;
    sumInsured: string;
    productCode: string;
    pin: string;
    resourcePlace: string;
    channel: string;
    unsumInsured: string;
    receiveStatus: string;
    newUserStatus: string;
  }>
> {
  return req.post(
    `https://ms.jr.jd.com/gw/generic/bx/h5/m/receiveHealthInsured`,
    {
      form: getFormData({
        insuredStatus: "2",
        realName: true,
        channel: "JRAPP",
        resourcePlace: "teqiandao",
        systemId: "h5.baoxian.health.front",
        productCode: "21000023"
      })
    }
  );
}

// ---------------金融会员开礼盒----------------
export function getGiftInfo(): RequestPromise<{
  msg: string;
  code: string;
  data: {
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
  };
  success: boolean;
}> {
  return req.get("https://ms.jr.jd.com/gw/generic/hy/h5/m/queryGiftInfo", {
    qs: Object.assign(
      {
        timestamp: Date.now()
      },
      getFormData({ shareId: "" })
    )
  });
}

export function getGift(): RequestPromise<{
  success: boolean;
  // 奖品提示
  msg: string;
  // A1002
  code: string;
}> {
  return req.get("https://ms.jr.jd.com/gw/generic/hy/h5/m/openGift", {
    qs: Object.assign(
      {
        timestamp: Date.now()
      },
      getFormData({ shareId: "" })
    )
  });
}
