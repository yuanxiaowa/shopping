"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("../utils/tools");
var req;
var eid = "";
var fp = "";
var cookie = "";
function setReq(_req, _cookie) {
    cookie = _cookie;
    eid = getCookie("3AB9D23F7A4B3C9B");
    fp = "0a2d744505998993736ee93c5880c826";
    req = _req;
}
exports.setReq = setReq;
async function getGoodsInfo(skuId) {
    var ret = await req.get(`https://item.m.jd.com/product/${skuId}.html`);
    return JSON.parse(/window\._itemInfo\s*=\s*\(([\s\S]*?})\);/.exec(ret)[1]);
}
exports.getGoodsInfo = getGoodsInfo;
async function queryGoodsCoupon(data) {
    var text = await req.post(`https://wq.jd.com/mjgj/fans/queryusegetcoupon`, {
        qs: {
            callback: "getCouponListCBA",
            platform: 3,
            cid: data.cid,
            sku: data.skuId,
            popId: data.vid,
            t: Math.random(),
            // g_tk: time33(getCookie("wq_skey")),
            g_ty: "ls"
        }
    });
    var { coupons } = tools_1.extractJsonpData(text, "getCouponListCBA");
    return coupons;
}
exports.queryGoodsCoupon = queryGoodsCoupon;
async function obtainGoodsCoupon(data) {
    var text = await req.get(`https://wq.jd.com/activeapi/obtainjdshopfreecouponv2`, {
        qs: {
            sceneval: "2",
            callback: "ObtainJdShopFreeCouponCallBackA",
            scene: "2",
            key: data.key,
            roleid: data.roleId,
            t: Math.random(),
            // g_tk: time33(getCookie("wq_skey")),
            g_ty: "ls"
        },
        headers: {
            Referer: "https://item.m.jd.com/product/36850022644.html"
        }
    });
    return tools_1.extractJsonpData(text, "ObtainJdShopFreeCouponCallBackA");
}
exports.obtainGoodsCoupon = obtainGoodsCoupon;
/**
 * 查询楼层优惠券
 * @param url
 * @example https://wqs.jd.com/event/promote/game11/index.shtml?cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=3f8d9f58aed14a30a581d169f573ced2
 * @example https://wqs.jd.com/event/promote/zdm18/index.shtml?cu=true&sid=b3234f60d61e8b4e3b5a8e703c321b0w&un_area=19_1601_50258_50374&_ts=1557200825024&ad_od=share&scpos=#st=6455&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=c842a3cb81d948899b818c0602bd9b8d
 */
async function queryFloorCoupons(url) {
    let html = await req.get(url);
    let text = /window\._componentConfig=(.*);/.exec(html)[1];
    let items = JSON.parse(text);
    let coupon_items = items.filter(({ name }) => name === "coupon");
    // 校验状态，暂时不需要
    // https://wq.jd.com/active/querybingo?callback=cb_quan_daogou06A&active=daogou06&g_tk=1461522350&g_ty=ls
    // Referer: https://wqs.jd.com/event/promote/game11/index.shtml
    let now = Date.now();
    return coupon_items.map(({ data: { list } }) => list.filter(({ begin, end }) => now >= new Date(begin).getTime() && now < new Date(end).getTime()));
}
exports.queryFloorCoupons = queryFloorCoupons;
async function obtainFloorCoupon(data) {
    /* let g_pt_tk: any = getCookie("pt_key") || undefined;
    if (g_pt_tk) {
      g_pt_tk = time33(g_pt_tk);
    } */
    var ret = await req.get("https://wq.jd.com/active/active_draw", {
        qs: {
            active: data.key,
            level: data.level,
            _: Date.now(),
            g_login_type: "0",
            callback: "jsonpCBKE",
            // g_tk: time33(getCookie("wq_skey")),
            // g_pt_tk,
            g_ty: "ls"
        },
        headers: {
            Referer: "https://wqs.jd.com/event/promote/mobile8/index.shtml"
        }
    });
    /* try{ jsonpCBKA(
  {
     "active" : "daogou06",
     "award" : {
        "awardcode" : "",
        "awardmsg" : "",
        "awardret" : 2
     },
     "bingo" : {
        "bingolevel" : 0,
        "bingomsg" : "",
        "bingoret" : 2
     },
     "ret" : 2,
     "retmsg" : "未登录"
  }
  );}catch(e){} */
    return ret;
}
exports.obtainFloorCoupon = obtainFloorCoupon;
/**
 * 查询活动主题优惠券
 * @param url
 * @example https://pro.m.jd.com/mall/active/4FziapEprFVTPwjVx19WRDMTbbbF/index.html?utm_source=pdappwakeupup_20170001&utm_user=plusmember&ad_od=share&utm_source=androidapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL
 */
async function queryActivityCoupons(url) {
    let html = await req.get(url);
    let text = /window.dataHub\d+=(.*);/.exec(html)[1];
    let data = JSON.parse(text);
    let ret = Object.keys(data)
        .filter(key => data[key].couponList)
        .map(key => data[key].couponList);
    return ret;
}
exports.queryActivityCoupons = queryActivityCoupons;
async function obtainActivityCoupon(data) {
    var ret = await req.post(`https://api.m.jd.com/client.action?functionId=newBabelAwardCollection`, {
        form: {
            body: JSON.stringify({
                activityId: data.activityId,
                from: "H5node",
                scene: data.scene,
                args: data.args,
                platform: "3",
                orgType: "2",
                openId: "-1",
                pageClickKey: "Babel_Coupon",
                eid,
                fp,
                shshshfp: getCookie("shshshfp"),
                shshshfpa: getCookie("shshshfpa"),
                shshshfpb: getCookie("shshshfpb"),
                childActivityUrl: data.childActivityUrl,
                mitemAddrId: "",
                geo: { lng: "", lat: "" },
                addressId: "",
                posLng: "",
                posLat: "",
                focus: "",
                innerAnchor: ""
            }),
            client: "wh5",
            clientVersion: "1.0.0",
            sid: "",
            uuid: "15617018266251592388825",
            area: ""
        }
    });
    return ret;
}
exports.obtainActivityCoupon = obtainActivityCoupon;
/**
 * 领取全品券
 * @param url
 * @param phone
 * @example https://h5.m.jd.com/dev/2tvoNZVsTZ9R1aF1T4fDthhd6bm1/index.html?type=out_station&id=f128d673441d4afa9fa52b2f61818591&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=d88e8a25670040f38f3d0dfc8f9542b9
 */
async function getQuanpinCoupon(url, phone = "18605126843") {
    await req.get("https://api.m.jd.com/", {
        qs: {
            client: "nc",
            clientVersion: "1.0.0",
            agent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.90 Safari/537.36",
            lang: "zh_CN",
            networkType: "4g",
            eid,
            fp,
            functionId: "activityLongPage",
            body: JSON.stringify({
                actId: /id=(\w+)/.exec(url)[1],
                phone,
                code: "",
                country: "cn",
                platform: "3",
                pageClickKey: "-1",
                eid,
                fp,
                userArea: ""
            }),
            jsonp: "jQuery191006758729777738859_1561716359085",
            _: Date.now()
        }
    });
}
exports.getQuanpinCoupon = getQuanpinCoupon;
function time33(str) {
    for (var i = 0, len = str.length, hash = 5381; i < len; ++i) {
        hash += (hash << 5) + str.charAt(i).charCodeAt(0);
    }
    return hash & 0x7fffffff;
}
function getCookie(name) {
    var reg = new RegExp("(^| )" + name + "(?:=([^;]*))?(;|$)"), val = cookie.match(reg);
    if (!val || !val[2]) {
        return "";
    }
    var res = val[2];
    try {
        if (/(%[0-9A-F]{2}){2,}/.test(res)) {
            return decodeURIComponent(res);
        }
        else {
            return unescape(res);
        }
    }
    catch (e) {
        return unescape(res);
    }
}
async function getCartInfo() {
    var html = await req.get("https://p.m.jd.com/cart/cart.action?sceneval=2");
    var text = /window.cartData =([\s\S]*)if \(window._MCart\) {/.exec(html)[1];
    var data = JSON.parse(text);
    return data;
}
exports.getCartInfo = getCartInfo;
async function toggleCartChecked(data, checked = true) {
    var qs = {
        templete: "1",
        version: "20190418",
        sceneval: "2",
        // mainSku.id,,1,mainSku.id,11,itemid,0
        commlist: data.items
            .map(([sid, itemId, polyType]) => `${sid},,1,${sid},${Number(polyType).toString(2)},${itemId},0`)
            .join("$"),
        callback: "checkCmdyCbA",
        type: "0",
        all: "0",
        reg: "1",
        traceid: data.traceId,
        locationid: data.areaId,
        t: Math.random()
    };
    console.log(qs);
    var text = await req.get(`https://wqdeal.jd.com/deal/mshopcart/${checked ? "checkcmdy" : "uncheckcmdy"}`, {
        qs,
        headers: {
            Referer: "https://p.m.jd.com/cart/cart.action?sceneval=2"
        }
    });
    return JSON.parse(text.replace(/\w+\(([\s\S]+)\)/, "$1"));
}
exports.toggleCartChecked = toggleCartChecked;
async function submitOrder() {
    var html = await req.get("https://p.m.jd.com/norder/order.action");
    var text = /window.dealData =([\s\S]*?)<\/script>/.exec(html)[1];
    var dealData = eval(`(${text})`);
    var { token2, order, traceId } = dealData;
    var valuableskus = (() => {
        var ret = [];
        order.venderCart.forEach(({ mfsuits }) => {
            mfsuits.forEach(({ products }) => {
                products.forEach(({ mainSku }) => {
                    var u;
                    if (mainSku.cid.includes("_")) {
                        u = mainSku.cid.split("_")[2];
                    }
                    if (!u) {
                        u = mainSku.cid;
                    }
                    ret.push([
                        mainSku.id,
                        mainSku.num,
                        parseInt(mainSku.promotion.price) -
                            parseInt(mainSku.promotion.discount),
                        u
                    ].join(","));
                });
            });
        });
        return ret.join("|");
    })();
    var ship = (() => {
        return order.venderCart
            .map((vender) => {
            var o = new Array(14).fill("");
            o[0] = vender.shipment[0].type;
            o[1] = vender.shipment[0].id;
            o[2] = vender.venderId;
            o[13] = 0;
            return o.join("|");
        })
            .join("$");
    })();
    var qs = {
        paytype: "0",
        paychannel: "1",
        action: "0",
        reg: 1,
        type: "0",
        token2,
        dpid: "",
        skulist: dealData.skulist,
        scan_orig: "",
        gpolicy: "",
        platprice: order.usePcPrice,
        ship,
        // '2|67|675918|||||||||||0$5|68|749057|2019-7-8|09:00-21:00|{"1":2,"35":4,"161":0,"30":2}|1|||||||0$2|67|10072685|||||||||||0',
        pick: "",
        savepayship: "0",
        callback: "cbConfirmA",
        uuid: getCookie("mba_muid"),
        validatecode: "",
        valuableskus,
        r: Math.random(),
        sceneval: "2",
        rtk: "b0683b27fb2f9f98629907f6ba04c4db",
        traceid: traceId,
        g_tk: time33(getCookie("wq_skey")),
        g_ty: "ls" // 1
    };
    var ret = await req.post("https://wqdeal.jd.com/deal/msubmit/confirm", {
        qs,
        headers: {
            Referer: "https://p.m.jd.com/norder/order.action"
        }
    });
}
exports.submitOrder = submitOrder;
async function getShopJindou() {
    var text = await req.post("https://bean.jd.com/myJingBean/getPopSign", {
        headers: {
            cookie
        }
    });
    var { data } = JSON.parse(text);
    data.forEach(async ({ shopUrl, signed }) => {
        if (!signed) {
            let id;
            if (/mall\.jd\.com\/index-(\w+)/.test(shopUrl)) {
                id = RegExp.$1;
            }
            else {
                let html = await req.get(shopUrl);
                id = /var shopId = "(\d+)"/.exec(html)[1];
            }
            await req.get(`https://mall.jd.com/shopSign-${id}.html`);
        }
    });
}
exports.getShopJindou = getShopJindou;
