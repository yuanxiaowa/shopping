"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
const fs_1 = require("fs");
const log = (p) => p.then(console.log);
const logs = (ps) => ps.forEach(log);
// log(getWelfareList().then(({ data: { welActList } }) => welActList));
// log(signIn());
// log(getGoodsInfo('100003525820').then(({ item }) => item));
// log(
//   queryActiveCoupons(
//     "https://pro.m.jd.com/mall/active/4FziapEprFVTPwjVx19WRDMTbbbF/index.html?utm_source=pdappwakeupup_20170001&utm_user=plusmember&ad_od=share&utm_source=androidapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL"
//   )
// );
// log(getCartInfo());
// log(
//   obtainActivityCoupon({
//     activityId: "4FziapEprFVTPwjVx19WRDMTbbbF",
//     args:
//       "key=29219DB9F70BEE4FB8885A365319E87F2BD725B531F875B71FE456DF242A1BBFB99045029C582F5330CFF3EA76683DEA_babel,roleId=C01CFF98780A5C2F6230990FC5B41CDA_babel",
//     scene: "1",
//     childActivityUrl:
//       "https%3A%2F%2Fpro.m.jd.com%2Fmall%2Factive%2F4FziapEprFVTPwjVx19WRDMTbbbF%2Findex.html%3Futm_source%3Dpdappwakeupup_20170001%26utm_user%3Dplusmember%26ad_od%3Dshare%26utm_source%3Dandroidapp%26utm_medium%3Dappshare%26utm_campaign%3Dt_335139774%26utm_term%3DCopyURL"
//   })
// );
// doAdJindou();
// log(doAdJindou());
var cookie = fs_1.readFileSync("taobao/cookie.txt", "utf8");
var ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36";
var headers = {
    Cookie: cookie,
    "User-Agent": ua,
    Referer: "https://uland.taobao.com/coupon/edetail?e=AT6wgpt%2FNyg8Clx5mXPEKr69i0zMxe4jWMvhSb44Edmw85BoRshFq6wBX0XfmyARkQxSGIV4OztoyNpUkNh%2FxTo8fdqvbLi0Wv9OAj9evKBNnqF6eT4r4edth9k8bqqSHKTgBzHkoM7XTQC0vfau6E%2F9Zk7cDx8UPY2GSU4OeGeLQYvlxhc7DpC%2FLp5MQgK2&traceId=0b83b93f15618668109515071e&union_lens=lensId:0b832c69_0c36_16ba684365e_e66b&xId=lUv9OQtZ7xaQLLauthhyH2uTzFHaG7lOlvachHQC0zwB9jOfwmj1Kb3VGpRSHZZP7KnBPBJH3CWmiAbVOigTbU&ut_sk=1.utdid_null_1561866811299.TaoPassword-Outside.taoketop&sp_tk=77+lbUg2RFlnaXZUYjDvv6U="
};
var url = "https://uland.taobao.com/coupon/edetail?e=AT6wgpt%2FNyg8Clx5mXPEKr69i0zMxe4jWMvhSb44Edmw85BoRshFq6wBX0XfmyARkQxSGIV4OztoyNpUkNh%2FxTo8fdqvbLi0Wv9OAj9evKBNnqF6eT4r4edth9k8bqqSHKTgBzHkoM7XTQC0vfau6E%2F9Zk7cDx8UPY2GSU4OeGeLQYvlxhc7DpC%2FLp5MQgK2&traceId=0b83b93f15618668109515071e&union_lens=lensId:0b832c69_0c36_16ba684365e_e66b&xId=lUv9OQtZ7xaQLLauthhyH2uTzFHaG7lOlvachHQC0zwB9jOfwmj1Kb3VGpRSHZZP7KnBPBJH3CWmiAbVOigTbU&ut_sk=1.utdid_null_1561866811299.TaoPassword-Outside.taoketop&sp_tk=77+lbUg2RFlnaXZUYjDvv6U=";
var url_obj = new URL(url);
var appKey = "12574478";
var qs_base = {
    jsv: "2.4.0",
    appKey,
    v: "1.0",
    type: "jsonp",
    dataType: "jsonp",
    callback: "mtopjsonp2"
};
function getSign(data, t) {
    var token = getCookie("_m_h5_tk");
    token = token && token.split("_")[0];
    var sign = h([token, t, appKey, data].join("&"));
    return sign;
}
function getCouponInfo() {
    var t = Date.now();
    var data = JSON.stringify({
        floorId: 13193,
        variableMap: JSON.stringify({
            e: url_obj.searchParams.get("e"),
            type: ""
        })
    });
    var sign = getSign(data, t);
    return request.get("https://h5api.m.taobao.com/h5/mtop.alimama.union.xt.en.api.entry/1.0/", {
        qs: Object.assign({
            t,
            api: "mtop.alimama.union.xt.en.api.entry",
            data,
            sign,
            timeout: "20000",
            AntiCreep: "true",
            AntiFlood: "true"
        }, qs_base),
        headers
    });
}
function getCoupon() {
    var t = Date.now();
    var data = JSON.stringify({
        variableMap: JSON.stringify({
            couponKey: "pBpSzk94Rj8EYV3zO%2FedTAX1WRz%2FXSEEro9wwDWrPl%2B6bWObfc7JKhk%2B%2FAHCsa496oB7Q0mfsyMPJ5yh1BLqb%2BtoCK4RJow0fcUexJYMu7zn4ZPwEKSBgKJ7%2BkHL3AEW",
            af: "1",
            pid: "mm_441610096_555100392_109014100361",
            st: "39",
            ulandSrc: "201_11f.8.31.197_968040_1561881668552",
            itemId: "40722181750",
            mteeAsac: "1A19322J4Z3PLXO583LRB6",
            mteeType: "sdk",
            mteeUa: "118#ZVWZz/ZBvlRaIZSE+e2V5ZZTZeghQZubZZ2f1sqTzHRzZPFZXfqbagCzRZDTNeJI/QT7W3nhzggzPgCu0oq4ze2ZZe+h0omPqE8uZYqTZeRzZgZ/VqwecHgzZZw6XHW4ZgASZsqTzeRzZZZuVfq4zH22ZZZhVHRVZZYTZsqTzeRzZA21Voq4ze4u2ZcTrZX/ZgxPupITG/q1Z2sD2VjrexFULxcEHLpDy4U/oO7aSeQZuYPAPQqZZyfizzZusyRZXGtCcftOy6BQlJRRZtcB9AEGUUjAyqX9hDol+OUKtHAzKJKWG57q23FDhk90x99LSk9xForQEpTL5VaUl4KnhKDVydQm5jm+puCjPDD78pz0gVJsugYCrqJFaMVklt75BXUaUN1LMs7EWDemnYoJ4HHRQvRc5PqOtq5CUiWATWqMIS6VXRNGOodNiGFSO7uiTviA2hOAY0GCmONCbO5Iw9AXUKdEnb98Z+SmLtdy/EjmiGGuHKrx6zUHwLwQdDwFzQCr106fnOF9ubo4UAxQ33qgi9d2KEGmehaEBvUMZdOEpzavtXvvxW0qPlXj29UKSzTHChCEsl49PZ/gejUeiDpBWs/54EG1uDKUqXFuL8uhUVd1np2l7XQiySSNCuH1vVmHgwts5LNHq7TcmccFn7+JRwXDnEm+4Tvn2ZUKctTNuZX8OL7k3njTvob9NrzGzkxj4221bYIb7xY3oASSUCdshC8/qEnkALDXzEKZRt0jttefO7Lmj2XLDKc5+HhhshSj8iVowYR/ayzMh8JSML+QSjVSaz+SiQg3BlmcZZYJky+08PYWIG2HKD9MS4qEGScYGVOLt2K+ss2cdFHijxGCso4BfhWpuffjyKOikumMk9mNojGRuzc59AsFuma0ZcVg7X9t7lzceLtk4SE3gjsHgiqGfrrwupPPHifr3v6v1ZK63kuQKXujwtY4od+O4VsIFhmPqbxDB90jHmz1cA0MT3Dlxz+ymuMq3OC88fa8G3vdU9WpLFwzK8T1NUV/7bhN8x54O2vQ7A8eGmjpN0qSp7/aipgtEFwWwuxMeBWDsfwgb7Hqmu+o4xIMjt5cYhKeb+u/0Sf8",
            umidToken: "T3E37462F37ECFD6EE0A2364F50FC1B5073E339570A610520F51CD55CBE"
        }),
        floorId: "13352"
    });
    return request.get("https://h5api.m.taobao.com/h5/mtop.alimama.union.xt.en.api.entry/1.0/", {
        qs: Object.assign({
            t,
            api: "mtop.alimama.union.xt.en.api.entry",
            data,
            sign: getSign(data, t),
            timeout: "20000",
            AntiCreep: "true",
            AntiFlood: "true"
        }, qs_base),
        headers
    });
}
function getUserInfo() {
    var data = JSON.stringify({ isSec: 0 });
    var t = Date.now();
    return request.get("https://h5api.m.taobao.com/h5/mtop.user.getusersimple/1.0/", {
        qs: Object.assign({
            H5Request: true,
            t,
            api: "mtop.user.getUserSimple",
            data,
            sign: getSign(data, t)
        }, qs_base),
        headers: {
            Cookie: cookie,
            "User-Agent": ua
        }
    });
}
// getCoupon().then(console.log);
async function getMobileCartInfo() {
    var t = Date.now();
    var data = JSON.stringify({
        isPage: true,
        extStatus: 0,
        netType: 0,
        exParams: JSON.stringify({
            mergeCombo: "true",
            version: "1.1.1",
            globalSell: "1",
            cartFrom: "taobao_client",
            spm: "a2141.7756461.toolbar.i0"
        }),
        cartFrom: "taobao_client",
        spm: "a2141.7756461.toolbar.i0"
    });
    var text = await request.get("https://h5api.m.taobao.com/h5/mtop.trade.query.bag/5.0/", {
        qs: {
            jsv: "2.5.1",
            appKey: "12574478",
            t,
            sign: getSign(data, t),
            api: "mtop.trade.query.bag",
            v: "5.0",
            type: "jsonp",
            ttid: "h5",
            isSec: "0",
            ecode: "1",
            AntiFlood: "true",
            AntiCreep: "true",
            H5Request: "true",
            dataType: "jsonp",
            callback: "mtopjsonp2",
            data
        },
        headers
    });
    console.log(text);
}
getMobileCartInfo();
function getCookie(name) {
    return new RegExp(`${name}=([^;]+)`).exec(cookie)[1];
}
function h(a) {
    function b(a, b) {
        return (a << b) | (a >>> (32 - b));
    }
    function c(a, b) {
        var c, d, e, f, g;
        return ((e = 2147483648 & a),
            (f = 2147483648 & b),
            (c = 1073741824 & a),
            (d = 1073741824 & b),
            (g = (1073741823 & a) + (1073741823 & b)),
            c & d
                ? 2147483648 ^ g ^ e ^ f
                : c | d
                    ? 1073741824 & g
                        ? 3221225472 ^ g ^ e ^ f
                        : 1073741824 ^ g ^ e ^ f
                    : g ^ e ^ f);
    }
    function d(a, b, c) {
        return (a & b) | (~a & c);
    }
    function e(a, b, c) {
        return (a & c) | (b & ~c);
    }
    function f(a, b, c) {
        return a ^ b ^ c;
    }
    function g(a, b, c) {
        return b ^ (a | ~c);
    }
    function h(a, e, f, g, h, i, j) {
        return (a = c(a, c(c(d(e, f, g), h), j))), c(b(a, i), e);
    }
    function i(a, d, f, g, h, i, j) {
        return (a = c(a, c(c(e(d, f, g), h), j))), c(b(a, i), d);
    }
    function j(a, d, e, g, h, i, j) {
        return (a = c(a, c(c(f(d, e, g), h), j))), c(b(a, i), d);
    }
    function k(a, d, e, f, h, i, j) {
        return (a = c(a, c(c(g(d, e, f), h), j))), c(b(a, i), d);
    }
    function l(a) {
        for (var b, c = a.length, d = c + 8, e = (d - (d % 64)) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i = 0; c > i;)
            (b = (i - (i % 4)) / 4),
                (h = (i % 4) * 8),
                (g[b] = g[b] | (a.charCodeAt(i) << h)),
                i++;
        return ((b = (i - (i % 4)) / 4),
            (h = (i % 4) * 8),
            (g[b] = g[b] | (128 << h)),
            (g[f - 2] = c << 3),
            (g[f - 1] = c >>> 29),
            g);
    }
    function m(a) {
        var b, c, d = "", e = "";
        for (c = 0; 3 >= c; c++)
            (b = (a >>> (8 * c)) & 255),
                (e = "0" + b.toString(16)),
                (d += e.substr(e.length - 2, 2));
        return d;
    }
    function n(a) {
        a = a.replace(/\r\n/g, "\n");
        for (var b = "", c = 0; c < a.length; c++) {
            var d = a.charCodeAt(c);
            128 > d
                ? (b += String.fromCharCode(d))
                : d > 127 && 2048 > d
                    ? ((b += String.fromCharCode((d >> 6) | 192)),
                        (b += String.fromCharCode((63 & d) | 128)))
                    : ((b += String.fromCharCode((d >> 12) | 224)),
                        (b += String.fromCharCode(((d >> 6) & 63) | 128)),
                        (b += String.fromCharCode((63 & d) | 128)));
        }
        return b;
    }
    var o, p, q, r, s, t, u, v, w, x = [], y = 7, z = 12, A = 17, B = 22, C = 5, D = 9, E = 14, F = 20, G = 4, H = 11, I = 16, J = 23, K = 6, L = 10, M = 15, N = 21;
    for (a = n(a),
        x = l(a),
        t = 1732584193,
        u = 4023233417,
        v = 2562383102,
        w = 271733878,
        o = 0; o < x.length; o += 16)
        (p = t),
            (q = u),
            (r = v),
            (s = w),
            (t = h(t, u, v, w, x[o + 0], y, 3614090360)),
            (w = h(w, t, u, v, x[o + 1], z, 3905402710)),
            (v = h(v, w, t, u, x[o + 2], A, 606105819)),
            (u = h(u, v, w, t, x[o + 3], B, 3250441966)),
            (t = h(t, u, v, w, x[o + 4], y, 4118548399)),
            (w = h(w, t, u, v, x[o + 5], z, 1200080426)),
            (v = h(v, w, t, u, x[o + 6], A, 2821735955)),
            (u = h(u, v, w, t, x[o + 7], B, 4249261313)),
            (t = h(t, u, v, w, x[o + 8], y, 1770035416)),
            (w = h(w, t, u, v, x[o + 9], z, 2336552879)),
            (v = h(v, w, t, u, x[o + 10], A, 4294925233)),
            (u = h(u, v, w, t, x[o + 11], B, 2304563134)),
            (t = h(t, u, v, w, x[o + 12], y, 1804603682)),
            (w = h(w, t, u, v, x[o + 13], z, 4254626195)),
            (v = h(v, w, t, u, x[o + 14], A, 2792965006)),
            (u = h(u, v, w, t, x[o + 15], B, 1236535329)),
            (t = i(t, u, v, w, x[o + 1], C, 4129170786)),
            (w = i(w, t, u, v, x[o + 6], D, 3225465664)),
            (v = i(v, w, t, u, x[o + 11], E, 643717713)),
            (u = i(u, v, w, t, x[o + 0], F, 3921069994)),
            (t = i(t, u, v, w, x[o + 5], C, 3593408605)),
            (w = i(w, t, u, v, x[o + 10], D, 38016083)),
            (v = i(v, w, t, u, x[o + 15], E, 3634488961)),
            (u = i(u, v, w, t, x[o + 4], F, 3889429448)),
            (t = i(t, u, v, w, x[o + 9], C, 568446438)),
            (w = i(w, t, u, v, x[o + 14], D, 3275163606)),
            (v = i(v, w, t, u, x[o + 3], E, 4107603335)),
            (u = i(u, v, w, t, x[o + 8], F, 1163531501)),
            (t = i(t, u, v, w, x[o + 13], C, 2850285829)),
            (w = i(w, t, u, v, x[o + 2], D, 4243563512)),
            (v = i(v, w, t, u, x[o + 7], E, 1735328473)),
            (u = i(u, v, w, t, x[o + 12], F, 2368359562)),
            (t = j(t, u, v, w, x[o + 5], G, 4294588738)),
            (w = j(w, t, u, v, x[o + 8], H, 2272392833)),
            (v = j(v, w, t, u, x[o + 11], I, 1839030562)),
            (u = j(u, v, w, t, x[o + 14], J, 4259657740)),
            (t = j(t, u, v, w, x[o + 1], G, 2763975236)),
            (w = j(w, t, u, v, x[o + 4], H, 1272893353)),
            (v = j(v, w, t, u, x[o + 7], I, 4139469664)),
            (u = j(u, v, w, t, x[o + 10], J, 3200236656)),
            (t = j(t, u, v, w, x[o + 13], G, 681279174)),
            (w = j(w, t, u, v, x[o + 0], H, 3936430074)),
            (v = j(v, w, t, u, x[o + 3], I, 3572445317)),
            (u = j(u, v, w, t, x[o + 6], J, 76029189)),
            (t = j(t, u, v, w, x[o + 9], G, 3654602809)),
            (w = j(w, t, u, v, x[o + 12], H, 3873151461)),
            (v = j(v, w, t, u, x[o + 15], I, 530742520)),
            (u = j(u, v, w, t, x[o + 2], J, 3299628645)),
            (t = k(t, u, v, w, x[o + 0], K, 4096336452)),
            (w = k(w, t, u, v, x[o + 7], L, 1126891415)),
            (v = k(v, w, t, u, x[o + 14], M, 2878612391)),
            (u = k(u, v, w, t, x[o + 5], N, 4237533241)),
            (t = k(t, u, v, w, x[o + 12], K, 1700485571)),
            (w = k(w, t, u, v, x[o + 3], L, 2399980690)),
            (v = k(v, w, t, u, x[o + 10], M, 4293915773)),
            (u = k(u, v, w, t, x[o + 1], N, 2240044497)),
            (t = k(t, u, v, w, x[o + 8], K, 1873313359)),
            (w = k(w, t, u, v, x[o + 15], L, 4264355552)),
            (v = k(v, w, t, u, x[o + 6], M, 2734768916)),
            (u = k(u, v, w, t, x[o + 13], N, 1309151649)),
            (t = k(t, u, v, w, x[o + 4], K, 4149444226)),
            (w = k(w, t, u, v, x[o + 11], L, 3174756917)),
            (v = k(v, w, t, u, x[o + 2], M, 718787259)),
            (u = k(u, v, w, t, x[o + 9], N, 3951481745)),
            (t = c(t, p)),
            (u = c(u, q)),
            (v = c(v, r)),
            (w = c(w, s));
    var O = m(t) + m(u) + m(v) + m(w);
    return O.toLowerCase();
}
