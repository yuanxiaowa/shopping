/*
 * @Author: oudingyin
 * @Date: 2019-08-26 16:07:57
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-26 16:10:07
 */

import { Page } from "puppeteer";
const user = require("../../../.data/user.json").jingdong;

export async function login(page: Page) {
  console.log("京东登录");
  await page.goto("https://passport.jd.com/new/login.aspx");
  await page.click(".login-tab-r");
  await page.evaluate(() => {
    (<HTMLSpanElement>document.querySelector(".clear-btn")).click();
  });
  await page.type("#loginname", user.username);
  await page.type("#nloginpwd", user.password);
  await page.click("#loginsubmit");
  await page.waitForNavigation({
    timeout: 0
  });
  console.log("京东登录成功");
}

export async function loginMobile(page: Page) {
  await page.goto(`https://plogin.m.jd.com/user/login.action`);
  await page.type("#username", user.username);
  await page.type("#pwd", user.password);
  await page.click("#loginBtn");
  // await page.click("a.quick-qq");
  await page.waitForNavigation();
}

export async function loginAction(page: Page) {
  console.log("京东手机登录");
  await page.type("#username", user.username);
  await page.type("#pwd", user.password);
  page.click("#loginBtn");
  await page.waitForNavigation();
}
