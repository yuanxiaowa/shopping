import { taobao, jingdong } from "../platform";
import AutoShop from "../platform/auto-shop";
import { Taobao } from "../platform/taobao";
import { Jingdong } from "../platform/jd";

export default <
  Record<string, AutoShop> & { taobao: Taobao; jingdong: Jingdong }
>{
  taobao,
  jingdong
};
