"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_native_1 = __importDefault(require("request-promise-native"));
const R = __importStar(require("ramda"));
var req = request_promise_native_1.default.defaults({
    headers: {
        "Accept-Encoding": "br, gzip, deflate",
        Cookie: "shshshfpa=efec9ac4-51e8-49b5-39e2-98738c9beef7-1562074692; shshshfpb=nJ7amBsPdyvJy6sdevR2i0w%3D%3D; __jdu=1562074689999533612174; pinId=o33LALMZuHAw7XCGO7xh8Q; unick=jd_%E9%80%9D%E6%B0%B4%E6%B5%81%E5%B9%B4; _tp=TC6EhQQH1Rx7lV8X05H6rA%3D%3D; _pst=yuanxiaowa_m; areaId=12; pin=yuanxiaowa_m; user-key=47b0b619-397c-427d-8b0b-2d0fad0aa57b; ipLocation=%u6c5f%u82cf; cn=72; __jdc=122270672; TrackID=1J9DqU5PxN38w3bWeQSPIzEikC9cNAa125BGN39ZIvmmRNIXaLRAbjsAFqOJ3tSJV_zKsBydQYOPAHNNmjc8hfJ01MenPv6ZLWxmmf1exwO9SDz7LzPgL4HuZK-mcmk7O; ceshi3.com=201; ipLoc-djd=12-988-40034-51587.1091472708; lsid=di6ra5zxou2h1d35iayxst1iyzhdxhfa; mba_muid=1562074689999533612174; rurl=https%3A%2F%2Fwqs.jd.com%2Fevent%2Fpromote%2Fmobile8%2Findex.shtml%3Fptag%3D17036.106.1%26ad_od%3D4%26cu%3Dtrue%26cu%3Dtrue%26utm_source%3Dkong%26utm_medium%3Djingfen%26utm_campaign%3Dt_2011246109_%26utm_term%3D5adc74e4969b47088e630d31139d99f1%26scpos%3D%23st%3D911; TrackerID=JBuy_gXzC9s951ZrbjN87ZhJm1MxdRsrpQ3qzcoHO6FUUBriAmM2ONssWfBQjR6eyngO06GQrrpP1TyfdnLcKCi5TH9d37meAL90VRqNRjQso95LOsvkF2WuZILFU_WD; pt_key=AAJdIGfrADBwTWMd3Ho6HVYJslxPwJrMHgdNIcDSVJybXAt8DuWuqOJ3rs_lO5T9Ye5xlyUpewg; pt_pin=yuanxiaowa_m; pt_token=5y5bo1lf; pwdt_id=yuanxiaowa_m; buy_uin=15475729444; jdpin=yuanxiaowa_m; wq_skey=zmE48B6FD576A0F732E919224F8806F34D360E936E894D267B25AEAF083FB5498F4D39EF67F04F56AC419A916A25B6D3B4A8111B82CB09604F3651449D6B635D771A31D9C47DA765A673B51EFDBA7A9CE0; wq_uin=15475729444; wxa_level=1; retina=0; webp=1; PPRD_P=EA.17036.106.1-UUID.1562074689999533612174; sc_width=1440; cid=9; visitkey=64413850893579769; wq_ufc=1f5d39401b5ea368f2df03016fb923a1; unpl=V2_ZzNtbREEEBdyCRMGLkoMAWJRGwlKUUNAfQ9EXXMYD1AyBxVdclRCFX0UR1JnGFsUZAEZXkRcQhBFCEJkeBhcBWQGFV1DX3MlfQAoVDYZMgYJA18QD2dAFUUIR2R7HVsGZgUXWktfSx19DERWfBlfBWEGIm1CUXMlPlECBi9PCEU%2fRxJeQGdCJXQ4R2Qwd11IZwcVXkNRRhJ8AE5ccx1eB2ADEV1EUnMURQs%3d; CCC_SE=ADC_0nX2dPNp4AQGuRl90P71wSdy8KW1bIaHu4wDtZoStfbGRKQnD6HHopBew%2fEad3Duospwi48CxmW4lM6ZTOvm65BjkO1yLofvtC5bC9KOue1ZkeGWjloOY8BaTpVLRJy%2buBjMgV1bEPt1uAjYwKHyH0mqFM2xYjE8zd%2bBTQOmnSBZhoeGqiCLxADdIzpOWjjYEB7khnoYHajyLQGBd11pDjaZCTAyYfjMWrP%2b5wmKv2a9J4GsLStaHJLwaHimQvTDQrzGW1Gqi7P71LzgnRrAPe9J63M8dLislCOfqLa2fhS%2fxIPUX6vkvaOn5Mg%2fgDBrCWjzSAdJ1sDfKp%2bnxuu7hhcNFUALu6kcg4o7YHMuNvqbhlgYpbRQO%2bGsIUrsylYVnCMXnX%2fwd9bP2%2bhEDA17%2bTxPHJ1BAYYJmMRu7MWkWALOkeQf7Dp73sOq1TN5MWdhn78NUMRJ1Jbfy1wkkYUPe0HpAPZDL6VTX9eSgJuZkyFMsRWXnMY63T9ijIPZ%2bdf6kmv8lQ4EiRg5HKhHYUW3Dw%3d%3d; shshshfp=33e7422185b3bfa1371bfb066f24d345; __jda=122270672.1562074689999533612174.1562074689.1562428244.1562432428.50; __jdv=122270672%7Ciosapp%7Ct_335139774%7Cappshare%7CWxfriends%7C1562434499559; wqmnx1=MDEyNjM2NHNtZG1lLm5hMDM5ZmE0ODdpLmNoZSAxNWxpLkhsZUMvMyBpMzNmZjI1VkVJVShS; __jdb=122270672.39.1562074689999533612174|50.1562432428; mba_sid=15624324285655023942327137272.31; thor=DC54E44B1BF82D40E54E29B371AFDE1B8394B823BF0CE6D18C805288EFF640E296DA410F79C4B52E012F12D1DCDBC4D24ADF893E200D1E4A62E2D0EB3715DC496A99A5B9F32F378B247122AA9FF0FD881CBEFB146E3A76A27CD33C7F7E98C231725F524AFE264597714604F92673FDED99DFA8EE18EACFC6ED556E7B956DA5EEAF9C00E2492C47686AB95C8203CEB54A; __wga=1562434501785.1562432429835.1562428245407.1562404847580.20.5; shshshsID=3ad2b867e1f6bae33421bd851394b7a1_20_1562434502055; 3AB9D23F7A4B3C9B=XBID5T3SVZBM2NLSJUKRBGLIEEJGTSCE54N77XXU5RKPKZJ5F3P6VSTOIJDCRSVIZWGLMFLX5FDY75T5WGRTMQKXXQ; qd_ad=iOS*url*1561263638513%7C-%7Cjrappshare%7Cwxfriends%7C10; qd_uid=JXRT5WH5-BH293T5Y9ST48GA85B3R; qd_fs=1562434505895; qd_ls=1562434505895; qd_ts=1562434505895; qd_sq=1; qd_sid=JXRT5WH5-BH293T5Y9ST48GA85B3R-1; __jrr=EFF8638185FE401C1DA33FE6F946F5",
        // Accept: '*/*',
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/application=JDJR-App&deviceId=7B4C588C-8371-4F85-B91D-F015D8C88E90&clientType=ios&iosType=iphone&clientVersion=5.2.32&HiClVersion=5.2.32&isUpdate=0&osVersion=12.3.1&osName=iOS&platform=iPhone 7 Plus (A1661/A1785/A1786)&screen=736*414&src=App Store&ip=2408:84ec:a012:4fe0:8e8:d4c0:79ca:649e&mac=02:00:00:00:00:00&netWork=1&netWorkType=1&stockSDK=stocksdk-iphone_3.0.0&sPoint=MTAwMDUjSlJMaWZlQ2hhbm5lbFZpZXdDb250cm9sbGVyI3RhbmNodWFuZzQwMDFfSlJMaWZlQ2hhbm5lbFZpZXdDb250cm9sbGVyKihudWxsKSrkvJfnrbnmibbotKvlpKfotZst5YWo6YeP&jdPay=(*#@jdPaySDK*#@jdPayChannel=jdfinance&jdPayChannelVersion=5.2.32&jdPaySdkVersion=2.23.3.0&jdPayClientName=iOS*#@jdPaySDK*#@)"
        // Referer: 'https://m.jr.jd.com/btyingxiao/advertMoney/html/collar.html?iframeSrc=https%3A%2F%2Fccc-x.jd.com%2Fdsp%2Fnc%3Fext%3DaHR0cDovL3JlLm0uamQuY29tL2xpc3QvaXRlbS85NzU2LTMyODU5MTQ0NTEzLmh0bWw_cmVfZGNwPTQ0Z2Ntd3hGVm9rdWhQMFBDc1dBQ0VLZUFiVGFXYTNpanhYNnM0RW1USlY1RjJjWC1mMjNiMkJSMjduT1FWYWkyUlg5NDJvSWRKM0hYZ0pBaFFWYXBscklCQ0c3V29oQkgxamJFd3B4YXM4dCZ3aXRoX2twbD0w%26log%3DyJLB6LIpm9Fe_DYp8oLfiVanGvdXr1CfkU5Ikyj0aKL6d73M6kDEcVTFe4WOBnwC7dPK6vT9y2r_QQGNybqxVFg_8uIauPBm2Z5XRUyLXOdaNrwv6wIKAchuLsy9HRNOmJNs2Oo7Jm0hiq-Pb99EcHX60vNjPyLK9FPZ3e1qXLLlPI71wTijyrYDdVlHcg6lBX7gJ1iZXsY5NN2LDF4c2tXuCazR3sGiChZNxeUTJ6SD2DWc7_uic19ZqHK-gwNL6FesLoTdiX2b0-OBz_F_FAG9c0U3zojLJtlgG_GOwzr6boMfas-od2IcuvG4p9EXzcX5XbgGX5dYtMZcijsNhYG4GOHeRVAzOhgHF-1v9E5NU0RVHDTPueTTkE0HjagEwnGtpxz-2ojaowC6NgKzLbRus02yanoIbKhk3hXtlNCk9MDirVWKwJ_wSaABvsQ-P09G-tr6u8o_N6lEKsI8Kg%26v%3D404%26with_kpl%3D0&adId=764868357&bussource=',
        // 'Accept-Language': 'en-us'
    },
    transform(body) {
        if (typeof body === "string") {
            body = JSON.parse(body);
        }
        var { resultCode, resultMsg, resultData } = body;
        if (resultCode !== 0) {
            throw new Error(resultMsg);
        }
        return resultData;
    }
});
function getFormData(data) {
    return {
        reqData: JSON.stringify(data)
    };
}
function getJsonpData(body) {
    return JSON.parse(body.replace(/[\w$]+\((.*)\)/, "$1"));
}
/**
 * 查询汇总信息
 */
function querySignBusiness() {
    return req.post("https://ms.jr.jd.com/gw/generic/hy/h5/m/querySignBusinessH5", {
        qs: {
            _: Date.now()
        },
        form: getFormData({ channelSource: "JRAPP" })
    });
}
exports.querySignBusiness = querySignBusiness;
/**
 * 获取签到信息
 */
function getSignInfo() {
    return req.post("https://ms.jr.jd.com/gw/generic/hy/h5/m/querySignHistory", {
        qs: {
            _: Date.now()
        },
        form: getFormData({ channelSource: "JRAPP" })
    });
}
exports.getSignInfo = getSignInfo;
/**
 * 签到
 */
function signIn() {
    return req.post(`https://ms.jr.jd.com/gw/generic/hy/h5/m/signIn`, {
        qs: {
            _: Date.now()
        },
        form: getFormData({ channelSource: "JRAPP" })
    });
}
exports.signIn = signIn;
/**
 * 点击商品领取金豆
 */
function getGoodsJindou() {
    return req.post("https://ms.jr.jd.com/gw/generic/jrm/h5/m/sendAdGb", {
        form: getFormData({
            clientType: "ios",
            actKey: "176696",
            userDeviceInfo: { adId: 764868357 + ((Math.random() * 1000) >> 0) },
            deviceInfoParam: {
                macAddress: "02:00:00:00:00:00",
                channelInfo: "appstore",
                IPAddress1: "2408:84ec:a012:4fe0:8e8:d4c0:79ca:649e",
                OpenUDID: "9d6039ba9a88469d7733658d45e3dae4df03af46",
                clientVersion: "5.2.32",
                terminalType: "02",
                osVersion: "12.3.1",
                appId: "com.jd.jinrong",
                deviceType: "iPhone9,2",
                networkType: "WIFI",
                startNo: 100,
                UUID: "",
                IPAddress: "",
                deviceId: "7B4C588C-8371-4F85-B91D-F015D8C88E90",
                IDFA: "3D52573B-D546-4427-BC41-19BE6C9CE864",
                resolution: "1242*2208",
                osPlatform: "iOS"
            },
            bussource: ""
        })
    });
}
exports.getGoodsJindou = getGoodsJindou;
function getSignJRInfo() {
    return req.post("https://ms.jr.jd.com/gw/generic/jrm/h5/m/signInit", {
        qs: {
            _: Date.now()
        },
        form: getFormData({ source: "JR" })
    });
}
exports.getSignJRInfo = getSignJRInfo;
/**
 * 领取双签奖励
 */
function getSignAwardJR() {
    return req.post(`https://ms.jr.jd.com/gw/generic/jrm/h5/m/getSignAwardJR`, {
        qs: {
            _: Date.now()
        },
        form: getFormData({
            riskDeviceParam: JSON.stringify({
                deviceType: "iPhone+7+Plus+(A1661/A1785/A1786)",
                traceIp: "",
                macAddress: "02:00:00:00:00:00",
                imei: "7B4C588C-8371-4F85-B91D-F015D8C88E90",
                os: "iOS",
                osVersion: "12.3.1",
                fp: "919ea8df8ed0351b1f931857fa9000cd",
                ip: "172.16.90.74",
                eid: "ZXHJWSWBJENX73DQAH7BW3RFGBNXZFMPJG6FFUDG3F26WRTNTZLAEVZEAERLMWPHRZGFKKG5YCL5XRQYJ7WB6F3NKE",
                appId: "com.jd.jinrong",
                openUUID: "9d6039ba9a88469d7733658d45e3dae4df03af46",
                uuid: "",
                clientVersion: "5.2.32",
                resolution: "736*414",
                channelInfo: "appstore",
                networkType: "WIFI",
                startNo: 105,
                openid: "",
                token: "",
                sid: "",
                terminalType: "02",
                longtitude: "",
                latitude: "",
                securityData: "",
                jscContent: "",
                fnHttpHead: "",
                receiveRequestTime: "",
                port: "",
                appType: 1,
                optType: "",
                idfv: "",
                wifiSSID: "",
                wifiMacAddress: "",
                cellIpAddress: "",
                wifiIpAddress: "",
                sdkToken: ""
            })
        })
    });
}
exports.getSignAwardJR = getSignAwardJR;
/**
 * 获取金果详情
 */
function getJinguoInfo() {
    return req
        .post(`https://ms.jr.jd.com/gw/generic/uc/h5/m/login`, {
        qs: {
            _: Date.now()
        },
        form: getFormData({
            shareType: 1,
            source: 2,
            riskDeviceParam: JSON.stringify({
                deviceType: "iPhone+7+Plus+(A1661/A1785/A1786)",
                traceIp: "",
                macAddress: "02:00:00:00:00:00",
                imei: "7B4C588C-8371-4F85-B91D-F015D8C88E90",
                os: "iOS",
                osVersion: "12.3.1",
                fp: "9d13e4394c1ec6f2c3456e5c5de3dc76",
                ip: "2408:84ec:a012:4fe0:8e8:d4c0:79ca:649e",
                eid: "ZXHJWSWBJENX73DQAH7BW3RFGBNXZFMPJG6FFUDG3F26WRTNTZLAEVZEAERLMWPHRZGFKKG5YCL5XRQYJ7WB6F3NKE",
                appId: "com.jd.jinrong",
                openUUID: "9d6039ba9a88469d7733658d45e3dae4df03af46",
                uuid: "",
                clientVersion: "5.2.32",
                resolution: "736*414",
                channelInfo: "appstore",
                networkType: "WIFI",
                startNo: 100,
                openid: "",
                token: "",
                sid: "",
                terminalType: "02",
                longtitude: "",
                latitude: "",
                securityData: "",
                jscContent: "",
                fnHttpHead: "",
                receiveRequestTime: "",
                port: "",
                appType: 1,
                optType: "",
                idfv: "",
                wifiSSID: "",
                wifiMacAddress: "",
                cellIpAddress: "",
                wifiIpAddress: "",
                sdkToken: ""
            })
        })
    })
        .then(({ data }) => data);
}
exports.getJinguoInfo = getJinguoInfo;
/**
 * 收获金果
 */
function harvestJinguo() {
    return req
        .post(`https://ms.jr.jd.com/gw/generic/uc/h5/m/harvest`, {
        qs: {
            _: Date.now()
        },
        form: getFormData({ source: 2, sharePin: null })
    })
        .then(({ data }) => data);
}
exports.harvestJinguo = harvestJinguo;
/**
 * 金果签到
 * @param workType
 * @param opType 1:执行前置操作 2:领取奖励
 */
function signJinguo(workType, opType) {
    return () => {
        return req
            .post(`https://ms.jr.jd.com/gw/generic/uc/h5/m/doWork`, {
            qs: {
                _: Date.now()
            },
            form: getFormData({ source: 2, workType, opType })
        })
            .then(({ data }) => data);
    };
}
exports.signJinguo = signJinguo;
function getJinguoDayWork() {
    return req
        .post(`https://ms.jr.jd.com/gw/generic/uc/h5/m/dayWork`, {
        qs: {
            _: Date.now()
        }
    })
        .then(({ data }) => data);
}
exports.getJinguoDayWork = getJinguoDayWork;
async function getFanpaiInfo() {
    var body = await req.post("https://gpm.jd.com/signin_new/home", {
        qs: {
            sid: "47a4f6f4335b498f4a462e2d5e5d9f8w",
            uaType: "2",
            _: Date.now(),
            callback: "Zepto1561530641091"
        },
        gzip: true,
        transform: R.identity
    });
    return getJsonpData(body)[0];
}
exports.getFanpaiInfo = getFanpaiInfo;
async function fanpai() {
    var body = await req.get("https://gpm.jd.com/signin_new/choice", {
        qs: {
            sid: "47a4f6f4335b498f4a462e2d5e5d9f8w",
            uaType: "2",
            position: "1",
            _: Date.now(),
            callback: "Zepto1561531571875"
        },
        transform: R.identity,
        gzip: true
    });
    return getJsonpData(body)[0];
}
exports.fanpai = fanpai;
async function getWelfareList() {
    var body = await req.post(`https://v-z.jd.com/welfare/act/getActList.action`, {
        qs: { bizLine: 2, rewardType: 4 },
        form: {
            callback: "$"
        },
        gzip: true,
        transform: R.identity
    });
    return getJsonpData(body);
}
exports.getWelfareList = getWelfareList;
function doWelfareAction(actType) {
    return async () => {
        var body = await req.get("https://v-z.jd.com/welfare/reward.action", {
            qs: {
                actType,
                bizLine: "2",
                extRule: 121612 + ((Math.random() * 1000) >>> 0),
                callback: "callbackName1561533551104"
            },
            gzip: true,
            transform: R.identity
        });
        return getJsonpData(body);
    };
}
exports.doWelfareAction = doWelfareAction;
function getLotteryInfo() {
    return req.get(`https://ms.jr.jd.com/gw/generic/hy/h5/m/lotteryInfo`, {
        qs: getFormData({ actKey: "AbeQry", t: Date.now() })
    });
}
exports.getLotteryInfo = getLotteryInfo;
function getLottery() {
    return req.get(`https://ms.jr.jd.com/gw/generic/hy/h5/m/lottery`, {
        qs: getFormData({ actKey: "AbeQry", t: Date.now() })
    });
}
exports.getLottery = getLottery;
function getHealthInsuredInfo() {
    return req.post("https://ms.jr.jd.com/gw/generic/bx/h5/m/queryHealthOrder", {
        form: getFormData({
            channel: "JRAPP",
            resourcePlace: "teqiandao",
            systemId: "h5.baoxian.health.front",
            productCode: ""
        })
    });
}
exports.getHealthInsuredInfo = getHealthInsuredInfo;
function getHealthInsured() {
    return req.post(`https://ms.jr.jd.com/gw/generic/bx/h5/m/receiveHealthInsured`, {
        form: getFormData({
            insuredStatus: "2",
            realName: true,
            channel: "JRAPP",
            resourcePlace: "teqiandao",
            systemId: "h5.baoxian.health.front",
            productCode: "21000023"
        })
    });
}
exports.getHealthInsured = getHealthInsured;
// ---------------金融会员开礼盒----------------
function getGiftInfo() {
    return req.get("https://ms.jr.jd.com/gw/generic/hy/h5/m/queryGiftInfo", {
        qs: Object.assign({
            timestamp: Date.now()
        }, getFormData({ shareId: "" }))
    });
}
exports.getGiftInfo = getGiftInfo;
function getGift() {
    return req.get("https://ms.jr.jd.com/gw/generic/hy/h5/m/openGift", {
        qs: Object.assign({
            timestamp: Date.now()
        }, getFormData({ shareId: "" }))
    });
}
exports.getGift = getGift;
