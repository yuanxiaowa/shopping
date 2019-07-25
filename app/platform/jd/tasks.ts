import { doAll as doJdAll } from "./jd-util";
import { doAll as doJrAll } from "./jr-util";
import { getSignJRInfo, getSignAwardJR, onInitJingrong } from "./jinrong";
import bus_global from "../../common/bus";
import { onInitJingdong } from "./jindong";

export function bootstrapJingdongTasks() {
  return Promise.all([doJdAll(), doJrAll()])
    .then(() => getSignJRInfo())
    .then(({ isGet }) => {
      if (!isGet) {
        getSignAwardJR();
      }
    });
}

bus_global.on("cookie:init", () => {
  Promise.all([onInitJingdong(), onInitJingrong()]);
});
