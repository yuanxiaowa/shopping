import {
  getSignStatus,
  signIn,
  getZhuanpanInfo,
  getZhuanpan
} from "./jingdong";
import { log, logReq, delay } from "../../../utils/tools";

export async function doSign() {
  await delay(5000);
  log("检查京东签到");
  var res = await getSignStatus();
  var { status } = res;
  if (status === "2") {
    return logReq("执行京东签到", signIn);
  }
}

export async function doZhuanpan() {
  await delay(5000);
  log("检查京东转盘");
  var res = await getZhuanpanInfo();
  var { lotteryCount } = res;
  for (let i = 0; i < Number(lotteryCount); i++) {
    await logReq("玩京东转盘", getZhuanpan);
  }
}

export function doAll() {
  return Promise.all([doSign(), doZhuanpan()]);
}
