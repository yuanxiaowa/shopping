import { taobao, jingdong } from "./platform";
import bootstrapJingdongTasks from "./platform/jd/tasks";
import { onInitCookieManager } from "./common/cookie-manager";
import { onInitJingdong } from "./platform/jd/jindong";
import { onInitJingrong } from "./platform/jd/jinrong";
import { bootstrapBrowser } from "../utils/page";

export default async function bootstrap() {
  onInitCookieManager().then(async () => {
    await Promise.all([onInitJingdong(), onInitJingrong()]);
    bootstrapJingdongTasks();
  });
  await bootstrapBrowser();
  await Promise.all([taobao.start() /* jingdong.start() */]);
}
