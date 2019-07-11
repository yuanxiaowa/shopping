import { doAll as doJdAll } from "./jd-util";
import { doAll as doJrAll } from "./jr-util";
import { getSignJRInfo, getSignAwardJR } from "./jinrong";

Promise.all([doJdAll(), doJrAll()])
  .then(() => getSignJRInfo())
  .then(({ isGet }) => {
    if (!isGet) {
      getSignAwardJR();
    }
  });
