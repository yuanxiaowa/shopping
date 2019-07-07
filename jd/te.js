var getTakId = function() {
    return null
}
  , getTakTag = function() {
    return null
};
!function() {
    try {
        !function() {
            "object" != typeof JSON && (JSON = {},
            function() {
                "use strict";
                var rx_one = /^[\],:{}\s]*$/, rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, rx_four = /(?:^|:|,)(?:\s*\[)+/g, rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta, rep;
                function f(t) {
                    return t < 10 ? "0" + t : t
                }
                function this_value() {
                    return this.valueOf()
                }
                function quote(t) {
                    return rx_escapable.lastIndex = 0,
                    rx_escapable.test(t) ? '"' + t.replace(rx_escapable, function(t) {
                        var n = meta[t];
                        return "string" == typeof n ? n : "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4)
                    }) + '"' : '"' + t + '"'
                }
                function str(t, n) {
                    var r, i, e, o, u, c = gap, f = n[t];
                    switch (f && "object" == typeof f && "function" == typeof f.toJSON && (f = f.toJSON(t)),
                    "function" == typeof rep && (f = rep.call(n, t, f)),
                    typeof f) {
                    case "string":
                        return quote(f);
                    case "number":
                        return isFinite(f) ? String(f) : "null";
                    case "boolean":
                    case "null":
                        return String(f);
                    case "object":
                        if (!f)
                            return "null";
                        if (gap += indent,
                        u = [],
                        "[object Array]" === Object.prototype.toString.apply(f)) {
                            for (o = f.length,
                            r = 0; r < o; r += 1)
                                u[r] = str(r, f) || "null";
                            return e = 0 === u.length ? "[]" : gap ? "[\n" + gap + u.join(",\n" + gap) + "\n" + c + "]" : "[" + u.join(",") + "]",
                            gap = c,
                            e
                        }
                        if (rep && "object" == typeof rep)
                            for (o = rep.length,
                            r = 0; r < o; r += 1)
                                "string" == typeof rep[r] && (e = str(i = rep[r], f)) && u.push(quote(i) + (gap ? ": " : ":") + e);
                        else
                            for (i in f)
                                Object.prototype.hasOwnProperty.call(f, i) && (e = str(i, f)) && u.push(quote(i) + (gap ? ": " : ":") + e);
                        return e = 0 === u.length ? "{}" : gap ? "{\n" + gap + u.join(",\n" + gap) + "\n" + c + "}" : "{" + u.join(",") + "}",
                        gap = c,
                        e
                    }
                }
                "function" != typeof Date.prototype.toJSON && (Date.prototype.toJSON = function() {
                    return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
                }
                ,
                Boolean.prototype.toJSON = this_value,
                Number.prototype.toJSON = this_value,
                String.prototype.toJSON = this_value),
                "function" != typeof JSON.stringify && (meta = {
                    "\b": "\\b",
                    "\t": "\\t",
                    "\n": "\\n",
                    "\f": "\\f",
                    "\r": "\\r",
                    '"': '\\"',
                    "\\": "\\\\"
                },
                JSON.stringify = function(t, n, r) {
                    var i;
                    if (gap = "",
                    indent = "",
                    "number" == typeof r)
                        for (i = 0; i < r; i += 1)
                            indent += " ";
                    else
                        "string" == typeof r && (indent = r);
                    if (rep = n,
                    n && "function" != typeof n && ("object" != typeof n || "number" != typeof n.length))
                        throw new Error("JSON.stringify");
                    return str("", {
                        "": t
                    })
                }
                ),
                "function" != typeof JSON.parse && (JSON.parse = function(text, reviver) {
                    var j;
                    function walk(t, n) {
                        var r, i, e = t[n];
                        if (e && "object" == typeof e)
                            for (r in e)
                                Object.prototype.hasOwnProperty.call(e, r) && (void 0 !== (i = walk(e, r)) ? e[r] = i : delete e[r]);
                        return reviver.call(t, n, e)
                    }
                    if (text = String(text),
                    rx_dangerous.lastIndex = 0,
                    rx_dangerous.test(text) && (text = text.replace(rx_dangerous, function(t) {
                        return "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4)
                    })),
                    rx_one.test(text.replace(rx_two, "@").replace(rx_three, "]").replace(rx_four, "")))
                        return j = eval("(" + text + ")"),
                        "function" == typeof reviver ? walk({
                            "": j
                        }, "") : j;
                    throw new SyntaxError("JSON.parse")
                }
                )
            }())
        }(),
        Function.prototype.bind || (Function.prototype.bind = function(t) {
            if ("function" != typeof this)
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            var n = Array.prototype.slice.call(arguments, 1)
              , r = this
              , i = function() {}
              , e = function() {
                return r.apply(this.prototype && this instanceof i && t ? this : t, n.concat(Array.prototype.slice.call(arguments)))
            };
            return i.prototype = this.prototype,
            e.prototype = new i(),
            e
        }
        ),
        function() {
            var t = JSON.stringify
              , n = JSON.parse
              , r = navigator.userAgent
              , i = window.screen.height
              , e = window.screen.width
              , o = window.screen.colorDepth
              , u = Math.sqrt
              , c = Math.pow
              , f = Math.abs
              , a = Math.random
              , s = Math.floor
              , h = document.URL
              , v = document.referrer
              , d = Function.prototype.bind
              , p = Function.prototype.call
              , l = p.bind(d, p)
              , g = l(String.prototype.indexOf)
              , F = l(String.prototype.split)
              , m = l(String.prototype.replace)
              , D = (l(String.prototype.substr),
            document.addEventListener ? document.addEventListener.bind(document) : void 0)
              , _ = window.addEventListener ? window.addEventListener.bind(window) : void 0
              , E = document.attachEvent
              , C = RegExp
              , A = "risktrackingconf"
              , B = {}
              , y = new Date().getTime()
              , w = function(t) {
                var n = ""
                  , r = function() {
                    var t = s(62 * a());
                    return t < 10 ? t : t < 36 ? String.fromCharCode(t + 55) : String.fromCharCode(t + 61)
                };
                for (; n.length < t; )
                    n += r();
                return n
            }(10);
            B.t = -1,
            B.key = G().o.i.parse(A),
            B.u = G().o.i.parse(A);
            var b = {
                s: {
                    h: "66DE8C42D03E9613BC6388F4EEE1869E",
                    v: "5229A90697CC635618ACE3D99C4F8922",
                    p: "1B65AF3BD2FD08F5DFF43993E4FFF0C2",
                    l: "E274EC2FF08EED86FD02A8869136FE7736CEF22D01A490748D5F3DA05382D0249D0031E7EBF5A684F38000114D86FAC0B4EF402F66A07B66867407EB9A40F1CD",
                    g: "38096CFEA83412B2400A2428A566EAF6E57C1685CAC856465C0C21CE241B0D4A",
                    biz: "B83E067560B76B49D7AF662A134C48DF"
                },
                F: {
                    m: "7AA46EF584DB471FA5C59B232B16BCE7",
                    D: "1CDD13B0DE5B379ADE9D0977AF88919E5D7D9F74517F793DEF9CEA158663C020",
                    _: "525F8B482F2435CC1D0CC8DB39FB80E7"
                },
                C: {
                    A: "399476923FB6B8477740E024B56E44D3",
                    B: "FF9FFEC37F4B675129CCD6749AB8BBD9",
                    k: "784A7BF951A23E6730ECB9C72C5B756A",
                    S: "A7A46FF1538BFCC9210D3C6D1172F98D",
                    T: "8F899AAAE20A954BAED130E0E67333F8",
                    j: "1296D9347347C4AC7921C84CA3471187",
                    O: "9341DFC970073CE459F04229F69E9AAE",
                    I: "A48926352EC3DC6ADF991681FD3DB994",
                    N: "4ba5224744c1875f923b3d881ef101e5",
                    M: "CA3270DEF8F93080621D885F535426D4"
                },
                J: {
                    R: "0AE3F57FF392BD7D52080B228F9CB57D",
                    U: "F52B5D31F07334BC22C9319E23CCDA16",
                    q: "53FBEF3E4D6BDC2E4E517CF50E78768E",
                    H: "B7F6D4DFAD8D5B85632D57DB73B95CF8"
                },
                P: {
                    X: "E57FCCD91E0DA1307109BAEDEB5A9D05",
                    Z: "767AEBAB41897293A31938D4922D0181",
                    G: "E3CF5BC94C073BB32928EAAC9A7BE3D1"
                },
                K: {
                    K: "9CDB104A48A9478386FDFFBDD1BDF364",
                    L: "43EA5220A2F859BB42D509A5D6236432"
                }
            };
            function k() {
                var t = F(F(F(h, "?")[0], "//")[1], "/")[0]
                  , n = B.V.substr(4);
                if (g(t, n) > -1)
                    return n;
                var r = F(t, ".");
                return r[r.length - 2] + "." + r[r.length - 1]
            }
            function x(t) {
                return n = t,
                r = G().o.W.parse(n),
                i = G().o.Y.stringify(r),
                G().$.decrypt(i, B.key, {
                    u: B.u,
                    mode: G().mode.tt,
                    padding: G().pad.nt
                }).toString(G().o.i).toString();
                var n, r, i
            }
            function S() {
                if (void 0 != B.rt)
                    return B.rt;
                for (var t = F(x(b.s.l), "|"), n = !0, i = 0; i < t.length; i++)
                    if (g(r, t[i]) > 0) {
                        n = !1;
                        break
                    }
                return B.rt = n,
                n
            }
            function T() {
                return new Date().getTime()
            }
            function j(t) {
                if (document.cookie.length > 0) {
                    var n = g(document.cookie, t + "=");
                    if (-1 != n) {
                        n = n + t.length + 1;
                        var r = g(document.cookie, ";", n);
                        return -1 == r && (r = document.cookie.length),
                        document.cookie.substring(n, r)
                    }
                    return ""
                }
            }
            function O() {
                B.it = 1
            }
            function z(t) {
                1 == B.et && (B.et = T()),
                B.ot.push(t.clientX),
                B.ut.push(t.clientY),
                N()
            }
            function I(t) {
                var n = setTimeout(function() {
                    !function(t) {
                        for (var n = 0; n < t.changedTouches.length; n++)
                            -1 != B.t && B.t == t.changedTouches[n].identifier && (B.ot.push(t.changedTouches[n].clientX),
                            B.ut.push(t.changedTouches[n].clientY),
                            N())
                    }(t),
                    clearTimeout(n)
                }, 0)
            }
            function N() {
                B.ct = 1,
                B.ft++,
                B.ot.length >= 2 && B.ut.length >= 2 && (B.at = B.st,
                B.ht += u(c(B.ut[1] - B.ut[0], 2) + c(B.ot[1] - B.ot[0], 2)),
                B.st = (B.ut[1] - B.ut[0]) / (B.ot[1] - B.ot[0]),
                B.ot.shift(),
                B.ut.shift()),
                B.st == B.at && B.vt++
            }
            function M(t) {
                (t = t || window.event).target = t.target || t.srcElement,
                B.x = t.clientX,
                B.y = t.clientY,
                H(t.target)
            }
            function J(t) {
                var n = setTimeout(function() {
                    !function(t) {
                        if (B.dt = t.touches.length,
                        -1 != B.t)
                            return;
                        B.t = t.touches[0].identifier,
                        B.x = t.touches[0].clientX,
                        B.y = t.touches[0].clientY,
                        H(t.target)
                    }(t),
                    clearTimeout(n)
                }, 0)
            }
            function R(t) {
                var n = setTimeout(function() {
                    q(t),
                    clearTimeout(n)
                }, 0)
            }
            function U(t) {
                var n = setTimeout(function() {
                    q(t),
                    clearTimeout(n)
                }, 0)
            }
            function q(t) {
                for (var n = 0; n < t.changedTouches.length; n++)
                    -1 != B.t && B.t == t.changedTouches[n].identifier && (B.x = t.changedTouches[n].clientX,
                    B.y = t.changedTouches[n].clientY,
                    H(t.target),
                    B.t = -1,
                    B.dt = 0)
            }
            function H(t) {
                if ("" != t.id)
                    B.pt = t.id,
                    t.tagName == x(b.J.R) ? B.lt = B.pt : t.tagName == x(b.J.U) ? B.gt = B.pt : t.tagName == x(b.J.q) && (B.Ft = t.href);
                else {
                    var n = x(b.J.H);
                    t.tagName == x(b.J.R) ? B.lt = n : t.tagName == x(b.J.U) ? B.gt = n : t.tagName == x(b.J.q) && (B.Ft = t.href),
                    B.pt = ""
                }
                B.Dt++,
                B.Dt % 2 == 0 ? (B._0 = B.ft,
                B.et = T(),
                B.Et = B.vt,
                B.Ct = B.ht,
                S() || P()) : (B.At = B.ft,
                B.Bt = T(),
                B.yt = B.vt,
                B.wt = B.ht),
                S() && P()
            }
            function P() {
                B.bt = f(B._0 - B.At),
                B.kt = f(B.et - B.Bt),
                B.xt = B.bt / B.kt,
                B.St = f(B.yt - B.Et) || "",
                B.Tt = f(B.wt - B.Ct),
                B.jt = B.Tt / B.bt || "",
                B.Ot = T(),
                X(),
                B.ct = 0,
                B.it = 0,
                B.Ft = "",
                B.lt = "",
                B.gt = ""
            }
            function X() {
                var n = "__" + x(b.P.G)
                  , r = j(n);
                "" == r && window.sessionStorage && (r = window.sessionStorage.getItem(n)) && (document.cookie = n + "=" + r + "; path=/; domain=" + B.zt);
                var i, e = new Image(), o = function(t) {
                    var n = {};
                    t.It = decodeURIComponent(j("pin") || ""),
                    (null == t.It || "" == t.It) && (t.It = decodeURIComponent(j("pt_pin") || ""));
                    return Z("sr", t.Nt + "*" + t.Mt, !1, n),
                    Z("sd", t.cd, !1, n),
                    Z("p", t.It || "", !1, n),
                    Z("ru", t.Jt, !1, n),
                    Z("cu", t.Rt, !1, n),
                    Z("pv", t.Ut, !1, n),
                    Z("c", "c1=" + t.pt + ",c2=" + t.Ft + ",c3=" + t.x + ",c4=" + t.y, !1, n),
                    Z("i", "i1=" + t.lt + ",i2=" + t.gt, !1, n),
                    Z("m", "m1=" + t.ct + ",m2=" + t.it + ",m3=" + (t.bt || 0) + ",m4=" + (t.xt || 0) + ",m5=" + (t.St || 0) + ",m6=" + (t.jt || 0) + ",m7=" + (1 == (t.dt || 1) ? 1 : 2) + ",m8=" + (t.rt ? 1 : 2), !1, n),
                    Z("t", t.Ot || T(), !1, n),
                    Z("biz", t.biz, !1, n),
                    Z("eid", t.K || "", !1, n),
                    Z("fp", t.L || "", !1, n),
                    Z("s", getTakTag(), !1, n),
                    n
                }(B), u = t(o), c = (i = u,
                srcs = G().o.i.parse(i),
                G().$.encrypt(srcs, B.key, {
                    u: B.u,
                    mode: G().mode.tt,
                    padding: G().pad.nt
                }).ciphertext.toString().toUpperCase());
                e.src = x(b.s.h) + B.zt + "/" + x(b.s.g) + c,
                e.onerror = function() {}
                ,
                e.onload = function() {}
            }
            function Z(t, n, r, i) {
                return i["" + t] = r ? encodeURIComponent(n) : n
            }
            function G(t) {
                var n, r, i, e, o, u, c, f = function(t, n) {
                    var r = {}
                      , i = r.qt = {}
                      , e = function() {}
                      , o = i.Ht = {
                        extend: function(t) {
                            e.prototype = this;
                            var n = new e();
                            return t && n.Pt(t),
                            n.hasOwnProperty("init") || (n.init = function() {
                                n.Xt.init.apply(this, arguments)
                            }
                            ),
                            n.init.prototype = n,
                            n.Xt = this,
                            n
                        },
                        create: function() {
                            var t = this.extend();
                            return t.init.apply(t, arguments),
                            t
                        },
                        init: function() {},
                        Pt: function(t) {
                            for (var n in t)
                                t.hasOwnProperty(n) && (this[n] = t[n]);
                            t.hasOwnProperty("toString") && (this.toString = t.toString)
                        },
                        clone: function() {
                            return this.init.prototype.extend(this)
                        }
                    }
                      , u = i.Zt = o.extend({
                        init: function(t, n) {
                            t = this.Gt = t || [],
                            this.Kt = void 0 != n ? n : 4 * t.length
                        },
                        toString: function(t) {
                            return (t || f).stringify(this)
                        },
                        concat: function(t) {
                            var n = this.Gt
                              , r = t.Gt
                              , i = this.Kt;
                            if (t = t.Kt,
                            this.Lt(),
                            i % 4)
                                for (var e = 0; e < t; e++)
                                    n[i + e >>> 2] |= (r[e >>> 2] >>> 24 - e % 4 * 8 & 255) << 24 - (i + e) % 4 * 8;
                            else if (65535 < r.length)
                                for (e = 0; e < t; e += 4)
                                    n[i + e >>> 2] = r[e >>> 2];
                            else
                                n.push.apply(n, r);
                            return this.Kt += t,
                            this
                        },
                        Lt: function() {
                            var n = this.Gt
                              , r = this.Kt;
                            n[r >>> 2] &= 4294967295 << 32 - r % 4 * 8,
                            n.length = t.ceil(r / 4)
                        },
                        clone: function() {
                            var t = o.clone.call(this);
                            return t.Gt = this.Gt.slice(0),
                            t
                        },
                        random: function(n) {
                            for (var r = [], i = 0; i < n; i += 4)
                                r.push(4294967296 * t.random() | 0);
                            return new u.init(r,n)
                        }
                    })
                      , c = r.o = {}
                      , f = c.W = {
                        stringify: function(t) {
                            var n = t.Gt;
                            t = t.Kt;
                            for (var r = [], i = 0; i < t; i++) {
                                var e = n[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                                r.push((e >>> 4).toString(16)),
                                r.push((15 & e).toString(16))
                            }
                            return r.join("")
                        },
                        parse: function(t) {
                            for (var n = t.length, r = [], i = 0; i < n; i += 2)
                                r[i >>> 3] |= parseInt(t.substr(i, 2), 16) << 24 - i % 8 * 4;
                            return new u.init(r,n / 2)
                        }
                    }
                      , a = c.Qt = {
                        stringify: function(t) {
                            var n = t.Gt;
                            t = t.Kt;
                            for (var r = [], i = 0; i < t; i++)
                                r.push(String.fromCharCode(n[i >>> 2] >>> 24 - i % 4 * 8 & 255));
                            return r.join("")
                        },
                        parse: function(t) {
                            for (var n = t.length, r = [], i = 0; i < n; i++)
                                r[i >>> 2] |= (255 & t.charCodeAt(i)) << 24 - i % 4 * 8;
                            return new u.init(r,n)
                        }
                    }
                      , s = c.i = {
                        stringify: function(t) {
                            try {
                                return decodeURIComponent(escape(a.stringify(t)))
                            } catch (ex) {
                                throw Error("Malformed UTF-8 data")
                            }
                        },
                        parse: function(t) {
                            return a.parse(unescape(encodeURIComponent(t)))
                        }
                    }
                      , h = i.Vt = o.extend({
                        reset: function() {
                            this.Wt = new u.init(),
                            this.Yt = 0
                        },
                        t: function(t) {
                            "string" == typeof t && (t = s.parse(t)),
                            this.Wt.concat(t),
                            this.Yt += t.Kt
                        },
                        tn: function(n) {
                            var r = this.Wt
                              , i = r.Gt
                              , e = r.Kt
                              , o = this.nn
                              , c = e / (4 * o);
                            if (n = (c = n ? t.ceil(c) : t.max((0 | c) - this.rn, 0)) * o,
                            e = t.min(4 * n, e),
                            n) {
                                for (var f = 0; f < n; f += o)
                                    this.IN(i, f);
                                f = i.splice(0, n),
                                r.Kt -= e
                            }
                            return new u.init(f,e)
                        },
                        clone: function() {
                            var t = o.clone.call(this);
                            return t.Wt = this.Wt.clone(),
                            t
                        },
                        rn: 0
                    });
                    i.en = h.extend({
                        on: o.extend(),
                        init: function(t) {
                            this.on = this.on.extend(t),
                            this.reset()
                        },
                        reset: function() {
                            h.reset.call(this),
                            this.un()
                        },
                        update: function(t) {
                            return this.t(t),
                            this.tn(),
                            this
                        },
                        cn: function(t) {
                            return t && this.t(t),
                            this.fn()
                        },
                        nn: 16,
                        an: function(t) {
                            return function(n, r) {
                                return new t.init(r).cn(n)
                            }
                        },
                        sn: function(t) {
                            return function(n, r) {
                                return new v.hn.init(t,r).cn(n)
                            }
                        }
                    });
                    var v = r.vn = {};
                    return r
                }(Math);
                return r = (n = f).qt.Zt,
                n.o.Y = {
                    stringify: function(t) {
                        var n = t.Gt
                          , r = t.Kt
                          , i = this.dn;
                        t.Lt(),
                        t = [];
                        for (var e = 0; e < r; e += 3)
                            for (var o = (n[e >>> 2] >>> 24 - e % 4 * 8 & 255) << 16 | (n[e + 1 >>> 2] >>> 24 - (e + 1) % 4 * 8 & 255) << 8 | n[e + 2 >>> 2] >>> 24 - (e + 2) % 4 * 8 & 255, u = 0; 4 > u && e + .75 * u < r; u++)
                                t.push(i.charAt(o >>> 6 * (3 - u) & 63));
                        if (n = i.charAt(64))
                            for (; t.length % 4; )
                                t.push(n);
                        return t.join("")
                    },
                    parse: function(t) {
                        var n = t.length
                          , i = this.dn;
                        (e = i.charAt(64)) && -1 != (e = t.indexOf(e)) && (n = e);
                        for (var e = [], o = 0, u = 0; u < n; u++)
                            if (u % 4) {
                                var c = i.indexOf(t.charAt(u - 1)) << u % 4 * 2
                                  , f = i.indexOf(t.charAt(u)) >>> 6 - u % 4 * 2;
                                e[o >>> 2] |= (c | f) << 24 - o % 4 * 8,
                                o++
                            }
                        return r.create(e, o)
                    },
                    dn: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
                },
                function(t) {
                    function n(t, n, r, i, e, o, u) {
                        return ((t = t + (n & r | ~n & i) + e + u) << o | t >>> 32 - o) + n
                    }
                    function r(t, n, r, i, e, o, u) {
                        return ((t = t + (n & i | r & ~i) + e + u) << o | t >>> 32 - o) + n
                    }
                    function i(t, n, r, i, e, o, u) {
                        return ((t = t + (n ^ r ^ i) + e + u) << o | t >>> 32 - o) + n
                    }
                    function e(t, n, r, i, e, o, u) {
                        return ((t = t + (r ^ (n | ~i)) + e + u) << o | t >>> 32 - o) + n
                    }
                    for (var o = f, u = (a = o.qt).Zt, c = a.en, a = o.vn, s = [], h = 0; 64 > h; h++)
                        s[h] = 4294967296 * t.abs(t.sin(h + 1)) | 0;
                    a = a.pn = c.extend({
                        un: function() {
                            this.ln = new u.init([1732584193, 4023233417, 2562383102, 271733878])
                        },
                        IN: function(t, o) {
                            for (var u = 0; 16 > u; u++) {
                                var c = t[h = o + u];
                                t[h] = 16711935 & (c << 8 | c >>> 24) | 4278255360 & (c << 24 | c >>> 8)
                            }
                            u = this.ln.Gt;
                            var f, a, h = t[o + 0], v = (c = t[o + 1],
                            t[o + 2]), d = t[o + 3], p = t[o + 4], l = t[o + 5], g = t[o + 6], F = t[o + 7], m = t[o + 8], D = t[o + 9], _ = t[o + 10], E = t[o + 11], C = t[o + 12], A = t[o + 13], B = t[o + 14], y = t[o + 15], w = u[0], b = e(b = e(b = e(b = e(b = i(b = i(b = i(b = i(b = r(b = r(b = r(b = r(b = n(b = n(b = n(b = n(b = u[1], a = n(a = u[2], f = n(f = u[3], w = n(w, b, a, f, h, 7, s[0]), b, a, c, 12, s[1]), w, b, v, 17, s[2]), f, w, d, 22, s[3]), a = n(a, f = n(f, w = n(w, b, a, f, p, 7, s[4]), b, a, l, 12, s[5]), w, b, g, 17, s[6]), f, w, F, 22, s[7]), a = n(a, f = n(f, w = n(w, b, a, f, m, 7, s[8]), b, a, D, 12, s[9]), w, b, _, 17, s[10]), f, w, E, 22, s[11]), a = n(a, f = n(f, w = n(w, b, a, f, C, 7, s[12]), b, a, A, 12, s[13]), w, b, B, 17, s[14]), f, w, y, 22, s[15]), a = r(a, f = r(f, w = r(w, b, a, f, c, 5, s[16]), b, a, g, 9, s[17]), w, b, E, 14, s[18]), f, w, h, 20, s[19]), a = r(a, f = r(f, w = r(w, b, a, f, l, 5, s[20]), b, a, _, 9, s[21]), w, b, y, 14, s[22]), f, w, p, 20, s[23]), a = r(a, f = r(f, w = r(w, b, a, f, D, 5, s[24]), b, a, B, 9, s[25]), w, b, d, 14, s[26]), f, w, m, 20, s[27]), a = r(a, f = r(f, w = r(w, b, a, f, A, 5, s[28]), b, a, v, 9, s[29]), w, b, F, 14, s[30]), f, w, C, 20, s[31]), a = i(a, f = i(f, w = i(w, b, a, f, l, 4, s[32]), b, a, m, 11, s[33]), w, b, E, 16, s[34]), f, w, B, 23, s[35]), a = i(a, f = i(f, w = i(w, b, a, f, c, 4, s[36]), b, a, p, 11, s[37]), w, b, F, 16, s[38]), f, w, _, 23, s[39]), a = i(a, f = i(f, w = i(w, b, a, f, A, 4, s[40]), b, a, h, 11, s[41]), w, b, d, 16, s[42]), f, w, g, 23, s[43]), a = i(a, f = i(f, w = i(w, b, a, f, D, 4, s[44]), b, a, C, 11, s[45]), w, b, y, 16, s[46]), f, w, v, 23, s[47]), a = e(a, f = e(f, w = e(w, b, a, f, h, 6, s[48]), b, a, F, 10, s[49]), w, b, B, 15, s[50]), f, w, l, 21, s[51]), a = e(a, f = e(f, w = e(w, b, a, f, C, 6, s[52]), b, a, d, 10, s[53]), w, b, _, 15, s[54]), f, w, c, 21, s[55]), a = e(a, f = e(f, w = e(w, b, a, f, m, 6, s[56]), b, a, y, 10, s[57]), w, b, g, 15, s[58]), f, w, A, 21, s[59]), a = e(a, f = e(f, w = e(w, b, a, f, p, 6, s[60]), b, a, E, 10, s[61]), w, b, v, 15, s[62]), f, w, D, 21, s[63]);
                            u[0] = u[0] + w | 0,
                            u[1] = u[1] + b | 0,
                            u[2] = u[2] + a | 0,
                            u[3] = u[3] + f | 0
                        },
                        fn: function() {
                            var n = this.Wt
                              , r = n.Gt
                              , i = 8 * this.Yt
                              , e = 8 * n.Kt;
                            r[e >>> 5] |= 128 << 24 - e % 32;
                            var o = t.floor(i / 4294967296);
                            for (r[15 + (e + 64 >>> 9 << 4)] = 16711935 & (o << 8 | o >>> 24) | 4278255360 & (o << 24 | o >>> 8),
                            r[14 + (e + 64 >>> 9 << 4)] = 16711935 & (i << 8 | i >>> 24) | 4278255360 & (i << 24 | i >>> 8),
                            n.Kt = 4 * (r.length + 1),
                            this.tn(),
                            r = (n = this.ln).Gt,
                            i = 0; 4 > i; i++)
                                e = r[i],
                                r[i] = 16711935 & (e << 8 | e >>> 24) | 4278255360 & (e << 24 | e >>> 8);
                            return n
                        },
                        clone: function() {
                            var t = c.clone.call(this);
                            return t.ln = this.ln.clone(),
                            t
                        }
                    }),
                    o.pn = c.an(a),
                    o.gn = c.sn(a)
                }(Math),
                o = (i = (e = f).qt).Ht,
                u = i.Zt,
                c = (i = e.vn).Fn = o.extend({
                    on: o.extend({
                        mn: 4,
                        Dn: i.pn,
                        _1: 1
                    }),
                    init: function(t) {
                        this.on = this.on.extend(t)
                    },
                    En: function(t, n) {
                        for (var r = (c = this.on).Dn.create(), i = u.create(), e = i.Gt, o = c.mn, c = c._1; e.length < o; ) {
                            f && r.update(f);
                            var f = r.update(t).cn(n);
                            r.reset();
                            for (var a = 1; a < c; a++)
                                f = r.cn(f),
                                r.reset();
                            i.concat(f)
                        }
                        return i.Kt = 4 * o,
                        i
                    }
                }),
                e.Fn = function(t, n, r) {
                    return c.create(r).En(t, n)
                }
                ,
                f.qt.Cn || function(t) {
                    var n = (p = f).qt
                      , r = n.Ht
                      , i = n.Zt
                      , e = n.Vt
                      , o = p.o.Y
                      , u = p.vn.Fn
                      , c = n.Cn = e.extend({
                        on: r.extend(),
                        An: function(t, n) {
                            return this.create(this.Bn, t, n)
                        },
                        yn: function(t, n) {
                            return this.create(this.wn, t, n)
                        },
                        init: function(t, n, r) {
                            this.on = this.on.extend(r),
                            this.bn = t,
                            this.kn = n,
                            this.reset()
                        },
                        reset: function() {
                            e.reset.call(this),
                            this.un()
                        },
                        process: function(t) {
                            return this.t(t),
                            this.tn()
                        },
                        cn: function(t) {
                            return t && this.t(t),
                            this.fn()
                        },
                        mn: 4,
                        xn: 4,
                        Bn: 1,
                        wn: 2,
                        an: function(t) {
                            return {
                                encrypt: function(n, r, i) {
                                    return ("string" == typeof r ? l : d).encrypt(t, n, r, i)
                                },
                                decrypt: function(n, r, i) {
                                    return ("string" == typeof r ? l : d).decrypt(t, n, r, i)
                                }
                            }
                        }
                    });
                    n.Sn = c.extend({
                        fn: function() {
                            return this.tn(!0)
                        },
                        nn: 1
                    });
                    var a = p.mode = {}
                      , s = function(t, n, r) {
                        var i = this.Tn;
                        i ? this.Tn = void 0 : i = this.jn;
                        for (var e = 0; e < r; e++)
                            t[n + e] ^= i[e]
                    }
                      , h = (n.On = r.extend({
                        An: function(t, n) {
                            return this.zn.create(t, n)
                        },
                        yn: function(t, n) {
                            return this.In.create(t, n)
                        },
                        init: function(t, n) {
                            this.Nn = t,
                            this.Tn = n
                        }
                    })).extend();
                    h.zn = h.extend({
                        Mn: function(t, n) {
                            var r = this.Nn
                              , i = r.nn;
                            s.call(this, t, n, i),
                            r.Jn(t, n),
                            this.jn = t.slice(n, n + i)
                        }
                    }),
                    h.In = h.extend({
                        Mn: function(t, n) {
                            var r = this.Nn
                              , i = r.nn
                              , e = t.slice(n, n + i);
                            r.Rn(t, n),
                            s.call(this, t, n, i),
                            this.jn = e
                        }
                    }),
                    a = a.tt = h,
                    h = (p.pad = {}).nt = {
                        pad: function(t, n) {
                            for (var r, e = (r = (r = 4 * n) - t.Kt % r) << 24 | r << 16 | r << 8 | r, o = [], u = 0; u < r; u += 4)
                                o.push(e);
                            r = i.create(o, r),
                            t.concat(r)
                        },
                        Un: function(t) {
                            t.Kt -= 255 & t.Gt[t.Kt - 1 >>> 2]
                        }
                    },
                    n.qn = c.extend({
                        on: c.on.extend({
                            mode: a,
                            padding: h
                        }),
                        reset: function() {
                            c.reset.call(this);
                            var t = (n = this.on).u
                              , n = n.mode;
                            if (this.bn == this.Bn)
                                var r = n.An;
                            else
                                r = n.yn,
                                this.rn = 1;
                            this.Hn = r.call(n, this, t && t.Gt)
                        },
                        IN: function(t, n) {
                            this.Hn.Mn(t, n)
                        },
                        fn: function() {
                            var t = this.on.padding;
                            if (this.bn == this.Bn) {
                                t.pad(this.Wt, this.nn);
                                var n = this.tn(!0)
                            } else
                                n = this.tn(!0),
                                t.Un(n);
                            return n
                        },
                        nn: 4
                    });
                    var v = n.Pn = r.extend({
                        init: function(t) {
                            this.Pt(t)
                        },
                        toString: function(t) {
                            return (t || this.Xn).stringify(this)
                        }
                    })
                      , d = (a = (p.format = {}).Zn = {
                        stringify: function(t) {
                            var n = t.ciphertext;
                            return ((t = t.Gn) ? i.create([1398893684, 1701076831]).concat(t).concat(n) : n).toString(o)
                        },
                        parse: function(t) {
                            var n = (t = o.parse(t)).Gt;
                            if (1398893684 == n[0] && 1701076831 == n[1]) {
                                var r = i.create(n.slice(2, 4));
                                n.splice(0, 4),
                                t.Kt -= 16
                            }
                            return v.create({
                                ciphertext: t,
                                Gn: r
                            })
                        }
                    },
                    n.Kn = r.extend({
                        on: r.extend({
                            format: a
                        }),
                        encrypt: function(t, n, r, i) {
                            i = this.on.extend(i);
                            var e = t.An(r, i);
                            return n = e.cn(n),
                            e = e.on,
                            v.create({
                                ciphertext: n,
                                key: r,
                                u: e.u,
                                algorithm: t,
                                mode: e.mode,
                                padding: e.padding,
                                nn: t.nn,
                                Xn: i.format
                            })
                        },
                        decrypt: function(t, n, r, i) {
                            return i = this.on.extend(i),
                            n = this.Ln(n, i.format),
                            t.yn(r, i).cn(n.ciphertext)
                        },
                        Ln: function(t, n) {
                            return "string" == typeof t ? n.parse(t, this) : t
                        }
                    }))
                      , p = (p.Qn = {}).Zn = {
                        Vn: function(t, n, r, e) {
                            return e || (e = i.random(8)),
                            t = u.create({
                                mn: n + r
                            }).En(t, e),
                            r = i.create(t.Gt.slice(n), 4 * r),
                            t.Kt = 4 * n,
                            v.create({
                                key: t,
                                u: r,
                                Gn: e
                            })
                        }
                    }
                      , l = n.Wn = d.extend({
                        on: d.on.extend({
                            Qn: p
                        }),
                        encrypt: function(t, n, r, i) {
                            return r = (i = this.on.extend(i)).Qn.Vn(r, t.mn, t.xn),
                            i.u = r.u,
                            (t = d.encrypt.call(this, t, n, r.key, i)).Pt(r),
                            t
                        },
                        decrypt: function(t, n, r, i) {
                            return i = this.on.extend(i),
                            n = this.Ln(n, i.format),
                            r = i.Qn.Vn(r, t.mn, t.xn, n.Gn),
                            i.u = r.u,
                            d.decrypt.call(this, t, n, r.key, i)
                        }
                    })
                }(),
                function() {
                    for (var t = f, n = t.qt.qn, r = t.vn, i = [], e = [], o = [], u = [], c = [], a = [], s = [], h = [], v = [], d = [], p = [], l = 0; 256 > l; l++)
                        p[l] = 128 > l ? l << 1 : l << 1 ^ 283;
                    var g = 0
                      , F = 0;
                    for (l = 0; 256 > l; l++) {
                        var m = (m = F ^ F << 1 ^ F << 2 ^ F << 3 ^ F << 4) >>> 8 ^ 255 & m ^ 99;
                        i[g] = m,
                        e[m] = g;
                        var D = p[g]
                          , _ = p[D]
                          , E = p[_]
                          , C = 257 * p[m] ^ 16843008 * m;
                        o[g] = C << 24 | C >>> 8,
                        u[g] = C << 16 | C >>> 16,
                        c[g] = C << 8 | C >>> 24,
                        a[g] = C,
                        C = 16843009 * E ^ 65537 * _ ^ 257 * D ^ 16843008 * g,
                        s[m] = C << 24 | C >>> 8,
                        h[m] = C << 16 | C >>> 16,
                        v[m] = C << 8 | C >>> 24,
                        d[m] = C,
                        g ? (g = D ^ p[p[p[E ^ D]]],
                        F ^= p[p[F]]) : g = F = 1
                    }
                    var A = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
                    r = r.$ = n.extend({
                        un: function() {
                            for (var t = (r = this.kn).Gt, n = r.Kt / 4, r = 4 * ((this.Yn = n + 6) + 1), e = this.n = [], o = 0; o < r; o++)
                                if (o < n)
                                    e[o] = t[o];
                                else {
                                    var u = e[o - 1];
                                    o % n ? 6 < n && 4 == o % n && (u = i[u >>> 24] << 24 | i[u >>> 16 & 255] << 16 | i[u >>> 8 & 255] << 8 | i[255 & u]) : (u = i[(u = u << 8 | u >>> 24) >>> 24] << 24 | i[u >>> 16 & 255] << 16 | i[u >>> 8 & 255] << 8 | i[255 & u],
                                    u ^= A[o / n | 0] << 24),
                                    e[o] = e[o - n] ^ u
                                }
                            for (t = this.tr = [],
                            n = 0; n < r; n++)
                                o = r - n,
                                u = n % 4 ? e[o] : e[o - 4],
                                t[n] = 4 > n || 4 >= o ? u : s[i[u >>> 24]] ^ h[i[u >>> 16 & 255]] ^ v[i[u >>> 8 & 255]] ^ d[i[255 & u]]
                        },
                        Jn: function(t, n) {
                            this.nr(t, n, this.n, o, u, c, a, i)
                        },
                        Rn: function(t, n) {
                            var r = t[n + 1];
                            t[n + 1] = t[n + 3],
                            t[n + 3] = r,
                            this.nr(t, n, this.tr, s, h, v, d, e),
                            r = t[n + 1],
                            t[n + 1] = t[n + 3],
                            t[n + 3] = r
                        },
                        nr: function(t, n, r, i, e, o, u, c) {
                            for (var f = this.Yn, a = t[n] ^ r[0], s = t[n + 1] ^ r[1], h = t[n + 2] ^ r[2], v = t[n + 3] ^ r[3], d = 4, p = 1; p < f; p++) {
                                var l = i[a >>> 24] ^ e[s >>> 16 & 255] ^ o[h >>> 8 & 255] ^ u[255 & v] ^ r[d++]
                                  , g = i[s >>> 24] ^ e[h >>> 16 & 255] ^ o[v >>> 8 & 255] ^ u[255 & a] ^ r[d++]
                                  , F = i[h >>> 24] ^ e[v >>> 16 & 255] ^ o[a >>> 8 & 255] ^ u[255 & s] ^ r[d++];
                                v = i[v >>> 24] ^ e[a >>> 16 & 255] ^ o[s >>> 8 & 255] ^ u[255 & h] ^ r[d++],
                                a = l,
                                s = g,
                                h = F
                            }
                            l = (c[a >>> 24] << 24 | c[s >>> 16 & 255] << 16 | c[h >>> 8 & 255] << 8 | c[255 & v]) ^ r[d++],
                            g = (c[s >>> 24] << 24 | c[h >>> 16 & 255] << 16 | c[v >>> 8 & 255] << 8 | c[255 & a]) ^ r[d++],
                            F = (c[h >>> 24] << 24 | c[v >>> 16 & 255] << 16 | c[a >>> 8 & 255] << 8 | c[255 & s]) ^ r[d++],
                            v = (c[v >>> 24] << 24 | c[a >>> 16 & 255] << 16 | c[s >>> 8 & 255] << 8 | c[255 & h]) ^ r[d++],
                            t[n] = l,
                            t[n + 1] = g,
                            t[n + 2] = F,
                            t[n + 3] = v
                        },
                        mn: 8
                    });
                    t.$ = n.an(r)
                }(),
                f
            }
            B.biz = function() {
                var t = "error_biz"
                  , n = F(F(document.getElementById("tak_trv").src, "?")[1], "&");
                if (null != n)
                    for (var r = 0; r < n.length; r++) {
                        var i = n[r].split("=");
                        if (null != i && 2 === i.length && "biz" === i[0]) {
                            t = i[1];
                            break
                        }
                    }
                return t
            }(),
            getTakId = function() {
                return "3C35C6ADA6D8" == B.biz || "TF0AETONNNFF" == B.biz ? "init_tak_id" : null
            }
            ,
            getTakTag = function() {
                return "3C35C6ADA6D8" == B.biz || "TF0AETONNNFF" == B.biz ? "init_tak_tag" : null
            }
            ,
            B.V = F(F(F(document.getElementById("tak_trv").src, "?")[0], "//")[1], "/")[0],
            B.zt = k(),
            function(t) {
                function n(t) {
                    var n = document.getElementsByTagName("html")[0]
                      , r = document.createElement("script");
                    n.appendChild(r),
                    r.src = t
                }
                var r = function() {
                    var t = k();
                    if ("jd.com" === t)
                        return "jd.com";
                    return "jd.id" === t ? "jd.id" : "joybuy.com"
                }();
                S() ? (n("//gias." + r + "/js/td.js"),
                e = setInterval(function() {
                    try {
                        getJdEid(function(n, r, i, o) {
                            t.K = n,
                            t.L = r,
                            clearInterval(e)
                        })
                    } catch (ex) {}
                }, 100),
                setTimeout(function() {
                    clearInterval(e)
                }, 1100)) : (n("//gia." + r + "/m.html"),
                n("//gias." + r + "/js/m.js"),
                i = setInterval(function() {
                    try {
                        var n = getJdEid();
                        if (n) {
                            clearInterval(i);
                            var r = x(b.K.K)
                              , e = x(b.K.L);
                            t.K = n[r],
                            t.L = n[e]
                        }
                    } catch (ex) {}
                }, 100),
                setTimeout(function() {
                    clearInterval(i)
                }, 1100));
                var i;
                var e
            }(B),
            function(t) {
                function n(t) {
                    var n = [];
                    for (var r in t)
                        n.push(encodeURIComponent(r) + "=" + encodeURIComponent(t[r]));
                    return n.push("v=" + Math.floor(1e4 * Math.random() + 500)),
                    n.join("&")
                }
                (t = t || {}).data = t.data || {},
                function(t) {
                    var r = t.rr
                      , i = document.getElementsByTagName("head")[0];
                    t.Wt.callback = r;
                    var e = n(t.Wt)
                      , o = document.createElement("script");
                    i.appendChild(o),
                    window[r] = function(n) {
                        i.removeChild(o),
                        clearTimeout(o.ir),
                        window[r] = null,
                        t.er && t.er(n)
                    }
                    ,
                    o.src = t.or + "?" + e,
                    t.ur && (o.ir = setTimeout(function() {
                        i.removeChild(o),
                        clearTimeout(o.ir),
                        window[r] = function() {
                            t.cr && t.cr({
                                message: "TimeOut"
                            })
                        }
                    }, t.ur))
                }(t)
            }({
                or: x(b.s.h) + B.zt + "/" + x(b.s.p),
                rr: x(b.s.v),
                Wt: {
                    biz: B.biz
                },
                er: function(t) {
                    try {
                        var r = n(t)
                          , u = "__" + x(b.P.G)
                          , c = j(u);
                        window.sessionStorage && c && window.sessionStorage.setItem(u, c),
                        getTakId = function() {
                            return G().pn(j("__" + x(b.P.G))).toString()
                        }
                        ,
                        getTakTag = function() {
                            var t = j("__" + x(b.P.G));
                            return G().pn(t + y + w).toString()
                        }
                        ;
                        var f = F(F(h, "?")[0], "//")[1];
                        f = m(f, /\./g, "@");
                        var a = !1
                          , s = r[x(b.P.X)];
                        for (idx in s) {
                            var d = m(s[idx], /\./g, "@")
                              , p = new C(x(b.F.m) + d + x(b.F.D),x(b.F._));
                            if (f.match(p)) {
                                a = !0;
                                break
                            }
                        }
                        if ("1" == r[x(b.P.Z)] && a) {
                            if (window.ar)
                                return;
                            B.Nt = i || "",
                            B.Mt = e || "",
                            B.cd = o || "",
                            B.Rt = F(h, "?")[0],
                            B.Jt = F(v, "?")[0] || "",
                            B.ot = [],
                            B.ut = [],
                            B.ct = 0,
                            B.it = 0,
                            B.lt = "",
                            B.gt = "",
                            B.x = 0,
                            B.y = 0,
                            B.Dt = 0,
                            B.pt = 0,
                            B.Ft = "",
                            B.ft = 0,
                            B._0 = 0,
                            B.At = 0,
                            B.Et = 0,
                            B.Ct = 0,
                            B.yt = 0,
                            B.wt = 0,
                            B.et = 1,
                            B.Bt = 1,
                            B.st = 0,
                            B.at = 0,
                            B.vt = 0,
                            B.ht = 0,
                            S() ? _ ? (_(x(b.C.A), z),
                            D && D(x(b.C.B), O, !1),
                            _(x(b.C.k), O),
                            D(x(b.C.S), M)) : (E(x(b.C.T) + x(b.C.A), z),
                            E(x(b.C.T) + x(b.C.k), O),
                            E(x(b.C.T) + x(b.C.S), M)) : (D(x(b.C.j), J),
                            D(x(b.C.O), I),
                            D(x(b.C.I), U),
                            D(x(b.C.N), R),
                            _(x(b.C.M), O)),
                            B.Ut = 1,
                            X(),
                            B.Ut = 0,
                            window.ar = !0
                        }
                    } catch (ex) {
                        console && console.log(ex.message)
                    }
                },
                ur: 5e3,
                cr: function(t) {}
            })
        }()
    } catch (ex) {
      debugger
        console && console.log(ex.message)
    }
}();

console.log(getTakTag())