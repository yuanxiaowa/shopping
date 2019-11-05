/*
 * @Author: oudingyin
 * @Date: 2019-07-01 09:10:22
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-07-01 09:10:22
 */
import {
  getSignStatus,
  signIn,
  getZhuanpanInfo,
  getZhuanpan
} from "./jingdong";
import { logReq, delay } from "../../../utils/tools";
import { daily, log } from "../../../utils/decorators";

export class JingdongUtil {
  @daily()
  @log("检查京东签到")
  async doSign() {
    var res = await getSignStatus();
    var { status } = res;
    if (status === "2") {
      return logReq("执行京东签到", signIn);
    }
  }

  @daily()
  @log("检查京东转盘")
  async doZhuanpan() {
    var res = await getZhuanpanInfo();
    var { lotteryCount } = res;
    for (let i = 0; i < Number(lotteryCount); i++) {
      await logReq("玩京东转盘", getZhuanpan);
    }
  }
}

const util = new JingdongUtil();

export function doAll() {
  return Promise.all([util.doSign(), util.doZhuanpan()]);
}
