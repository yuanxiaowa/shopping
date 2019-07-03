"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jinrong_1 = require("./jinrong");
const tools_1 = require("../utils/tools");
async function doWelfareActions() {
    tools_1.log("检查参加活动领金豆");
    var { data: { welActList } } = await jinrong_1.getWelfareList();
    welActList.forEach(item => {
        let count = item.rewardTimesDayLimit - item.alreadyRewardTimesDay;
        if (count > 0) {
            tools_1.log(`参加活动 - ${item.actName}`);
            tools_1.timer(3000 + Math.random() * 10000, count)(() => tools_1.logReq(`活动 - ${item.actName}`, jinrong_1.doWelfareAction(item.actType)));
        }
    });
}
exports.doWelfareActions = doWelfareActions;
async function doSign() {
    tools_1.log("检查金融签到");
    var { resBusiCode, resBusiData } = await jinrong_1.getSignInfo();
    if (resBusiCode === 0 && !resBusiData.isFlag) {
        await tools_1.logReq("执行金融签到", jinrong_1.signIn);
    }
}
exports.doSign = doSign;
exports.doAdJindou = () => tools_1.timerCondition(3000, (data) => {
    console.log(data);
    return data.canGetGb;
})(jinrong_1.getGoodsJindou);
async function doJinguo() {
    tools_1.log("检查金果");
    tools_1.timer(1000 * 60 * 10)(() => tools_1.logReq("开始收获金果", jinrong_1.harvestJinguo));
    handler();
    var [signData, shareData] = await jinrong_1.getJinguoDayWork();
    if (signData.workStatus === 0) {
        await tools_1.logReq("领取金果签到奖励", jinrong_1.signJinguo(signData.workType, 2));
    }
    console.log("金果分享状态", shareData.workStatus);
    if (shareData.workStatus === 0) {
        await tools_1.logReq("金果分享", jinrong_1.signJinguo(shareData.workType, 1));
        shareData.workStatus = 1;
    }
    if (shareData.workStatus === 1) {
        await tools_1.logReq("领取金果分享奖励", jinrong_1.signJinguo(shareData.workType, 2));
    }
    function handler() {
        var now = new Date();
        var h = now.getHours();
        var arr = [7, 11, 18];
        var toh;
        for (let i of arr) {
            if (h < i) {
                toh = i;
                break;
            }
        }
        if (toh) {
            setTimeout(() => {
                tools_1.logReq("金果签到", jinrong_1.signJinguo(signData.workType, 2));
                handler();
            }, new Date(now.getFullYear(), now.getMonth(), now.getDate(), toh).getTime() - now.getTime());
        }
    }
}
exports.doJinguo = doJinguo;
async function doFanpai() {
    tools_1.log("检查翻牌");
    var { data, code } = await jinrong_1.getFanpaiInfo();
    if (code === 1) {
        if (data.isAllowSignin !== 0) {
            return tools_1.logReq("执行翻牌", jinrong_1.fanpai);
        }
    }
}
exports.doFanpai = doFanpai;
async function doLottery() {
    tools_1.log("检查免费抽奖");
    var { lotteryCoins } = await jinrong_1.getLotteryInfo();
    if (lotteryCoins === 0) {
        return tools_1.logReq("执行免费抽奖", jinrong_1.getLottery);
    }
}
exports.doLottery = doLottery;
async function doHealthInsured() {
    tools_1.log("检查健康金");
    var { success, resultData, resultMsg } = await jinrong_1.getHealthInsuredInfo();
    if (success) {
        if (Number(resultData.unSumInsured) > 0) {
            return tools_1.logReq("领取健康金", jinrong_1.getHealthInsured);
        }
    }
}
exports.doHealthInsured = doHealthInsured;
async function doGift() {
    tools_1.log("检查金融会员开礼盒");
    var { success, data } = await jinrong_1.getGiftInfo();
    if (success) {
        for (let i = 0; i < data.freeTimes; i++) {
            return tools_1.logReq("领取金融会员礼盒", jinrong_1.getGift);
        }
    }
}
exports.doGift = doGift;
async function doAll() {
    return Promise.all([
        doSign(),
        doJinguo(),
        doWelfareActions(),
        doFanpai(),
        doLottery(),
        doHealthInsured(),
        exports.doAdJindou()
    ]);
}
exports.doAll = doAll;
