"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jindong_1 = require("./jindong");
const tools_1 = require("../utils/tools");
async function doSign() {
    tools_1.log("检查京东签到");
    var { status } = await jindong_1.getSignStatus();
    if (status === "2") {
        return tools_1.logReq("执行京东签到", jindong_1.signIn);
    }
}
exports.doSign = doSign;
async function doZhuanpan() {
    tools_1.log("检查京东转盘");
    var { lotteryCount } = await jindong_1.getZhuanpanInfo();
    for (let i = 0; i < Number(lotteryCount); i++) {
        await tools_1.logReq("玩京东转盘", jindong_1.getZhuanpan);
    }
}
exports.doZhuanpan = doZhuanpan;
function doAll() {
    return Promise.all([doSign(), doZhuanpan()]);
}
exports.doAll = doAll;
