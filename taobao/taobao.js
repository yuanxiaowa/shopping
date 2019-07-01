"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_native_1 = __importDefault(require("request-promise-native"));
const tools_1 = require("../utils/tools");
var req = request_promise_native_1.default.defaults({
    headers: {
        "Accept-Encoding": "br, gzip, deflate",
        // Accept: '*/*',
        "User-Agent": "jdapp;iPhone;8.1.0;12.3.1;38276cc01428d153b8a9802e9787d279e0b5cc85;network/wifi;ADID/3D52573B-D546-4427-BC41-19BE6C9CE864;supportApplePay/3;hasUPPay/0;pushNoticeIsOpen/0;model/iPhone9,2;addressid/1091472708;hasOCPay/0;appBuild/166315;supportBestPay/0;pv/259.6;pap/JA2015_311210|8.1.0|IOS 12.3.1;apprpd/Home_Main;psn/38276cc01428d153b8a9802e9787d279e0b5cc85|1030;usc/pdappwakeupup_20170001;jdv/0|pdappwakeupup_20170001|t_335139774|appshare|CopyURL|1561092574799|1561092578;umd/appshare;psq/1;ucp/t_335139774;app_device/IOS;adk/;ref/JDMainPageViewController;utr/CopyURL;ads/;Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"
        // Referer: 'https://bean.m.jd.com/continuity/index',
        // 'Accept-Language': 'en-us'
    }
});
async function resolveTaokouling(text) {
    var data = await req.post("http://www.taokouling.com/index/taobao_tkljm", {
        form: {
            text
        },
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        },
        gzip: true
    });
    return JSON.parse(data).data.url;
}
async function getCartInfo() {
    var html = await req.get(`https://cart.taobao.com/cart.htm`, {
        qs: {
            spm: "a231o.7712113/g.1997525049.1.3e004608MXPqWt",
            prepvid: `200_11.21.9.212_38091_${Date.now()}`,
            extra: "",
            from: "mini",
            ad_id: "",
            am_id: "",
            cm_id: "",
            pm_id: "1501036000a02c5c3739",
            pid: "mm_121093092_20166288_69356911",
            clk1: "",
            unid: "",
            source_id: "",
            app_pvid: `200_11.21.9.212_38091_${Date.now()}`
        }
    });
    var text = /var firstData = (.*);}catch \(e\)/.exec(html)[1];
    var data = JSON.parse(text);
}
exports.getCartInfo = getCartInfo;
async function submitOrder(goods) {
    var cartIdStr = goods.map(({ cartId }) => cartId).join(",");
    var items = goods.map(({ cartId, itemId, skuId, amount, createTime, attr }) => ({
        cartId,
        itemId,
        skuId,
        quantity: amount.now,
        createTime,
        attr
    }));
    var html = await req.post("https://buy.tmall.com/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined", {
        form: {
            hex: "n",
            cartId: cartIdStr,
            sellerid: "2456060201,3409507848,4092509820",
            cart_param: JSON.stringify({
                items
            }),
            unbalance: "",
            delCartIds: cartIdStr,
            use_cod: false,
            buyer_from: "cart",
            page_from: "cart",
            source_time: Date.now()
        }
    });
    var text = /var orderData = (.*);/.exec(html)[1];
    var { data, linkage, hierarchy: { structure } } = JSON.parse(text);
    var url = /action="([^"]*)/.exec(html)[1].replace("&amp;", "&");
    var formData = [].reduce((state, name) => {
        state[name] = new RegExp(`name=['"]${name}['"].*? value=['"](.*?)['"]`).exec(html)[1];
        return state;
    }, {});
    var ua_log = "";
    await req.post(`https://buy.tmall.com${url}`, {
        qs: {
            spm: "a220l.1.a22016.d011001001001.undefined",
            submitref: data.confirmOrder_1.fields.secretValue,
            sparam1: data.confirmOrder_1.fields.sparam1
        },
        form: Object.assign({}, formData, { praper_alipay_cashier_domain: "cashierstl", hierarchy: JSON.stringify({
                structure
            }), data: Object.keys(data).reduce((state, name) => {
                var item = data[name];
                if (item.submit) {
                    if (item.tag === "submitOrder") {
                        if (item.fields) {
                            if (ua_log) {
                                item.fields.ua = ua_log;
                            }
                        }
                    }
                    state[name] = item;
                }
                return state;
            }, {}), linkage: JSON.stringify({
                common: linkage.common,
                signature: linkage.signature
            }) })
    });
}
exports.submitOrder = submitOrder;
function resolveUrl(text) {
    if (/https?:/.test(text)) {
        return text;
    }
    return resolveTaokouling(text);
}
tools_1.getPage({}).then(page => {
    async function qiangdan(text, num) {
        var url = await resolveUrl(text);
        await page.goto(url);
        url = page.url();
        if (url.startsWith("https://uland.taobao.com/coupon/edetail?")) {
            await page.click(".coupons-btn");
            await page.waitForNavigation();
        }
        url = page.url();
        if (url.startsWith("https://detail.tmall.com/item.htm")) {
            await page.evaluate(() => {
                Array.from(document.querySelectorAll(".J_TSaleProp")).forEach(ul => {
                    // @ts-ignore
                    var lis = Array.from(ul.children);
                    if (!lis.find(ele => ele.classList.contains("tb-selected"))) {
                        lis[0].querySelector("a").click();
                    }
                });
            });
            await page.type(".tb-text", String(num));
            // #J_LinkBasket 加入购物车
            await page.click("#J_LinkBuy");
            await page.waitForNavigation();
            await page.click("a.go-btn");
            return;
        }
        // 天猫超市和天猫差不多
        if (url.startsWith("https://chaoshi.detail.tmall.com/item.htm")) {
            await page.type(".tb-text", String(num));
            await page.click("#J_LinkBasket");
        }
        if (url.startsWith("https://detail.m.tmall.com/item.htm")) {
            await page.click(".skuText");
            await page.evaluate(() => {
                Array.from(document.querySelectorAll(".sku-list-wrap>li")).forEach(li => {
                    var links = Array.from(li.querySelectorAll("a"));
                    if (!links.find(link => link.classList.contains("checked"))) {
                        links[0].click();
                    }
                });
            });
            await page.type("#number", String(num));
            // .cart 加入购物车
            await page.click("a.buy");
            await page.waitForNavigation();
            await page.click(".action");
            return;
        }
        if (url.startsWith("https://item.taobao.com/item.htm")) {
            await page.evaluate(() => {
                Array.from(document.querySelectorAll(".J_TSaleProp")).forEach(ul => {
                    // @ts-ignore
                    var lis = Array.from(ul.children);
                    if (!lis.find(ele => ele.classList.contains("tb-selected"))) {
                        lis[0].querySelector("a").click();
                    }
                });
            });
            await page.type("#J_IptAmount", String(num));
            // a.J_LinkAdd 加入购物车
            await page.click("#J_LinkBuy");
            await page.waitForNavigation();
            await page.click("a.go-btn");
            return;
        }
        if (url.startsWith("https://h5.m.taobao.com/awp/core/detail.htm")) {
            await page.evaluate(() => {
                Array.from(document.querySelectorAll(".sku-info ul")).forEach(ul => {
                    // @ts-ignore
                    var lis = Array.from(ul.children);
                    if (!lis.find(ele => ele.classList.contains("sel"))) {
                        lis[0].click();
                    }
                });
            });
            await page.type(".btn-input input", String(num));
            // .addcart
            await page.click(".gobuy");
            await page.waitForNavigation();
            await page.click('div[aria-label="提交订单"]');
        }
    }
    async function checkCart(arr) {
        await page.goto("https://cart.taobao.com/cart.htm");
        // await page.waitForSelector("#J_Go");
        // @ts-ignore
        let firstData = await page.evaluate(() => window.firstData);
        var cartIds = [];
        var sellerids = [];
        var items = [];
        firstData.list.forEach((shop) => {
            shop.bundles[0].items.forEach((item) => {
                cartIds.push(item.cartId);
                sellerids.push(item.sellerid);
                items.push({
                    cartId: item.cartId,
                    itemId: item.itemId,
                    skuId: item.skuId,
                    quantity: item.amount.now,
                    createTime: item.createTime,
                    attr: item.attr
                });
            });
        });
        var data = {
            hex: "n",
            cartId: cartIds.reverse().join(","),
            sellerid: sellerids.join(","),
            cart_param: JSON.stringify({
                items: items.reverse()
            }),
            unbalance: "",
            delCartIds: cartIds.join(","),
            use_cod: false,
            buyer_from: "cart",
            page_from: "cart",
            source_time: Date.now()
        };
        await page.evaluate((data) => {
            var form = document.createElement("form");
            form.method = "post";
            form.action =
                "https://buy.tmall.com/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined";
            Object.keys(data).map(key => {
                var input = document.createElement("input");
                input.type = "hidden";
                input.value = data[key];
                form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
        }, data);
        await page.waitForNavigation();
        await page.click(".go-btn");
    }
    page.exposeFunction("qiangdan", async (text, num = 1, d) => {
        var t = d ? tools_1.diffToNow(d) : 0;
        setTimeout(() => qiangdan(text, num), t);
    });
    page.exposeFunction("checkCart", async (arr, d) => {
        var t = d ? tools_1.diffToNow(d) : 0;
        setTimeout(() => checkCart(arr), t);
    });
});
