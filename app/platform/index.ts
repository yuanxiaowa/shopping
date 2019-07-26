import { Taobao } from "./taobao";
import { Jindong } from "./jd";
import bus_global from "../common/bus";

export const taobao = new Taobao();
export const jingdong = new Jindong();

bus_global.on("bootstrap", () => {
  taobao.start();
  jingdong.start();
});
