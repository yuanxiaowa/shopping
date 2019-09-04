/*
 * @Author: oudingyin
 * @Date: 2019-07-12 16:59:57
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-04 18:09:22
 */
import { onInitCookieManager } from "./common/cookie-manager";
import { bootstrapBrowser } from "../utils/page";
import bus_global from "./common/bus";
import { bootstrapJingdongTasks } from "./platform/jd/tasks";

export default async function bootstrap() {
  onInitCookieManager().then(() => {
    bus_global.emit("cookie:init");
  });
  await bootstrapBrowser();
  bootstrapJingdongTasks();
  bus_global.emit("bootstrap");
}
