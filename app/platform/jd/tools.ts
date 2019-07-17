import request = require("request-promise-native");

import {
  getGoodsInfo,
  queryGoodsCoupon,
  obtainGoodsCoupon,
  queryFloorCoupons,
  obtainFloorCoupon,
  queryActivityCoupons,
  obtainActivityCoupon
} from "./goods";

export async function getGoodsCoupons(skuId: string) {
  var item = await getGoodsInfo(skuId);
  var coupons = await queryGoodsCoupon({
    skuId,
    vid: item.venderID,
    cid: item.category[item.category.length - 1]
  });
  return Promise.all(
    coupons.map(item =>
      obtainGoodsCoupon({
        roleId: item.roleId,
        key: item.key
      })
    )
  );
}

export async function getFloorCoupons(url: string) {
  var items = await queryFloorCoupons(url);
  return Promise.all(
    items.map(_items =>
      Promise.all(
        _items.map(item =>
          obtainFloorCoupon({
            key: item.key,
            level: item.level
          })
        )
      )
    )
  );
}

export async function getActivityCoupons(url: string) {
  var items = await queryActivityCoupons(url);
  var activityId = /(\w+)\/index.html/.exec(url)![1];
  return Promise.all(
    items.map(_items =>
      Promise.all(
        _items.map(item =>
          obtainActivityCoupon({
            activityId,
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
