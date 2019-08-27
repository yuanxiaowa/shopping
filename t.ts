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
    if (
      !request.url().startsWith("https://buy.tmall.com/order/confirm_order.")
    ) {
      request.continue();
      return;
    }
    request.respond({
      contentType: "text/html",
      body: require("fs").readFileSync(
        "/Users/oudingyin/projects/shopping/.data/taobao/2019-08-28/pc-订单结算页/00_00_01.840.html",
        "utf-8"
      )
    });
    /* var type = request.resourceType();
    if (type === "image" || type === "stylesheet" || type === "font") {
      request.respond({
        body: ""
      });
    } else {
      request.continue();
    } */
  });
  page.goto(
    "https://buy.tmall.com/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined"
  );
});
