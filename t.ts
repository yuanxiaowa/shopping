import { bootstrapBrowser, newPage } from "./utils/page";
import moment = require("moment");
import { delay } from "./utils/tools";

bootstrapBrowser().then(async browser => {
  var page = await newPage();
  var viewport = await page.evaluate(() => {
    return {
      width: window.outerWidth,
      height: window.outerHeight
    };
  });
  await page.setViewport(viewport);
  await page.setRequestInterception(true);
  page.on("request", request => {
    if (request.url().startsWith("http://img1.tbcdn.cn/tfscom")) {
      request.continue();
      return;
    }
    var type = request.resourceType();
    if (type === "image" || type === "stylesheet" || type === "font") {
      request.respond({
        body: ""
      });
    } else {
      request.continue();
    }
  });
  var now = Date.now();
  var to = moment("00", "HH"); //.add("d", 1);
  var dt = to.valueOf() - now - 100;
  console.log(dt);
  await delay(dt);
  await page.goto(
    `http://miao.item.taobao.com/601512195839.htm?spm=5070.7116889.1996665613.1.sUjDLI`
  );
  var b = page.evaluate(() => {
    var refresh_btn = document.querySelector<HTMLDivElement>(
      ".J_RefreshStatus"
    );
    if (refresh_btn) {
      refresh_btn.click();
      return false;
    }
    return true;
  });
  if (!b) {
    await page.waitForResponse(res =>
      res.url().startsWith("http://m.ajax.taobao.com/qst.htm")
    );
  }
  page.evaluate(() => {
    document.querySelector<HTMLInputElement>(".answer-input")!.focus();
  });
});
