/*
 * @Author: oudingyin
 * @Date: 2019-07-01 09:10:22
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 09:38:23
 */
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
  getProductJingdou,
  getJinguoInfo,
  getJTLuckyInfo,
  zuanlingqian
} from "./jingrong";
import { logReq, delay } from "../../../utils/tools";
import { Page } from "puppeteer";
import { newPage, getPageCookie } from "../../../utils/page";
import cookieManager from "../../common/cookie-manager";
import moment = require("moment");
import { executer } from "./tools";
import {
  log,
  daily,
  timerCondition,
  timer,
  timerHourPoint
} from "../../../utils/decorators";
import { DT } from "../../common/config";
const user = require("../../../.data/user.json");

export class JingrongUtil {
  /**
   * @deprecated
   */
  @daily()
  @log("检查参加活动领金豆")
  async doWelfareActions() {
    var welActList = await getWelfareList();
    welActList.forEach(item => {
      let count = item.rewardTimesDayLimit - item.alreadyRewardTimesDay;
      if (count > 0) {
        // todo：次数限制
        this.doWelfareAction(item);
      }
    });
  }

  @timer(60 * 1000, 5)
  doWelfareAction(item: any) {
    console.log(`参加活动 - ${item.actName}`);
    logReq(`活动 - ${item.actName}`, doWelfareAction(item.actType));
  }

  @daily()
  @log("检查金融签到")
  async doSign() {
    var { resBusiCode, resBusiData } = await getSignInfo();
    console.log("------------", resBusiCode, resBusiData);
    if (resBusiCode === 0 && !resBusiData.isFlag) {
      await logReq("执行金融签到", signIn);
    }
  }

  @daily()
  @timerCondition(data => data.canGetGb)
  doAdJindou() {
    return getGoodsJindou();
  }

  @daily()
  @log("检查金果")
  async doJinguo() {
    var [signData, shareData] = await getJinguoDayWork();
    this.signJinguo(signData.workType);
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
  }

  @timer(1000 * 60 * 20)
  @log("收获金果")
  async harvestJinguo() {
    var { userInfo, userToken } = await getJinguoInfo();
    return harvestJinguo({ userId: userInfo, userToken });
  }

  @timerHourPoint(
    [
      [7, 9],
      [11, 13],
      [18, 20]
    ],
    1000 * 20
  )
  @log("金果签到")
  signJinguo(workType: number) {
    return signJinguo(workType, 2)();
  }

  @daily()
  @log("检查翻牌")
  async doFanpai() {
    var { data, code } = await getFanpaiInfo();
    if (code === 1) {
      if (data.isAllowSignin !== 0) {
        return logReq("执行翻牌", fanpai);
      }
    }
  }

  @daily()
  @log("检查免费抽奖")
  async doLottery() {
    var { lotteryCoins } = await getLotteryInfo();
    if (lotteryCoins === 0) {
      return logReq("执行免费抽奖", getLottery);
    }
  }

  @daily()
  @log("检查健康金")
  async doHealthInsured() {
    var { unSumInsured } = await getHealthInsuredInfo();
    if (Number(unSumInsured) > 0) {
      return logReq("领取健康金", getHealthInsured);
    }
  }

  @daily()
  @log("获取618红包")
  do618Hongbao() {
    return get618Hongbao(
      "https://m.jr.jd.com/spe/acs/hymSystem/index.html?contentParam=100001913&actCode=8D53388E36&actType=1"
    );
  }

  @daily()
  @log("执行权益中心操作")
  async doRightCenter() {
    // getRightCenterLucky();
    var datas = await getRightCenterCoupons();
    for (let { time, floorInfo } of datas) {
      let diff = moment(time, "HH:mm").diff();
      if (diff > 0) {
        // console.log(time + "开抢", floorInfo);
        await delay(diff - DT.jingdong);
        floorInfo.forEach(item => {
          executer(() =>
            receiveCoupon(item.couponKey).then(data => {
              // console.log("权益中心抢券", data);
            })
          );
        });
      }
    }
  }

  @daily()
  @log("浏览产品得京豆")
  async doProductJingdou() {
    // await getProductJingdouInfo();
    while (true) {
      await getProductJingdou();
    }
  }

  @daily()
  @log("金条福利社抽奖")
  async doJTLucky() {
    await getJTLuckyInfo();
  }

  @daily()
  @log("做任务赚零钱")
  zuanlingqian() {
    zuanlingqian();
  }
}

const jingrongUtil = new JingrongUtil();

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

  jingrongUtil.doJinguo();
  // jingrongUtil.doWelfareActions();
  jingrongUtil.doFanpai();
  jingrongUtil.doLottery();
  jingrongUtil.doHealthInsured();
  jingrongUtil.doAdJindou();
  jingrongUtil.do618Hongbao();
  jingrongUtil.doRightCenter();
  jingrongUtil.doProductJingdou();
  jingrongUtil.harvestJinguo();
  jingrongUtil.doJTLucky();
  jingrongUtil.zuanlingqian();
  return jingrongUtil.doSign();
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
