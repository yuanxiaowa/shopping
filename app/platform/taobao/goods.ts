import request = require("request-promise-native");
import signData from "./h";
import { getCookie, logFileWrapper } from "../../../utils/tools";
import {
  transformMobileGoodsInfo,
  getMobileCartList
} from "./mobile-data-transform";
import moment = require("moment");
import { isSubmitOrder } from "../../common/config";

var req: request.RequestPromiseAPI;
var cookie = "";
var logFile = logFileWrapper("taobao");

// https://h5api.m.tmall.com/h5/com.taobao.mtop.deliver.getaddresslist/2.0/?jsv=2.4.0&appKey=12574478&t=1563378313960&sign=f0e97945748477d409a623c2cf6cad16&api=com.taobao.mtop.deliver.getAddressList&v=2.0&ecode=1&type=jsonp&dataType=jsonp&callback=mtopjsonp1&data=%7B%22addrOption%22%3A%220%22%2C%22sortType%22%3A%220%22%7D

export function setReq(_cookie: string) {
  cookie = _cookie;
  req = request.defaults({
    jar: true,
    headers: {
      cookie: _cookie,
      "user-agent":
        '"Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"'
    }
  });
}

export function getGoodsUrl(itemId: string) {
  return `https://detail.m.tmall.com/item.htm?id=${itemId}`;
}

export function getItemId(url: string) {
  return /id=(\d+)/.exec(url)![1];
}

const appKey = "12574478";
const spm = "a222m.7628550.0.0";
const request_tags = {
  agencyPay: true,
  coupon: true,
  deliveryMethod: true,
  promotion: true,
  service: true,
  address: true,
  voucher: true
};
async function requestData(
  api: string,
  data: any,
  method: "get" | "post" = "get",
  version = "6.0"
) {
  var t = Date.now();
  var data_str = JSON.stringify(data);
  var form: any;
  var token = getCookie("_m_h5_tk", cookie);
  token = token && token.split("_")![0];
  var qs: any = {
    jsv: "2.4.16",
    appKey,
    api,
    v: version,
    type: "json",
    ecode: "0",
    dataType: "json",
    t
  };
  var sign = signData([token, t, appKey, data_str].join("&"));
  qs.sign = sign;
  if (method === "get") {
    qs.data = data_str;
  } else {
    form = {
      data: data_str
    };
  }
  var text: string = await req(
    `https://acs.m.taobao.com/h5/${api}/${version}/`,
    {
      method,
      qs,
      form
    }
  );
  var { data, ret } = JSON.parse(text);
  var [code, msg] = ret[ret.length - 1].split("::");
  if (code !== "SUCCESS") {
    let err = new Error(msg);
    err.name = code;
    throw err;
  }
  return data;
}

export async function getTaolijin(url: string) {
  var { searchParams } = new URL(url);
  var success = true;
  var msg = "";
  var eh = searchParams.get("eh");
  var resdata: {
    coupon: {
      // 0:可领取 6:已失效
      couponStatus: "0" | "6";
      couponKey: string;
    };
    couponItem: {
      itemId: string;
      clickUrl: string;
    };
    rightsInstance: {
      //  0:可以领 5:已领过 3:已发完
      rightsStatus: string;
      pid: string;
      // 红包金额
      rightsFace: string;
    };
  } = await requestData(
    "mtop.alimama.vegas.center.flb.coupon.query",
    {
      eh,
      activityId: searchParams.get("activityId"),
      isMobile: true
    },
    "get",
    "1.0"
  );
  let {
    coupon: {
      // string 0:可领取 6:已失效
      couponStatus,
      couponKey
    },
    couponItem: { itemId, clickUrl },
    rightsInstance
  } = resdata;
  logFile(resdata, "淘礼金");
  let promises: Promise<any>[] = [];
  if (couponStatus === "0") {
    promises.push(
      (async () => {
        var res = await requestData(
          "mtop.alimama.union.hsf.app.coupon.apply",
          {
            couponKey,
            asac: "1A17621S4VF9XKFZ9JX5X7",
            mteeUa:
              "118#ZVWZzm7xkziA3eIVOg2VBeZTZeghte10ZHxc9KqhzHWzZgzlVfqVagZZZZzTcG+WnuMdZJ43zg2ZZReuX5q4ze2zZe/h0HmRWnXlZsqTzHSVZgZZ0oqWTcb2ZZZTTgRVZg2CYOqhzHRZZgCZXoqVzHZzueZhVHWVZgZuTfqhzHRZZgZzbVCaYe4J2xQZrZd3uhZZAZgBz0WzqZZ1ZxzD2VjF7EMIAvuXnhEgjFVTM50zdgQZuYPAPQqZZyfLzo+VEc8ZXGtCtF8Qm9N7R9eFEvdJuq43voVr4ZbXI5aGRSoQES2/kt/MbBPDG8mcUWu7UC9YhWjzgXywEsYVmqLN3ToJ4Dztfj0ONFORVGWMOv/PlSRDVpjW5BfakmoWscRl2nCMnBRAlpp4kCJ7RC5QMEhO6OMPqQR44aYxcLKorqCkY6eCkh+2InoVt/5t8pyfPi7wtQFuavhYdeS+lxGVyQEorc4gIB0I9vI/oUA9fEx052mSWX8Azb6UsjsFM6e8TPVLXYPXpUBQAlmAdcVAQsctEeIHNh1BuCXf5zYMEddqghtLmJQ41tzS8Yiw0yVibN35vVYISQXeEN5t6+ile84QN/AOjCO7NobmT6mNYMztYV1ndC00lrngi4hjbIzt7b51TOGhxHhYbfggIT1FzASXygzJGTA2jM8XzUtouJ7/5xldPnZW2fQcF0v0CXZXqs3YXPfpcvw854QSauAEuXQ31BPek90ZRCNSubbwz4FbU+CvqQvk5FEuuV+MMg7O75vcPFMncFRa838RmKOM5Ly4pzzi3fYEo3N5nOu4nWRI+wxOVjfnXjGUDngeKOEyXuw5GnAP0WYczFi/VhMfvFn+A3rQ9PPMMYVszuUaz+UlDTM1dv6aAeUpzFA3aQewzao45a/dJemIY+NdPq+ubwIWEPk13UCjrlf0DwRwHKRVl+y1ZAXFb3S7ityI//1vAOyKXA2GYCrQkNgo0WuRzR9w4zqpvMoiK76nMv/VjC3udPZA1I0Uu8/4srp0PLuLqjK7PeZHhF4zcp+NGJ9chmoxk/HmOlvwO5zY8NW3Wh0/2hDCRjdUdI2UMwMg157LRNQPgJZ1dmIa9MbpYVPfKaLf696nJTGe1WoYv6hl8Ke+Lgc9O16Yc4tRatU3eQTZMzT6ecwduQcxNQ4fTUEVHvVtgXsH0KZOuUbqcaXFbANGJ5clr9sLQxpnGecgPLHVcnHmthhPER2Su6aM5vnW9COgPGDBjJCdp09dk4PMybfd6RoyB4iKmLjnObX6g9L9GnLOBVRd+Sf4ODiJLr+OYFDdKkjo5fbDeniYAmGQ5xvssc7jdG78SYWQ9TXEHHFBufgOrTtZfD2HbTlT5/BwJWGKgQ2fpi9Ld9B8/pJoRYm0+yXsHSjjnzvB5sFICUZobbeF1lNKyQJt0fhizOl3DMql4Rz8HEspQD46ACVWrMxlKKSaL/o5Ln6mn4/vwETWmvQ2B09vsj8BoZLFjhjME7ZGju/azAPgKOJvCKRDlZCQ6hlvqr4tT4aaZZjn0G3OUYOgYBClrvRoBU3ORG43mD3EUH==",
            umidToken:
              "T10F75B291D933B5C1A807601D6CE5783BE4555DD3B707CAB2D07191AC2"
          },
          "get",
          "1.0"
        );
        var coupon: {
          code: string;
          // 0:成功 1:买家领取单张券的限制:APPLY_SINGLE_COUPON_COUNT_EXCEED_LIMIT 5:优惠券失效或过期:COUPON_NOT_EXISTS
          retStatus: string;
          msg: string;
        } = res.result.coupon;
        logFile(coupon, "淘礼金-领优惠券");
        msg += "," + coupon.msg;
        if (coupon.retStatus !== "0") {
          if (coupon.retStatus !== "1") {
            success = false;
          }
        }
      })()
    );
    return {
      success,
      url: getGoodsUrl(itemId),
      msg
    };
  } else {
    success = false;
  }

  if (rightsInstance.rightsStatus === "0") {
    promises.push(
      (async () => {
        var res: {
          // 6:你已领过该奖励
          drawRetCode: string;
          drawRetDesc: string;
          drawRetSubCode: "19";
        } = await requestData(
          "mtop.alimama.vegas.draw",
          {
            eh,
            pid: rightsInstance.pid || "",
            asac: "1A18912HD87JTTJQQI1QKJ",
            extend: JSON.stringify({
              e: encodeURIComponent(new URL(clickUrl).searchParams.get("e")!),
              itemId,
              rightsFace: rightsInstance.rightsFace,
              scence: "wap",
              unid: searchParams.get("activityId"),
              relationId: searchParams.get("activityId"),
              activityId: searchParams.get("activityId"),
              from: searchParams.get("activityId")
            })
          },
          "get",
          "1.0"
        );
        logFile(res, "淘礼金-领礼金");
        msg += "," + res.drawRetDesc;
        if (res.drawRetCode !== "0") {
          success = false;
        }
      })()
    );
  } else if (rightsInstance.rightsStatus !== "5") {
    success = false;
  }
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  return {
    success,
    url: getGoodsUrl(itemId)
  };
}

export async function getCouponEdetail(url: string) {
  var { searchParams } = new URL(url);
  var pid = searchParams.get("pid");
  var res = await requestData(
    "mtop.alimama.union.xt.en.api.entry",
    {
      floorId: 13193,
      variableMap: JSON.stringify({
        e: searchParams.get("e"),
        activityId: searchParams.get("activityId"),
        pid,
        type: "nBuy"
      })
    },
    "get",
    "1.0"
  );
  var [data] = res[res.meta.resultListPath];
  var { couponActivityId, itemId, couponKey, retStatus } = data;
  var res = await requestData(
    "mtop.alimama.union.xt.en.api.entry",
    {
      variableMap: JSON.stringify({
        couponKey,
        af: "1",
        pid,
        st: "39",
        ulandSrc: "201_11.1.228.74_6456882_1563377267124",
        itemId,
        mteeAsac: "1A19322J4Z3PLXO583LRB6",
        mteeType: "sdk",
        mteeUa:
          "118#ZVWZzCA3/BkM6Z1z+H2C8ZZTZeghNe5QZeVfqzqTzHRzZBbZXfqbagZzZZDTaUrG1Fcpy4rhzggZZZFZVoq4zHZzueZhaVxoZZQCuxTIQ72ZueCZ0oq4ze22ZZZhZZRVZg2CuOqhzHRZZgCZXoqVzHZzueZhVHWVZgZuTfqhzHRZGeZZYiZ4zr2zC8LexedMZuQHIKiKzTLS4ezHQDzqpiAvSXiYlSmq9wJi1khe0XNw4C+8ugZCmrDtKHZzhSN7VNcFheZTtW+havmhgmkDn0eGT/TxpkDVC9xdxga6QChiQBUnd8W9aRukowAnBRYkfjE4v5tSW+DlLU5MkLX8m+LY56xirC5AUBv0z8ddaC7MbOQOWjJ9UjPgkInsgKlvjLIlYuraqfZ3euJNbLpxZUI5KomRvh/2BL/9rYgwsdO+UQKjLGwRyFxXvxbttGcqy+AQd2tysPX4PGr6r/fZTl2RjASzcJmZc0pKZLlCJW1iE0RNyeitfyzN1tc42yoJRKxWqts/wsnP9GfVY5P/D75G7vrBD5M6EUBO7ddL2yIMaGzU/sRxAxUi8nX0ytBFP/Dp/LBEFDzbpW+AN4FYBZJ2K3S6dyu1iKEbORPk5MwVL2g2bZuNybpSLKpdAEGf9PhEuJ+7SA4P70rNaZIeQHYZ5U2qDEDFM43MCIw7nCPc3t3qQuMeh8igtCR3Kv4BeAS+lc0IIdOkk7NEq874rTTI9f9JO+N62qEIW8r/Gf8vc+64qhtwJuVv4J036PSA6GvsS5Cb6xkxwCujWETyGDdSzGRFMtcrY9AOb47qXKn8hzegjoY4+4vTPNapOBUeWca3rKSKtMIyhSEnswAgl8S/JtocWA4mqHfoQcJ+mmeN5HNw3sTT+06rdFraLNOSNXdSBHEeWJrqCyJGi6DSKBX367muBdX+PpPiXuuanVkX+rIe2o81u6qDZ2gETiMWroPXhYOiW+Gmz2w1xxgkfLXhxQ3MbSuqeMGCJACdK1zBkXjGM+o8LPUsM8kJ9yr+EvgU6nCZYvLFrMW3R3ChywjJ493cWutSB8u5E4X+R+dMnv12e7893q6jwrBakFP1gbp2B7vQ0axMm1bdYevxUctZY2hYk60cCF3ZOs3+sx98urUHSytcR48xBB3HY9a4qvjXGw6VM8zfGT/xG4CtOxPpI+hDgRBh1dbePtn9qWr32Q9Ri4Utp47w6WAEqjKbDkgobXz3w+iJh00vp+KHBp5wiiRUwS8HQpae9/zHzvalY9TOyhKVeWjdRIBLzdvEtFWPHp90DXng4MqUNVzWTSdmn5bSLbAaWFXmOFeQZC5lya+3yAd/JlL2vmjy+t43PvYNpTDXUqPHKkApdsnnJ0oDvL03e5t/5v73YiXaK7sKITgFham0nOAukqR2xxbll3dhmKrofB2dVDKXPWyJWuQsWyP69uMRvTAYXYXuLobMQstu2SDFoEyKYKc1V+FgomjiYA04/qi/JDY4gYt3C9A10r/q4Hm8hnPAGTjG020mPGdnWr0zFEhaS5aU98UlSWnsAoQpOLatVfNIMG8a5pdl7JbitmNI7jMxcnGkza7Z0nqLu2Du3V/DDknuHVJAlQBgy9jjvy0g1ZhFeyjGBLtYqk7FWxbDoE6rtHpAha77FaOYUQbe0Q/UGr+17dda76/S+0j30t2uTt9H0xxlGE7GtYutsP3tYqq5QJ60n4f5jovaVCpb+2V4BiFT2pyjX0198AFezFqnmdIlWmA+dimx8CmzV2uY4ac4WxKfshGNn54+HeSFJwjO118hQ3fXn6hZixHOiWfoFxDqc8hOnjf7VIhaz1lX6LxYbxW9r3Mr37fyf10ETkDeU0F/+jTh9MIg2Y4yfOj1sLs+kYUkK7JFLjhWIoNCTTY9Pmq=",
        umidToken: "TF44A803333093064CAB6B2D37D0D5BBEE668B6B93921C9D552094C90DF"
      }),
      floorId: "13352"
    },
    "get",
    "1.0"
  );
  var {
    applyCoupon,
    recommend: {
      resultList: [
        {
          coupon: {
            // 0:成功 4:抽风 1:买家领取单张券限制
            retStatus,
            msg
          }
        }
      ]
    }
  } = res;
  logFile(res, "领取uland-优惠券");
  return {
    success: retStatus === 0 || retStatus === 1,
    url: getGoodsUrl(itemId),
    msg,
    manual: retStatus === 4
  };
}

/**
 * 领取店铺优惠券
 * @param url
 * @example https://market.m.taobao.com/apps/aliyx/coupon/detail.html?ut_sk=1.WkOnn8QgYxYDAC42U2ubIAfi_21380790_1563435732217.TaoPassword-QQ.windvane&wh_weex=false&activityId=34f80bd9595147348085dc75746beef6&ttid=201200%40taobao_iphone_8.8.0&suid=63C1E7D7-3592-4A0D-9A1C-2FB51A7333D1&spm=a2141.7631565.designer_21267326940._0_0&sellerId=2139378753&disableAB=true&utparam=%7B%22ranger_buckets%22%3A%222503%22%7D&sourceType=other&un=35fb12d24e9c47d946e6040d6f65052e&share_crt_v=1&sp_tk=77+lQUlETllTNWNBMUzvv6U=&cpp=1&shareurl=true&short_name=h.eSEEEfs&sm=1b3fe8&app=macos_safari
 */
export async function getMarketCoupon(url: string) {
  var { searchParams } = new URL(url);
  var uuid = searchParams.get("activityId");
  var sellerId = searchParams.get("sellerId");
  /* var {} = await requestData(
    "mtop.taobao.couponMtopReadService.findShopBonusActivitys",
    {
      uuid,
      sellerId,
      queryShop: true,
      originalSellerId: "",
      marketPlace: ""
    }
  ); */
  var res: {
    error: "true" | "false";
    module: {
      couponInstance: {
        // 1: 成功
        status: string;
      };
    };
  } = await requestData(
    "mtop.taobao.buyerResourceMtopWriteService.applyCoupon",
    {
      uuid,
      shortName: searchParams.get("short_name"),
      supplierId: sellerId,
      originalSellerId: "",
      marketPlace: ""
    },
    "get",
    "3.0"
  );
  logFile(res, "领取店铺优惠券");
  return {
    url: `https://shop.m.taobao.com/shop/shop_index.htm?user_id=${sellerId}&spm=a212db.index.dt_5.i2`,
    store: true,
    success: res.error === "true"
  };
}

export async function getStoreCoupon(arg: {
  sellerId: string;
  itemId: string;
}) {
  var {
    coupons
  }: {
    coupons: {
      couponList: {
        uuid: string;
      }[];
      title: string;
      // 1:店铺优惠券
      type: string;
    }[];
  } = await requestData(
    "mtop.tmall.detail.couponpage",
    { itemId: arg.itemId, source: "tmallH5" },
    "get",
    "1.0"
  );
  return Promise.all(
    coupons.map(({ couponList, type }) => {
      return Promise.all(
        couponList.map(async coupon => {
          var res: {
            applyDo: {
              enabled: boolean;
              needNewPoint: boolean;
              success: boolean;
              // 20
              title: string;
              // 满199元可用
              subtitles: string[];
            };
            success: boolean;
          } = await requestData(
            "mtop.tmall.detail.applycoupon",
            {
              couponType: type,
              sellerId: arg.sellerId,
              uuid: coupon.uuid,
              ua:
                "118#ZVWZz2pR2uwIReLCJeA1ZYquZYT4zHWzZgC2Voq4mrjZ/U8TyHRVPgZuusqhzeWZZZZZXoqVzeAuZZZh0HWWGcb/ZzqTqhZzZgZCcfq4zH2ZZZChXHWVZgZZusqhzeWZZgCuTOq4zH2ZZZY6yHW4Zg2ZZV/TzeWzZgYWxHzCADu2U0mVCEBFptEI+7Mf2wJCdvtiugZCmrDtKHZzhwA7Vtw29gZTtW+haPBAl/BlbHRdUYmEVK1Eg9gc2/1dkFwk6guLdTXIq5Rg5hwEQ1E9Evq10sgdHfZrSy1k9aEiZrHjWE8/W8qOohkD7I14yLZGALdlJ24WWeDoHuwP2lmkMzOET6Ai2zAitNWP3nMs6xwOVdey4GS2zEnPzxQAE+h1tYTahMtFIbPhD2oUeBpJViXgK7Jdkn89hYOHC9P9LVxGEQG0XNbZsr4NbT+q2qj9Iz+NH4ecUhNvmCLWwEtOL0ydW9BCLOFWEWV4gfPOV+irmvRr1MNSKF0s+Y8dyE2P6yd0iMqI+6B0EP9zdFNHCntF/WF6VjUvfADYEmkic0a6ZTBs1LuPSU0+sO0K5wAuJ4LqrO/T36EFrmCspxjxoJaytbr4xm/yHEZwleKV5edMxnv+EvpWwmF3gO6/g1UKMUIc1Brq+b3vV6+04j1rPIAo1C4gcMrMZ+XSjP1QeZYypBPGxPaGErHSutn9HWoqTFSUXGN2gyihRu93Ojc9fBgX6pykMgnbAJORjWbXMIhnBOjh3CEhufAbLlHoV6tKnqrOoCJH1vepOlUU1kWeLl4WZXkOGPismG5ASNExKq+K8NBpMDYtwpkGD40CCfdsx0oLGZBJL7yQCNHNb/5anAzdpYjJDVr5HSGLuwp3gnN6GoxjCT4mgW4twNHHKV6WaZ3rSFlNZCRknirCS6jWYWYwxiHqIti5ZWE/2zMiD8McODvLMNBNEVoVP5CsqF2km0X9feWlFGdEO9mpttlwOzbxkStbFs1zKP9cEYGarto9B0hMZbr9ZrSdY3tTE8CsiDm/VENyra9cQ5PaCrOTRjNIAKFRLTxV0t2AT7JC6X7flV2rwbnSavxUTX7BdTlyr3qzBQSbUeeLexW/DwqllrUL/RcvV8eNepRfILWDYMO6C6Xweq5O2qAyKOPtg7xeXS9FTNmD9bCvWddktsYyoRNRW/Slb2J359JmoL/YO3r8OfC67LY9x4yC8XJeoZUzvQgAcgfC9JvcnpX6PNUw5sgblCodCVBGf9AbNpZgejQLsdr6WiCYJ0ocJCqBjEp6shkYclBPpvY3vr5Te23oQ87PgCGZUoZxjfw7BvErEBPn8LWbG+F+Fkx0MdxEs70FwQTqgYWItaAIaDFkTe1ngHg6wzCOcjXJ9MCvPaaHpwkE+6W1w8nVU+ufP+VxPBxSdj25OqIEacgN7cHwWEBQZTQioVJLLduEXquhF8eASv35eiT4e0ZlmKQVXSvdA4YEW59KWDE/7PRO5CSrnSNj7Iz9OEvIwIQPgWjIABUunQ3VTqKdDDOQClunc2XI/VZJCV0d83lER7FkkDn8HxCzRB61q7LAktCwEeC6UnK9n9jYjFc8cr2JRHVS1SGqplwqEJ1Gc0xcX05tfWP71oz9S3/ZFv/Ptzhj0qJTTNmorJaRx6MZe0RPAoNToQFWOEwhAEUdI+Sz2fe6lBDdQr2ND5u1JYcEi+WFI4HTSJYjtCPXiRWJOECmop1fmHGcDYO7gBGhx9elEc3fxBcHoINoene7ZROerNiiSjGGNLok4uk3lXl0ZW5bxURKAcC3tDQ5wBTQXmLiOlFlC/okNN26yowyXlQ=",
              asac: "",
              lotteryId: "",
              source: "tmallH5"
            },
            "get",
            "1.0"
          );
        })
      );
    })
  );
}

export async function getChaoshiCoupon(url: string) {
  await req.get(
    "https://pages.tmall.com/wow/chaoshi/act/wupr?__share__id__=1&share_crt_v=1&disableNav=YES&clickid=I220_12934752281563334657389832&wh_pid=act%2Falipay-fddew&%3A1562722996_273_1814643204=&tkFlag=1&tk_cps_param=118770447&sourceType=other&sp_tk=77%2BlYTZJbFk2a0k5YlTvv6U%3D&type=2&suid=D4896C7D-775F-4FD1-83AE-CA02284E20B0&wh_biz=tm&utparam=%7B%22ranger_buckets%22%3A%223042%22%7D&e=5G5jofRaROzKHwXYt0GK7-GCrBUXRDJ7JMc6T-9QrFVy1_NmXSnu4K3G98p2zSm3QsD6q6f1XPUJnFZ9u4P0mYRqxKSGsgCT8sviUM61dt2zZ2XZRKAfeid9H6GwqKYA8lo6HDoeVZpDcdFQGwqrO5njwOJxMd6Sd6vbaT_nXo_U4vk3CD6EfpnjwOJxMd6SYXwZ6GyZXXd4MCjxSJNmpBFGSN27hbJORRq7BkT9HWmiZ-QMlGz6FQ&disableAB=true&un=dbd409acd9cb28554c6e4bed9157ce66&eRedirect=1&ttid=201200%40taobao_iphone_8.8.0&cpp=1&shareurl=true&app=chrome&ali_trackid=&tk_cps_ut=2&sourceType=other&suid=7ff09f5d-b67d-41f7-86be-cbc26ea29ace&ut_sk=1.XK%2BQ06Gx8KwDAHyGAUJXIrJu_21646297_1563378089122.Copy.chaoshi_act_page_tb&ali_trackid=2:mm_130931909_559550329_109023950193:1563379429_121_861011236"
  );
}

/* getTaolijin(
  "https://uland.taobao.com/taolijin/edetail?__share__id__=1&disablePopup=true&share_crt_v=1&spm=a211b4.23403405&src=fklm_hltk&from=tool&suid=314142A8-883C-40DC-A1BF-35942AAD77A9&activityId=2d8973e12a8244d0a40222489e217801&sight=fklm&eh=OdgudzU9bO2ZuQF0XRz0iAXoB%2BDaBK5LQS0Flu%2FfbSp4QsdWMikAalrisGmre1Id0BFAqRODu10eaAILNVfJVIICW0AShlqRrwGSVh%2BekNn6D0w3zIqy6JCSedajNqGKLca%2FMHHzcWHcqzN657atZujgTFwOoHsR9pXoNEnB3r8GQASttHIRqa9oS51D%2BT%2Ft61UeQv7abqSJZ5sS%2BWPoU6DMYDOAAcFNkv53eLl54N2CEGAk2C5LfegNSpmFJzaIWWIVP3HbMF0pboj7Cd1cQ%2F47SzsQhGnVVW6yqqeGJ%2FI%3D&sp_tk=77%2BlclZtQ1lTWWJjbzDvv6U%3D&sourceType=other&un=edd7dcd5e244e22b7415b581aeef1d0d&disableSJ=1&visa=13a09278fde22a2e&union_lens=lensId%3A0b0b1f78_0c63_16bfeecf056_3e9a%3Btraffic_flag%3Dlm&ttid=201200%40taobao_iphone_8.8.0&pid=mm_115130017_72750206_13960100382&sourceType=other&suid=d8682f98-45b7-4ced-8e3e-dc5cdcd9a311&ut_sk=1.XPxqyg%2F9b3UDABYgpjofB2SA_21646297_1563362314753.TaoPassword-QQ.windvane"
).then(console.log); */
// getCouponEdetail(
//   "https://uland.taobao.com/coupon/edetail?e=YOamQhkx9mMGQASttHIRqbf5Z9N7hSKqLKHbu8BwQo%2Bj9UWXND5EftuQqz1uTc5MU3jGil2r0%2B%2FZLbIdLtK%2Fa9jujJ%2FgN9Zi5MS0TQxqBjMXb7FQThC3mvsnwWZGSCD41ug731VBEQm0m3Ckm6GN2CwynAdGnOngkM20EQQvoa5qE39CYibXZdwlqg42JjTi&traceId=0b88592015633693203312365e&union_lens=lensId:0b153bbd_0b65_16c0012af9f_67cb&xId=ayWegUX8NmYbhUR79FvJEvf3ZEDyY7Jf2dWwLvSozVqrjmkkM0iMm7LOi5iq50nWFhHUqd4viXRxMpreweVB1F&ut_sk=1.utdid_null_1563369321802.TaoPassword-Outside.taoketop&sp_tk=77+lVTJ4Y1lTWERvUmbvv6U="
// ).then(console.log);

export async function getGoodsInfo(url: string, skus?: number[]) {
  var itemId = getItemId(url);
  /* 
    ttid: "2017@taobao_h5_6.6.0",
    AntiCreep: "true",
   */
  var data = await requestData(
    "mtop.taobao.detail.getdetail",
    { itemNumId: itemId },
    "get"
  );
  return transformMobileGoodsInfo(data, skus);
}

export async function getRawCartList() {
  return requestData(
    "mtop.trade.querybag",
    {
      exParams: JSON.stringify({
        mergeCombo: "true",
        version: "1.0.0",
        globalSell: "1",
        spm,
        cartfrom: "detail"
      }),
      isPage: "false",
      extStatus: "0",
      spm,
      cartfrom: "detail"
    },
    "get",
    "5.0"
  );
}

export async function getCartList() {
  return getMobileCartList(await getRawCartList());
}

export async function addCart(args: {
  url: string;
  quantity: number;
  skus?: number[];
}) {
  var itemId;
  var skuId;
  if (/skuId=(\d+)/.test(args.url)) {
    skuId = RegExp.$1;
    itemId = /id=(\d+)/.exec(args.url)![1];
  } else {
    var res = await getGoodsInfo(args.url, args.skus);
    skuId = res.skuId;
    itemId = res.itemId;
  }
  var { cartId } = await requestData(
    "mtop.trade.addbag",
    {
      itemId,
      quantity: args.quantity,
      exParams: JSON.stringify({
        addressId: "9607477385",
        etm: "",
        buyNow: "true",
        _input_charset: "utf-8",
        areaId: "320583",
        divisionId: "320583"
      }),
      skuId
    },
    "post"
  );
  return cartId;
}

export async function updateCart({ items }, action: string) {
  var { cartId, quantity } = items[0];
  var { hierarchy, data }: any = await getRawCartList();
  var updateKey = Object.keys(data).find(
    key => data[key].fields.cartId === cartId
  )!;
  var key = Object.keys(hierarchy.structure).find(key =>
    hierarchy.structure[key].includes(updateKey)
  )!;
  var cdata = hierarchy.structure[key].reduce((state, key) => {
    var { fields } = data[key];
    state[key] = {
      fields: {
        bundleId: fields.bundleId,
        cartId: fields.cartId,
        checked: fields.checked,
        itemId: fields.itemId,
        quantity: fields.quantity.quantity,
        shopId: fields.shopId,
        valid: fields.valid
      }
    };
    return state;
  }, {});
  cdata[updateKey].fields.quantity = quantity;
  var { cartId } = await requestData(
    "mtop.trade.updatebag",
    {
      p: JSON.stringify({
        data: cdata,
        operate: { [action]: [updateKey] },
        hierarchy
      }),
      extStatus: "0",
      feature: '{"gzip":false}',
      exParams: JSON.stringify({
        mergeCombo: "true",
        version: "1.0.0",
        globalSell: "1",
        spm,
        cartfrom: "detail"
      }),
      spm,
      cartfrom: "detail"
    },
    "post",
    "4.0"
  );
  return cartId;
}

export async function cartToggle(data: { items: any; checked: boolean }) {
  // const page = await newPage();
  // await page.goto("https://cart.taobao.com/cart.htm");
  // // await page.waitForSelector("#J_Go");
  // // @ts-ignore
  // let firstData = await page.evaluate(() => window.firstData);
  // var cartIds: string[] = [];
  // var sellerids: string[] = [];
  // var items: {
  //   cartId: string;
  //   itemId: string;
  //   skuId: string;
  //   quantity: number;
  //   createTime: number;
  //   attr: string;
  // }[] = [];
  // firstData.list.forEach((shop: any) => {
  //   shop.bundles[0].items.forEach((item: any) => {
  //     cartIds.push(item.cartId);
  //     sellerids.push(item.sellerid);
  //     items.push({
  //       cartId: item.cartId,
  //       itemId: item.itemId,
  //       skuId: item.skuId,
  //       quantity: item.amount.now,
  //       createTime: item.createTime,
  //       attr: item.attr
  //     });
  //   });
  // });
  // var data = {
  //   hex: "n",
  //   cartId: cartIds.reverse().join(","),
  //   sellerid: sellerids.join(","),
  //   cart_param: JSON.stringify({
  //     items: items.reverse()
  //   }),
  //   unbalance: "",
  //   delCartIds: cartIds.join(","),
  //   use_cod: false,
  //   buyer_from: "cart",
  //   page_from: "cart",
  //   source_time: Date.now()
  // };
  // await page.evaluate((data: any) => {
  //   var form = document.createElement("form");
  //   form.method = "post";
  //   form.action =
  //     "https://buy.tmall.com/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined";
  //   Object.keys(data).map(key => {
  //     var input = document.createElement("input");
  //     input.type = "hidden";
  //     input.value = data[key];
  //     form.appendChild(input);
  //   });
  //   document.body.appendChild(form);
  //   form.submit();
  // }, data);
  // await page.waitForNavigation();
  // if (!isSubmitOrder) {
  //   await page.setOfflineMode(true);
  // }
  // await page.click(".go-btn");
}

export async function submitOrder(data: any, other: any = {}) {
  // other.memo other.ComplexInput
  console.log("-------------开始进入手机订单结算页-------------");
  var data1;
  try {
    // {
    //   jsv: "2.4.7",
    //   appKey: this.appKey,
    //   api: "mtop.trade.buildOrder.h5",
    //   v: "3.0",
    //   type: "originaljson",
    //   timeout: "20000",
    //   isSec: "1",
    //   dataType: "json",
    //   ecode: "1",
    //   ttid: "#t#ip##_h5_2014",
    //   AntiFlood: "true",
    //   LoginRequest: "true",
    //   H5Request: "true"
    // }
    data1 = await requestData("mtop.trade.buildorder.h5", data, "post", "3.0");
  } catch (e) {
    if (e.name === "FAIL_SYS_TRAFFIC_LIMIT") {
      console.log("太挤了，正在重试");
      return submitOrder(data, other);
    }
    throw e;
  }
  console.log("-------------已经进入手机订单结算页-------------");
  logFile(data1, "手机订单结算页");
  console.log("-------------进入手机订单结算页，准备提交-------------");
  var {
    data,
    linkage,
    hierarchy: { structure, root }
  } = data1;
  var invalids = structure[root].filter(name => name.startsWith("invalid"));
  if (invalids.length > 0) {
    throw new Error("有失效宝贝");
  }
  var orderData = Object.keys(data).reduce(
    (state, name) => {
      var item = data[name];
      item._request = request_tags[item.tag];
      if (item.submit) {
        item.fields.value = other[item.tag];
        state[name] = item;
      }
      return state;
    },
    <any>{}
  );
  var submitOrder = data.submitOrder_1;
  var realPay = data.realPay_1;
  var address = data.address_1;
  realPay.fields.currencySymbol = "￥";
  submitOrder._realPay = realPay;
  if (address) {
    let { fields } = address;
    fields.info = {
      value: fields.options[0].deliveryAddressId
    };
    fields.url =
      "//buy.m.tmall.com/order/addressList.htm?enableStation=true&requestStationUrl=%2F%2Fstationpicker-i56.m.taobao.com%2Finland%2FshowStationInPhone.htm&_input_charset=utf8&hidetoolbar=true&bridgeMessage=true";
    fields.title = "管理收货地址";
    submitOrder._address = address;
  }
  var coupon = data.coupon_3;
  if (coupon && coupon.fields.totalValue) {
    coupon.fields.value = "-" + /￥(.*)/.exec(coupon.fields.totalValue)![1];
  }
  var ua = "";
  var postdata = {
    params: JSON.stringify({
      data: JSON.stringify(orderData),
      hierarchy: JSON.stringify({
        structure
      }),
      linkage: JSON.stringify({
        common: {
          compress: linkage.common.compress,
          submitParams: linkage.common.submitParams,
          validateParams: linkage.common.validateParams
        },
        signature: linkage.signature
      })
    }),
    ua
  };
  logFile(postdata, "订单结算页提交的数据");
  if (!isSubmitOrder) {
    return;
  }
  try {
    let ret = await requestData("mtop.trade.createorder.h5", postdata, "post");
    logFile(ret, "手机订单提交成功");
    console.log("----------手机订单提交成功----------");
  } catch (e) {
    if (e.message.includes("对不起，系统繁忙，请稍候再试")) {
      console.log(e.message);
      console.log("正在重试");
      return submitOrder(data, other);
    }
    throw e;
  }
}

export function comment(data: any): Promise<any> {
  /* this.req.post("", {
    form: {
      callback: "RateWriteCallback548",
      _tb_token_: "edeb7b783ff65",
      um_token: "T0eb928a011b00316c98a9fed9edb4b2b",
      action: "new_rate_write_action",
      event_submit_do_write: "any",
      sellerId: "2200811872345",
      bizOrderIdList: "492409251844405857",
      itemId492409251844405857: "591795307112",
      eventId492409251844405857: "",
      parentOrderId: "492409251844405857",
      qualityContent492409251844405857: "fdsfdsafdsaf",
      serviceContent492409251844405857: "fdsaf",
      Filedata: "",
      urls: "",
      merDsr492409251844405857: "5",
      serviceQualityScore: "5",
      saleConsignmentScore: "5",
      anony: "1",
      ishares: "",
      ua:
        "118#ZVWZz7teaQVZ0e/LdH2mpZZTZsHhce/ezeVnvsqTzHRzZRbZXoTXOrezpgqTVHR4Zg2ZOzqTze0cZgYUHDqVze2zZCFhXHvnzhtZZzu7zeRZZgZZ2Yq4zH2zgeu1THWVZZ2ZZ2HhzHRzVgzYcoqVze2ZZVbhXHJmgiguZaq2zeRZZgZZfDqVzOqZzeZ4yH1JZBD1c78nByRuZZYCXfqYZH2zZZCTcHCVx20rEfqhzHWxzZZZV5q44aPiueZhXTVHZg2ZumqTzeRzZZZuVfq4zH2ZZZFhVHW4ZZ2uZ0bTzeRzZZZZ23Z4ze2zZZuXTiXejg2ZjUi5zPErwZubQozqF00nMWTKzLQvxN9m3LIVTHjaVcjjc2L3sKqSh8gTP5S8FDpKyTHCugZCmrDtKHZzhaquuI0DRgZTlItysC/ATH+z8N2Crbz04R4GIE3fdf3gV2gbTR2B7+zF3qqMmOW3N4mlfO6N1SuNkGAumAnxsKbe43gCE87ooXXoLBK3lPdtfJk4fgNaaid3jZa5RF8Y2HhI1WMgXAaXoZuDzJi8DMJT31BZjQHGH2432fvCzMLqB2yvwTQni66GyfOOVCFmOWAV0r+PqIDp5hZ1eB5Bn+p7OMJZSthhoMbH6k0vVh9Quf4xEHzfWFoHsYEPPDKiX23KElhfshnArhpIViJU4HlG5zsJuLxlGC7bW5Oltr5xn91jM4b4w44HlbDpVR9JXL2IQRJRJDV7xegJS2PZd/mtYaf0yA7dr8hb8PGj6N4Snl9fzfvVBqKY7XK/R41in/X1d+tazXEIugNPh4B8nxoRAYgk09rbCXRmoc+ffVjbrkh9hwIywk0m/xX4aP4z0jkihzBTyLDdz3xOp7FdrIbfBA0xlcfAftRigVieQTOVzg==",
      "492409251844405857_srNameList": ""
    }
  }); */
  throw new Error("Method not implemented.");
}

export function commentList(): Promise<any> {
  throw new Error("Method not implemented.");
}

export async function seckillList(name: string) {
  if (name === "chaoshi") {
    let {
      resultValue: { data }
    } = await requestData(
      "mtop.tmall.kangaroo.core.service.route.PageRecommendService",
      {
        url:
          "https://pages.tmall.com/wow/chaoshi/act/wupr?ut_sk=1.WkOnn8QgYxYDAC42U2ubIAfi_21380790_1563192248243.Copy.chaoshi_act_page_tb&__share__id__=1&share_crt_v=1&disableNav=YES&wh_pid=act%2Fxsj23874&tkFlag=1&disableAB=true&suid=1031708C-2844-47E2-B140-3CF358C1BD43&type=2&sp_tk=77%2BlelYxOVlob1FlTkrvv6U%3D&sourceType=other&tk_cps_param=127911237&un=04ec1ab5583d2c369eedd86203cf18d8&utparam=%7B%22ranger_buckets%22%3A%223042%22%7D&e=PlboetXBlJK4bXDJ8jCpJrfVFcC6KYAblz9f5x7nqEUPJTSplvxzY6R06N4nt-6t_nNM24L0rnGF2sp581q3i4RqxKSGsgCT8sviUM61dt2gxEj7ajbEb4gLMZYNRhg2HXKHH0u77i-I6M_vqqSeLITsM14S2xgDx9iN37b51zJw2qH-L52L1aTWVSTo88aBYOGm2rjvgGhaQJhxUPUeEtKYMBXg69krrlYyo_QbwE_DG_1N5hlzNg&ttid=201200%40taobao_iphone_8.8.0&cpp=1&shareurl=true&spm=a313p.22.kp.1050196516672&short_name=h.eS0ZZuy&sm=933952&app=chrome",
        cookie: "sm4=320506;hng=CN|zh-CN|CNY|156",
        device: "phone",
        backupParams: "device"
      },
      "get",
      "1.0"
    );
    let key = Object.keys(data).find(key => data[key].secKillItems);
    if (key) {
      let secKillItems = data[key].secKillItems;
      let mapping = {};
      for (let item of secKillItems) {
        let { secKillTime } = item;
        let secKillTimeArr = secKillTime.split(",");
        secKillTimeArr.forEach(t => {
          var data = {
            id: item.itemId,
            quantity: item.itemNum,
            title: item.itemTitle,
            itemSecKillPrice: item.itemSecKillPrice,
            price: item.itemTagPrice
          };
          if (!mapping[t]) {
            mapping[t] = [data];
          } else {
            mapping[t].push(data);
          }
        });
      }
      return Object.keys(mapping)
        .sort()
        .map(time => ({
          time,
          items: mapping[time]
        }));
    }
  }
  return [];
}

export async function getSixtyCourse(actId: string) {
  var {
    answerDate,
    answered,
    courseVOList,
    sellerId,
    lotteryCount
  }: {
    answerDate?: string[];
    answered: ("true" | "false")[];
    sellerId: string;
    lotteryCount: string;
    courseVOList: {
      id: string;
      desc: string;
      options: Record<string, string>;
    }[];
  } = await requestData(
    "mtop.tmall.fansparty.sixty.getAct",
    {
      actId
    },
    "get",
    "1.0"
  );
  var finished = !answered.includes("false");
  var todayAnswered = false;
  var options = {};
  var title = "";
  var courseId = "";
  if (!finished) {
    var i = 0;
    moment.duration(1, "d");
    if (answerDate) {
      todayAnswered =
        moment().diff(
          moment(answerDate[answerDate.length - 1].split(" ")[0], "yyyy-MM-DD")
        ) <= moment.duration(1, "days").asMilliseconds();

      if (todayAnswered) {
        i = answerDate.length - 1;
      } else {
        i = answerDate.length;
      }
    }
    title = courseVOList[i].desc;
    courseId = courseVOList[i].id;
    options = courseVOList[i].options;
  }
  return {
    actId,
    finished,
    todayAnswered,
    title,
    options,
    courseId,
    sellerId,
    lotteryCount: Number(lotteryCount)
  };
}

export async function sixtyCourseList() {
  var html: string = await req.get(
    "https://pages.tmall.com/wow/fsp/act/60sclass?q=%E5%A4%A9%E7%8C%AB60%E7%A7%92%E8%AF%BE%E5%A0%82&isFull=true&pre_rn=c21dff5a538d1c77a9e5c29674eefe94&scm=20140655.sc_c21dff5a538d1c77a9e5c29674eefe94"
  );
  var r = /<textarea style="display: none" class="vue-comp-data">(.*)<\/textarea>/g;
  r.test(html);
  var text = r.exec(html)![1];
  var {
    $root: {
      moqieDataWl: { jsonStr }
    }
  } = JSON.parse(text.replace(/&quot;/g, '"'));
  var {
    content: { areas }
  } = JSON.parse(jsonStr);
  var actIds = Object.keys(areas).map(
    key => /actId=(\w+)/.exec(areas[key].data.href)![1]
  );
  return Promise.all(actIds.map(getSixtyCourse));
}

export async function sixtyCourseReply({
  actId,
  courseId,
  option,
  sellerId,
  todayAnswered,
  finished
}: {
  actId: string;
  courseId: string;
  option: string;
  sellerId: string;
  todayAnswered: boolean;
  finished: boolean;
}) {
  if (!finished && !todayAnswered) {
    await requestData(
      "mtop.tmall.fansparty.sixty.answer",
      {
        actId,
        courseId,
        option
      },
      "get",
      "1.0"
    );
  }
  var data = await requestData(
    "mtop.tmall.fansparty.sixty.getlotterytoken",
    {
      actId,
      lotteryType: "shareLottery"
    },
    "get",
    "1.0"
  );
  var token = data.result;
  var res1 = await requestData(
    "mtop.tmall.fansparty.fansday.superfansinvation.getinvitation",
    {
      sellerId,
      actId,
      token
    },
    "get",
    "1.0"
  );
  var res2 = await requestData(
    "mtop.tmall.caitlin.relation.common.follow",
    {
      targetId: sellerId,
      followTag: "fans-lucky-draw",
      source: "fans-lucky-draw",
      bizName: "fansparty"
    },
    "get",
    "1.0"
  );
  var res3 = await requestData(
    "mtop.tmall.fansparty.fansday.superfansinvation.openinvitation",
    {
      sellerId,
      actId,
      token
    },
    "get",
    "1.0"
  );
  var { awards } = res3;
  return awards;
}
