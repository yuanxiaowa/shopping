/*
 * @Author: oudingyin
 * @Date: 2019-07-01 09:10:22
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-16 10:58:12
 */
import puppeteer = require("puppeteer");
import { Browser, Page } from "puppeteer";
import resolver = require("puppeteer-chromium-resolver");
import fs = require("fs-extra");
import path = require("path");
import { UA } from "../app/common/config";

var browser: Browser;
var defaultPage: Page;

export async function bootstrapBrowser() {
  var revisionInfo = await resolver();
  var dataDir = process.cwd() + "/.data/data-dir";
  browser = await puppeteer.launch({
    headless: false,
    userDataDir: dataDir,
    devtools: false,
    executablePath: revisionInfo.executablePath
  });
  let shaderFolder = path.join(dataDir, "GrShaderCache");
  if (await fs.pathExists(shaderFolder)) {
    try {
      await fs.remove(shaderFolder);
    } catch (e) {}
  }
  [defaultPage] = await browser.pages();
  // defaultPage.goto("http://localhost:8080/");
  defaultPage.exposeFunction("evalFunction", async (code: string) => {
    console.log("进入函数执行");
    var f = eval(`(${code})`);
    console.log(f);
    var page = await newPage();
    var ret = await f(page);
    page.close();
    return ret;
  });
  defaultPage.exposeFunction("evalFile", async (filename, refresh = false) => {
    console.log(require.resolve(filename));
    if (refresh) {
      filename = require.resolve(filename);
      delete require.cache[filename];
    }
    require(filename);
  });
}

export async function newPage() {
  var page = await browser.newPage();
  page.setUserAgent(UA.pc);
  await page.setViewport({
    width: 400,
    height: 573
  });
  /* page.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
  ); */
  // await page.setRequestInterception(true);
  // page.on("request", request => {
  //   if (handle && handle(request)) {
  //     return;
  //   }
  //   var url = request.url();
  //   var type = request.resourceType();
  //   if (["font", "stylesheet", "media", "image"].includes(type)) {
  //     request.respond({
  //       status: 200
  //     });
  //   } else if (type === "xhr" || type === "fetch") {
  //     if (/\.(png|jpeg|webp|gif)$/i.test(url)) {
  //       request.respond({
  //         status: 200
  //       });
  //     } else {
  //       request.continue();
  //     }
  //   } else {
  //     request.continue();
  //   }
  // });
  return page;
}

export async function getPageCookie(page: Page, urls?: string[]) {
  var cookies: any;
  if (urls) {
    cookies = await page.cookies(...urls);
  } else {
    cookies = await page.cookies();
  }
  var cookie_str = cookies
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join("; ");
  return cookie_str;
}

export function destroyBrowser() {
  return browser.close();
}
