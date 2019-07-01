import { getSignStatus, signIn, getZhuanpanInfo, getZhuanpan } from "./jindong";
import { log, logReq } from "../utils/tools";

export async function doSign() {
  log("检查京东签到");
  var { status } = await getSignStatus();
  if (status === "2") {
    return logReq("执行京东签到", signIn);
  }
}

export async function doZhuanpan() {
  log("检查京东转盘");
  var { lotteryCount } = await getZhuanpanInfo();
  for (let i = 0; i < Number(lotteryCount); i++) {
    await logReq("玩京东转盘", getZhuanpan);
  }
}

export function doAll() {
  return Promise.all([doSign(), doZhuanpan()]);
}
