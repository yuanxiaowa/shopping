"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const page_1 = require("../utils/page");
const tools_1 = require("../utils/tools");
async function getHongbao() {
    var page = await page_1.newPage();
    page.goto(`https://h5.m.jd.com/babelDiy/Zeus/2QJAgm3fJGpAkibejRi36LAQaRto/index.html?_ts=${Date.now()}&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=Wxfriends&ad_od=share&utm_user=plusmember`);
    var [data1, { data: { answerStatusCode } }] = await Promise.all([
        page
            .waitForResponse(res => /https:\/\/api.m.jd.com\/client.action?.*functionId=getBabelAdvertInfo/.test(res.url()))
            .then(res => res.text())
            .then(text => JSON.parse(/\((.*)\)/.exec(text)[1])),
        page
            .waitForResponse(res => /https:\/\/api.m.jd.com\/client.action?.*functionId=answerInfo/.test(res.url()))
            .then(res => res.json())
    ]);
    if (answerStatusCode === 0) {
        await tools_1.delayRun("09:00:00");
        await page.evaluate(() => {
            document.querySelector(".play-button").click();
        });
        await tools_1.delayRun(25 * 1000);
        let { list: [{ desc }] } = data1.advertInfos.find((item) => item.groupId === "03303165" || item.groupName === "题目/选项/答案");
        await page.evaluate((text) => {
            var eles = Array.from(document.querySelectorAll(".answer-option button"));
            var ele = eles.find(ele => {
                var content = ele.textContent.trim().replace(/\w+\./, "");
                return content === text;
            });
            ele.click();
        }, desc);
    }
    await page.close();
}
exports.getHongbao = getHongbao;
function delayPeriod(hours) {
    var now = new Date();
    var h = hours.find(n => n > now.getHours());
    if (h !== undefined) {
        return tools_1.delayRun(`${h}:00:00`);
    }
    return false;
}
async function getPeriodCoupon() {
    var p = delayPeriod([10, 12, 14, 18]);
    if (p === false) {
        return;
    }
    var page = await page_1.newPage();
    await page.goto("https://pro.m.jd.com/mall/active/4MtESUzHLukCr2mi8CLxPCjvrcht/index.html?ad_od=share&from=singlemessage&isappinstalled=0&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=442b91bf381643ceb18b3f42b8ffec69");
    await p;
    await page.evaluate(function () {
        var eles = Array.from(document.querySelectorAll(".coupon"));
        eles.forEach(ele => ele.click());
    });
    page.waitForResponse(res => {
        if (res.url() ===
            "https://api.m.jd.com/client.action?functionId=newBabelAwardCollection") {
            res.json().then(console.log);
        }
        return false;
    });
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.close();
    return getPeriodCoupon();
}
exports.getPeriodCoupon = getPeriodCoupon;
