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
        Cookie: "pt_key=app_openAAJdEkHxADAmTs-nFpE928PsO47v_D5BeFIU2F4o0r8FWHbSFm08-lVFt5wttHGffLsfzZT2wTE; pt_pin=yuanxiaowa_m; pwdt_id=yuanxiaowa_m; sid=47a4f6f4335b498f4a462e2d5e5d9f8w; __jda=168871293.1557764020721597043068.1557764021.1561478052.1561508545.179; __jdv=168871293%7Ckong%7Ct_1000603438_%7Ctuiguang%7Cc09169963033406c9b80452bdfc7b2c2%7C1561508545505; mba_muid=1557764020721597043068; _mkjdcn=fd8d899a70c1070cf3b8e4b0532cb2ff; _mkjdcnsl=001; unpl=V2_ZzNtbRBWSxVyAE5TeRheB2ICFQ9KBEoUcAxFBy5ODgM0AEBeclRCFX0UR1NnGlsUZgoZXkFcQBBFCEdkexhdBGACEFhAXnMlRQtGZHopXAFjBRRaR1ZAFHMLRlBzH10AZQIVVHJnRBV8OHaC05WLqffXtuqW%2bfwldQtAUnwcWARnCiJccldKF3MAQ1x6Hl81LG0TEEJTRxNzD0NVeBhaBmcHGltDUkEUcgF2VUsa; qd_fs=1560773554496; qd_ls=1561391938451; qd_sq=26; qd_ts=1561477617274; qd_uid=JX0CASDN-IFCFKZAZISPAY7IPAANM; 3AB9D23F7A4B3C9B=ZXHJWSWBJENX73DQAH7BW3RFGBNXZFMPJG6FFUDG3F26WRTNTZLAEVZEAERLMWPHRZGFKKG5YCL5XRQYJ7WB6F3NKE; __jdu=1557764020721597043068; mt_xid=V2_52007VwMWVlteVV8eShhaBmcHGlRcXVBbGEApXgxnUUBVXFtOXhxBTUAAZQRCTlRaVlwDGxpVUDQDRgVZXAUIL0oYXA17AhVOXlxDWR1CHVkOZgsiUG1aYlkeTxFZAFcGElZf; __from=0; __show_tab=0; qd_ad=stock-sr.jd.com%7Ct_1000550368_%7Ctuiguang%7C6401a044f2054fc1bc81e8778415704d%7C10; _jrda=16; shshshfpb=m8WE%201VKX0Or7E4I3aBvbsQ%3D%3D; shshshfp=7e5e7ae92a65b3d078ed54a2c260ddd8; sk_history=37294065093%2C10026059799%2C1580955%2C231415%2C33258879686%2C33259162148%2C1753876811%2C18238296370%2C32771981785%2C41634409625%2C46373343651%2C; __wga=1560773579734.1560773569623.1560357192664.1557764625554.2.8; cid=10; retina=1; wq_logid=1560773579.2030954301; wqmnx1=MDEyNjM5NToucjIuNDhpKENlX2FBaTEsY2wvaUFlODQtOG5zPWxpMnMzdHIzZXRvc0E4biZTMS4yMGVucGtrbnNBcE1QZEBubmFWLmFpM0NlZEBtNllVNFdTSCk%3D; wxa_level=1; promotejs=2b487cbe88478e9842863debc0beb783112; buy_uin=15475729444; jdpin=yuanxiaowa_m; pin=yuanxiaowa_m; wq_skey=zmBCF90D9A530B14356EBB3018EBAD7B32EFC7B2B3BF38253A4A9F1F24707EE6AB28037E9F17F085E51E9EC0E5724EDAB455EE64DFE7117C79228C6B3491352DEB6F142EC196F44A71E4FC0DBE7378190F; wq_uin=15475729444; wq_area=12_904_0%7C2; sc_width=414; visitkey=69434676247894202; webp=0; shshshfpa=200a6c75-1d11-7edd-183a-ee2da878a5dc-1557764204; __jda=168871293.1557764020721597043068.1557764021.1557764021.1557764065.2; __jrr=B5A0081E3CEFAC3893ECA6F1385D50; uuid=wLfxYVnZKnEk91Jl62OhVkopE7ZgfrX1",
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
