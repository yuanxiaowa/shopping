import {
  getWelfareList,
  doWelfareAction,
  getSignInfo,
  signIn,
  getGoodsJindou,
  getJinguoDayWork,
  harvestJinguo,
  signJinguo,
  getFanpaiInfo,
  fanpai,
  getLotteryInfo,
  getLottery,
  getHealthInsuredInfo,
  getHealthInsured,
  get618Hongbao,
  setReq,
  getRightCenterLucky,
  getRightCenterCoupons,
  receiveCoupon,
  getProductJingdouInfo,
  getProductJingdou
} from "./jingrong";
import {
  timer,
  timerCondition,
  log,
  logReq,
  delay
} from "../../../utils/tools";
import { Page } from "puppeteer";
import { newPage, getPageCookie } from "../../../utils/page";
import cookieManager from "../../common/cookie-manager";
import moment = require("moment");
import { executer } from "./tools";
const user = require("../../../.data/user.json");

export async function doWelfareActions() {
  log("检查参加活动领金豆");
  var welActList = await getWelfareList();
  welActList.forEach(item => {
    let count = item.rewardTimesDayLimit - item.alreadyRewardTimesDay;
    if (count > 0) {
      log(`参加活动 - ${item.actName}`);
      timer(3000 + Math.random() * 10000, count)(() =>
        logReq(`活动 - ${item.actName}`, doWelfareAction(item.actType))
      );
    }
  });
}

export async function doSign() {
  log("检查金融签到");
  var { resBusiCode, resBusiData } = await getSignInfo();
  if (resBusiCode === 0 && !resBusiData.isFlag) {
    await logReq("执行金融签到", signIn);
  }
}

export const doAdJindou = () =>
  timerCondition(3000, (data: any) => {
    // console.log(data);
    return data.canGetGb;
  })(getGoodsJindou);

export async function doJinguo() {
  log("检查金果");
  handler();
  var [signData, shareData] = await getJinguoDayWork();
  if (signData.workStatus === 0) {
    await logReq("领取金果签到奖励", signJinguo(signData.workType, 2));
  }
  console.log("金果分享状态", shareData.workStatus);
  if (shareData.workStatus === 0) {
    await logReq("金果分享", signJinguo(shareData.workType, 1));
    await delay(3000);
    shareData.workStatus = 1;
  }
  if (shareData.workStatus === 1) {
    await logReq("领取金果分享奖励", signJinguo(shareData.workType, 2));
  }
  function handler() {
    var now = new Date();
    var h = now.getHours();
    var arr = [7, 11, 18];
    var toh: any;
    for (let i of arr) {
      if (h < i) {
        toh = i;
        break;
      }
    }
    if (toh) {
      setTimeout(() => {
        logReq("金果签到", signJinguo(signData.workType, 2));
        handler();
      }, new Date(now.getFullYear(), now.getMonth(), now.getDate(), toh).getTime() - now.getTime());
    }
  }
}

export async function doFanpai() {
  log("检查翻牌");
  var { data, code } = await getFanpaiInfo();
  if (code === 1) {
    if (data.isAllowSignin !== 0) {
      return logReq("执行翻牌", fanpai);
    }
  }
}

export async function doLottery() {
  log("检查免费抽奖");
  var { lotteryCoins } = await getLotteryInfo();
  if (lotteryCoins === 0) {
    return logReq("执行免费抽奖", getLottery);
  }
}

export async function doHealthInsured() {
  log("检查健康金");
  var { unSumInsured } = await getHealthInsuredInfo();
  if (Number(unSumInsured) > 0) {
    return logReq("领取健康金", getHealthInsured);
  }
}

export async function do618Hongbao() {
  log("获取618红包");
  return get618Hongbao(
    "https://m.jr.jd.com/spe/acs/hymSystem/index.html?contentParam=100001913&actCode=8D53388E36&actType=1"
  );
}

export async function doRightCenter() {
  console.log("执行权益中心操作");
  getRightCenterLucky();
  var datas = await getRightCenterCoupons();
  for (let { time, floorInfo } of datas) {
    let diff = moment(time, "HH:mm").diff();
    if (diff > 0) {
      console.log(time + "开抢", floorInfo);
      await delay(diff);
      floorInfo.forEach(item => {
        executer(() =>
          receiveCoupon(item.couponKey).then(data => {
            console.log("权益中心抢券", data);
          })
        );
      });
    }
    break;
  }
}

export async function doProductJingdou() {
  console.log("浏览产品得京豆");
  await getProductJingdouInfo();
  while (true) {
    await getProductJingdou();
  }
}

/* export async function doGift() {
  log("检查金融会员开礼盒");
  var { freeTimes } = await getGiftInfo();
  for (let i = 0; i < freeTimes; i++) {
    return logReq("领取金融会员礼盒", getGift);
  }
} */

export async function doAll() {
  var b = await check();
  if (!b) {
    let page = await newPage();
    await login(page);
    cookieManager.jinrong.set(await getPageCookie(page));
    setReq();
    page.close();
  }
  return Promise.all([
    doSign(),
    doJinguo(),
    doWelfareActions(),
    doFanpai(),
    doLottery(),
    doHealthInsured(),
    doAdJindou(),
    do618Hongbao(),
    doRightCenter(),
    doProductJingdou()
  ]);
}

export function doAllTimer() {
  timer(1000 * 60 * 10)(() => logReq("开始收获金果", harvestJinguo));
}

export async function check() {
  try {
    await getSignInfo();
    return true;
  } catch (e) {
    return false;
  }
}

export async function login(page: Page) {
  var url =
    "https://plogin.m.jd.com/user/login.action?appid=100&kpkey=&returnurl=https%3A%2F%2Fuuj.jr.jd.com%2Fwxgrowing%2Fmoneytree7%2Findex.html%3Fchannellv%3Dsy%26sid%3Dab609165f5b75d4f3516e331b1fa3ddw%26utm_term%3Dwxfriends%26utm_source%3DiOS*url*1563119411045%26utm_medium%3Djrappshare";
  await page.goto(url);
  if (page.url() !== url) {
    return delay(3000);
  }
  await page.type("#username", user.username);
  await page.type("#password", user.password);
  await page.click("#loginBtn");
  await page.waitForNavigation();
}
