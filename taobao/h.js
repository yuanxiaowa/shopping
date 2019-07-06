"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function signData(e) {
  function t(e, t) {
    return (e << t) | (e >>> (32 - t));
  }
  function n(e, t) {
    var n, a, r, i, o;
    return (
      (r = 2147483648 & e),
      (i = 2147483648 & t),
      (n = 1073741824 & e),
      (a = 1073741824 & t),
      (o = (1073741823 & e) + (1073741823 & t)),
      n & a
        ? 2147483648 ^ o ^ r ^ i
        : n | a
        ? 1073741824 & o
          ? 3221225472 ^ o ^ r ^ i
          : 1073741824 ^ o ^ r ^ i
        : o ^ r ^ i
    );
  }
  function a(e, t, n) {
    return (e & t) | (~e & n);
  }
  function r(e, t, n) {
    return (e & n) | (t & ~n);
  }
  function i(e, t, n) {
    return e ^ t ^ n;
  }
  function o(e, t, n) {
    return t ^ (e | ~n);
  }
  function s(e, r, i, o, s, l, c) {
    return (e = n(e, n(n(a(r, i, o), s), c))), n(t(e, l), r);
  }
  function l(e, a, i, o, s, l, c) {
    return (e = n(e, n(n(r(a, i, o), s), c))), n(t(e, l), a);
  }
  function c(e, a, r, o, s, l, c) {
    return (e = n(e, n(n(i(a, r, o), s), c))), n(t(e, l), a);
  }
  function u(e, a, r, i, s, l, c) {
    return (e = n(e, n(n(o(a, r, i), s), c))), n(t(e, l), a);
  }
  function d(e) {
    for (
      var t,
        n = e.length,
        a = n + 8,
        r = (a - (a % 64)) / 64,
        i = 16 * (r + 1),
        o = new Array(i - 1),
        s = 0,
        l = 0;
      n > l;

    )
      (t = (l - (l % 4)) / 4),
        (s = (l % 4) * 8),
        (o[t] = o[t] | (e.charCodeAt(l) << s)),
        l++;
    return (
      (t = (l - (l % 4)) / 4),
      (s = (l % 4) * 8),
      (o[t] = o[t] | (128 << s)),
      (o[i - 2] = n << 3),
      (o[i - 1] = n >>> 29),
      o
    );
  }
  function p(e) {
    var t,
      n,
      a = "",
      r = "";
    for (n = 0; 3 >= n; n++)
      (t = (e >>> (8 * n)) & 255),
        (r = "0" + t.toString(16)),
        (a += r.substr(r.length - 2, 2));
    return a;
  }
  function f(e) {
    e = e.replace(/\r\n/g, "\n");
    for (var t = "", n = 0; n < e.length; n++) {
      var a = e.charCodeAt(n);
      128 > a
        ? (t += String.fromCharCode(a))
        : a > 127 && 2048 > a
        ? ((t += String.fromCharCode((a >> 6) | 192)),
          (t += String.fromCharCode((63 & a) | 128)))
        : ((t += String.fromCharCode((a >> 12) | 224)),
          (t += String.fromCharCode(((a >> 6) & 63) | 128)),
          (t += String.fromCharCode((63 & a) | 128)));
    }
    return t;
  }
  var h,
    m,
    v,
    g,
    y,
    b,
    C,
    E,
    k,
    w = [],
    x = 7,
    D = 12,
    I = 17,
    _ = 22,
    S = 5,
    N = 9,
    R = 14,
    T = 20,
    O = 4,
    P = 11,
    M = 16,
    A = 23,
    L = 6,
    U = 10,
    q = 15,
    j = 21;
  for (
    e = f(e),
      w = d(e),
      b = 1732584193,
      C = 4023233417,
      E = 2562383102,
      k = 271733878,
      h = 0;
    h < w.length;
    h += 16
  )
    (m = b),
      (v = C),
      (g = E),
      (y = k),
      (b = s(b, C, E, k, w[h + 0], x, 3614090360)),
      (k = s(k, b, C, E, w[h + 1], D, 3905402710)),
      (E = s(E, k, b, C, w[h + 2], I, 606105819)),
      (C = s(C, E, k, b, w[h + 3], _, 3250441966)),
      (b = s(b, C, E, k, w[h + 4], x, 4118548399)),
      (k = s(k, b, C, E, w[h + 5], D, 1200080426)),
      (E = s(E, k, b, C, w[h + 6], I, 2821735955)),
      (C = s(C, E, k, b, w[h + 7], _, 4249261313)),
      (b = s(b, C, E, k, w[h + 8], x, 1770035416)),
      (k = s(k, b, C, E, w[h + 9], D, 2336552879)),
      (E = s(E, k, b, C, w[h + 10], I, 4294925233)),
      (C = s(C, E, k, b, w[h + 11], _, 2304563134)),
      (b = s(b, C, E, k, w[h + 12], x, 1804603682)),
      (k = s(k, b, C, E, w[h + 13], D, 4254626195)),
      (E = s(E, k, b, C, w[h + 14], I, 2792965006)),
      (C = s(C, E, k, b, w[h + 15], _, 1236535329)),
      (b = l(b, C, E, k, w[h + 1], S, 4129170786)),
      (k = l(k, b, C, E, w[h + 6], N, 3225465664)),
      (E = l(E, k, b, C, w[h + 11], R, 643717713)),
      (C = l(C, E, k, b, w[h + 0], T, 3921069994)),
      (b = l(b, C, E, k, w[h + 5], S, 3593408605)),
      (k = l(k, b, C, E, w[h + 10], N, 38016083)),
      (E = l(E, k, b, C, w[h + 15], R, 3634488961)),
      (C = l(C, E, k, b, w[h + 4], T, 3889429448)),
      (b = l(b, C, E, k, w[h + 9], S, 568446438)),
      (k = l(k, b, C, E, w[h + 14], N, 3275163606)),
      (E = l(E, k, b, C, w[h + 3], R, 4107603335)),
      (C = l(C, E, k, b, w[h + 8], T, 1163531501)),
      (b = l(b, C, E, k, w[h + 13], S, 2850285829)),
      (k = l(k, b, C, E, w[h + 2], N, 4243563512)),
      (E = l(E, k, b, C, w[h + 7], R, 1735328473)),
      (C = l(C, E, k, b, w[h + 12], T, 2368359562)),
      (b = c(b, C, E, k, w[h + 5], O, 4294588738)),
      (k = c(k, b, C, E, w[h + 8], P, 2272392833)),
      (E = c(E, k, b, C, w[h + 11], M, 1839030562)),
      (C = c(C, E, k, b, w[h + 14], A, 4259657740)),
      (b = c(b, C, E, k, w[h + 1], O, 2763975236)),
      (k = c(k, b, C, E, w[h + 4], P, 1272893353)),
      (E = c(E, k, b, C, w[h + 7], M, 4139469664)),
      (C = c(C, E, k, b, w[h + 10], A, 3200236656)),
      (b = c(b, C, E, k, w[h + 13], O, 681279174)),
      (k = c(k, b, C, E, w[h + 0], P, 3936430074)),
      (E = c(E, k, b, C, w[h + 3], M, 3572445317)),
      (C = c(C, E, k, b, w[h + 6], A, 76029189)),
      (b = c(b, C, E, k, w[h + 9], O, 3654602809)),
      (k = c(k, b, C, E, w[h + 12], P, 3873151461)),
      (E = c(E, k, b, C, w[h + 15], M, 530742520)),
      (C = c(C, E, k, b, w[h + 2], A, 3299628645)),
      (b = u(b, C, E, k, w[h + 0], L, 4096336452)),
      (k = u(k, b, C, E, w[h + 7], U, 1126891415)),
      (E = u(E, k, b, C, w[h + 14], q, 2878612391)),
      (C = u(C, E, k, b, w[h + 5], j, 4237533241)),
      (b = u(b, C, E, k, w[h + 12], L, 1700485571)),
      (k = u(k, b, C, E, w[h + 3], U, 2399980690)),
      (E = u(E, k, b, C, w[h + 10], q, 4293915773)),
      (C = u(C, E, k, b, w[h + 1], j, 2240044497)),
      (b = u(b, C, E, k, w[h + 8], L, 1873313359)),
      (k = u(k, b, C, E, w[h + 15], U, 4264355552)),
      (E = u(E, k, b, C, w[h + 6], q, 2734768916)),
      (C = u(C, E, k, b, w[h + 13], j, 1309151649)),
      (b = u(b, C, E, k, w[h + 4], L, 4149444226)),
      (k = u(k, b, C, E, w[h + 11], U, 3174756917)),
      (E = u(E, k, b, C, w[h + 2], q, 718787259)),
      (C = u(C, E, k, b, w[h + 9], j, 3951481745)),
      (b = n(b, m)),
      (C = n(C, v)),
      (E = n(E, g)),
      (k = n(k, y));
  var B = p(b) + p(C) + p(E) + p(k);
  return B.toLowerCase();
}
exports.default = signData;
