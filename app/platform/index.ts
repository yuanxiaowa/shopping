import { Taobao } from "./taobao";
import { Jingdong } from "./jd";
import bus_global from "../common/bus";

export const taobao = new Taobao();
export const jingdong = new Jingdong();

bus_global.on("bootstrap", () => {
  console.log("--start------------------------------");
  taobao.start();
  jingdong.start();
});
