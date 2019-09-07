import FileCookieStore = require("tough-cookie-filestore");
import request = require("request-promise-native");
import iconv = require("iconv-lite");
import { ensureDirSync, ensureFileSync } from "fs-extra";

export const config = {
  isSubmitOrder: true
};

export const UA = {
  wap:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
  pc:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36"
};

export const DT = {
  taobao: 0,
  jingdong: 0
};

ensureFileSync(".data/_cookie.txt");
export const jar = request.jar(new FileCookieStore(".data/_cookie.txt"));

export const global_req = request.defaults({
  jar,
  headers: {
    "Accept-Encoding": "br, gzip, deflate",
    // Accept: '*/*',
    "User-Agent": UA.pc
    // Referer: 'https://bean.m.jd.com/continuity/index',
    // 'Accept-Language': 'en-us'
  },
  gzip: true,
  encoding: null,
  // @ts-ignore
  transform(body: any, { headers }: Response) {
    var ctype = headers["content-type"]!;
    if (/charset=([-\w]+)/i.test(ctype)) {
      if (RegExp.$1 && RegExp.$1.toLowerCase() !== "utf-8") {
        return iconv.decode(body, RegExp.$1);
      }
    }
    if (body instanceof Buffer) {
      return String(body);
    }
    return body;
  }
});
