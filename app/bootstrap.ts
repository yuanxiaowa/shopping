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
