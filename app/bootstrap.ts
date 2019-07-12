import { bootstrapBrowser } from "../utils/page";
import { taobao, jingdong } from "./platform";
import { ensureFile } from "fs-extra";
import { getCookieFilename } from "../utils/tools";
import bootstrapJingdongTaskds from "./platform/jd/tasks";

export default async function bootstrap() {
  bootstrapJingdongTaskds();
  await Promise.all([
    bootstrapBrowser(),
    ensureFile(getCookieFilename("jd")),
    ensureFile(getCookieFilename("jd-goods")),
    ensureFile(getCookieFilename("taobao"))
  ]);
  await Promise.all([taobao.start(), jingdong.start()]);
}
