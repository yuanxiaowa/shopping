import { onInitCookieManager } from "./common/cookie-manager";
import { bootstrapBrowser } from "../utils/page";
import bus_global from "./common/bus";

export default async function bootstrap() {
  onInitCookieManager().then(() => {
    bus_global.emit("cookie:init");
  });
  await bootstrapBrowser();
  bus_global.emit("bootstrap");
}
