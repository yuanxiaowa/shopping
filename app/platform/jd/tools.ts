import request = require("request-promise-native");

import {
  getGoodsInfo,
  queryGoodsCoupon,
  obtainGoodsCoupon,
  queryFloorCoupons,
  obtainFloorCoupon,
  queryActivityCoupons,
  obtainActivityCoupon,
  goGetCookie
} from "./goods";
import { delay } from "../../../utils/tools";

export const executer = (() => {
  var handlers: (() => any)[] = [];
  var pending = false;
  async function start() {
    if (pending === true) {
      return;
    }
    pending = true;
    while (handlers.length > 0) {
      await handlers.shift()!();
      await delay(1000 + Math.random() * 1500);
    }
    pending = false;
  }
  return function(handler: () => any) {
    var p = new Promise(resolve => {
      handlers.push(() => resolve(handler()));
    });
    start();
    return p;
  };
})();

async function wrapItems(p: Promise<any[]>) {
  var res = await p;
  return {
    success: true,
    res
  };
}

export async function getGoodsCoupons(skuId: string) {
  var item = await getGoodsInfo(skuId);
  var coupons = await queryGoodsCoupon({
    skuId,
    vid: item.venderID,
    cid: item.category[item.category.length - 1]
  });
  return wrapItems(
    Promise.all(
      coupons.map(item =>
        executer(() =>
          obtainGoodsCoupon({
            roleId: item.roleId,
            key: item.key
          })
        )
      )
    )
  );
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
  var items = await queryActivityCoupons(url);
  var activityId = /(\w+)\/index.html/.exec(url)![1];
  return wrapItems(
    Promise.all(
      items.map(_items =>
        Promise.all(
          _items.map(item =>
            executer(() =>
              obtainActivityCoupon({
                activityId,
                args: item.args,
                scene: item.scene,
                childActivityUrl: encodeURIComponent(url)
              })
            )
          )
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
    followRedirect: false,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
    }
  });
  await p.catch(() => {});
  let l = p.response!.headers.location!;
  return l;
}
