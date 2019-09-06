/*
 * @Author: oudingyin
 * @Date: 2019-07-12 15:34:45
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 17:05:46
 */
import request = require("request-promise-native");

import {
  queryGoodsCoupon,
  obtainGoodsCoupon,
  queryFloorCoupons,
  obtainFloorCoupon,
  queryActivityCoupons,
  obtainActivityCoupon
} from "./coupon-handlers";
import {
  delay,
  createScheduler,
  logFileWrapper,
  getJsonpData
} from "../../../utils/tools";
import { RequestAPI, RequiredUriUrl } from "request";
import { getGoodsInfo } from "./goods";
import setting, { setSetting } from "./setting";

export const executer = createScheduler(3000);

export const logFile = logFileWrapper("jingdong");

export async function requestData(
  body: any,
  {
    functionId,
    api = "api"
  }: {
    functionId: string;
    api?: string;
  }
) {
  var text: string = await setting.req.get("https://api.m.jd.com/" + api, {
    qs: {
      client: "wh5",
      clientVersion: "2.0.0",
      agent:
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.90 Safari/537.36",
      lang: "zh_CN",
      networkType: "4g",
      eid: setting.eid,
      fp: setting.fp,
      functionId,
      body: JSON.stringify(body),
      jsonp: "cb",
      loginType: 2,
      _: Date.now()
    }
  });
  var res = getJsonpData(text);
  let { data, code, msg } = res;
  if (code !== 0) {
    let err = new Error(msg);
    throw err;
  }
  return data;
}

export function getBaseData() {
  return {
    eid: setting.eid,
    fp: setting.fp
  };
}

export function setReq(
  _req: RequestAPI<
    request.RequestPromise<any>,
    request.RequestPromiseOptions,
    RequiredUriUrl
  >,
  _cookie: string
) {
  setSetting("cookie", _cookie);
  setSetting("eid", getCookie("3AB9D23F7A4B3C9B"));
  setSetting("req", _req);
}

export function goGetCookie(url: string) {
  return setting.req.get("https://wq.jd.com/mlogin/mpage/Login", {
    qs: {
      rurl: url
    }
  });
}

export function time33(str: string) {
  for (var i = 0, len = str.length, hash = 5381; i < len; ++i) {
    hash += (hash << 5) + str.charAt(i).charCodeAt(0);
  }
  return hash & 0x7fffffff;
}
export function getCookie(name: string) {
  var reg = new RegExp("(^| )" + name + "(?:=([^;]*))?(;|$)"),
    val = setting.cookie.match(reg);
  if (!val || !val[2]) {
    return "";
  }
  var res = val[2];
  try {
    if (/(%[0-9A-F]{2}){2,}/.test(res)) {
      return decodeURIComponent(res);
    } else {
      return unescape(res);
    }
  } catch (e) {
    return unescape(res);
  }
}

export function getUuid() {
  return getCookie("mba_muid");
}

export function getSkuId(url: string) {
  if (/wareId=(\d+)/.test(url)) {
    return RegExp.$1;
  }
  return /(\d+)\.html/.exec(url)![1];
}

async function wrapItems(p: Promise<any[]>) {
  var res = await p;
  return {
    success: true,
    res
  };
}

export async function getGoodsCoupons(skuId: string) {
  var { item } = await getGoodsInfo(skuId);
  var coupons = await queryGoodsCoupon({
    skuId,
    vid: item.venderID,
    cid: item.category[item.category.length - 1]
  });
  var data = wrapItems(
    Promise.all(
      coupons
        .filter(item => !item.owned)
        .map(item =>
          executer(() =>
            obtainGoodsCoupon({
              roleId: item.roleId!,
              key: item.key
            })
          )
        )
    )
  );
  return {
    success: true,
    res: data,
    url: `https://item.jd.com/${skuId}.html`
  };
}

export async function getFloorCoupons(url: string) {
  await goGetCookie(url);
  var items = await queryFloorCoupons(url);
  return wrapItems(
    Promise.all(
      items.map(_items =>
        Promise.all(
          _items.map(item =>
            executer(() =>
              obtainFloorCoupon({
                key: item.key,
                level: item.level
              })
            )
          )
        )
      )
    )
  );
}

export async function getActivityCoupons(url: string) {
  var { items, simpleCoupons } = await queryActivityCoupons(url);
  var activityId = /(\w+)\/index.html/.exec(url)![1];
  simpleCoupons.forEach(url => {
    setting.req.get(url);
  });
  return wrapItems(
    Promise.all(
      items.map(item =>
        executer(() =>
          obtainActivityCoupon({
            discount: item.discount,
            limit: item.limit,
            activityId,
            actKey: item.cpId,
            args: item.args,
            scene: item.scene,
            childActivityUrl: encodeURIComponent(url)
          })
        )
      )
    )
  );
}

export async function resolveUrl(url: string) {
  if (!url.startsWith("https://u.jd.com/")) {
    /* if (url.startsWith('https://wq.jd.com/item/view')) {
      let id = /sku=\d+/
    } */
    return url;
  }
  let html: string = await request.get(url, {
    // encoding: null
    gzip: true
  });
  let hrl = /var hrl='([^']+)/.exec(html)![1];
  let p = request.get(hrl, {
    followRedirect: false
  });
  await p.catch(() => {});
  let l = p.response!.headers.location!;
  if (
    /^https?:\/\/(?!=www|order|trade|cart|home|mall|bean)\w+\.jd\.com/.test(l)
  ) {
    html = await setting.req.get(l);
    if (/var shopId = "(\d+)";/.test(html)) {
      return `https://shop.m.jd.com/?shopId=${RegExp.$1}`;
    }
  }
  return l;
}

export function getGoodsUrl(skuId: string) {
  return `https://item.m.jd.com/product/${skuId}.html`;
}

export async function reqJsonpData(url: string, qs?: any) {
  var text = await setting.req.get(url, {
    qs,
    headers: {
      Referer:
        "https://wqs.jd.com/my/fav/goods_fav.shtml?ptag=7155.1.8&sceneval=2"
    }
  });
  var { iRet, errMsg, data } = getJsonpData(text);
  if (Number(iRet) !== 0) {
    throw new Error(errMsg);
  }
  return data;
}
