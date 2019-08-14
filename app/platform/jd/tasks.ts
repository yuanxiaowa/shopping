import { doAll as doJdAll } from "./jd-util";
import { doAll as doJrAll, doAllTimer } from "./jr-util";
import { getSignJRInfo, getSignAwardJR, onInitJingrong } from "./jingrong";
import bus_global from "../../common/bus";
import { onInitJingdong } from "./jingdong";
import { createDailyTask } from "../../../utils/tools";

export function bootstrapJingdongTasks() {
  doAllTimer();
  return createDailyTask(() =>
    Promise.all([doJdAll(), doJrAll()])
      .then(() => getSignJRInfo())
      .then(({ isGet }) => {
        if (!isGet) {
          getSignAwardJR();
        }
      })
  );
}

bus_global.on("cookie:init", () => {
  Promise.all([onInitJingdong(), onInitJingrong()]);
});
