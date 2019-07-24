import request = require("request-promise-native");
import iconv = require("iconv-lite");
import signData from "./h";
import {
  getCookie,
  logFileWrapper,
  getJsonpData,
  delay,
  createScheduler
} from "../../../utils/tools";
import {
  transformMobileGoodsInfo,
  getMobileCartList
} from "./mobile-data-transform";
import moment = require("moment");
import { config } from "../../common/config";
import { ArgOrder } from "../struct";
import cheerio = require("cheerio");
import qs = require("querystring");
import { newPage } from "../../../utils/page";
import { getComment } from "../comment-tpl";

var req: request.RequestPromiseAPI;
var cookie = "";
var logFile = logFileWrapper("taobao");
var mteeInfo = {
  mteeAsac: "1A19322J4Z3PLXO583LRB6",
  mteeType: "sdk",
  mteeUa:
    "118#ZVWZzwoQWZOMce1AcZ2C2ZZTZeeh2Z3PZe2x1zqTzHRzZyCZXoTSOE2zZCmQVHR4Zg2ZOzqTzfQZZZZZyUTctZxv2ic2vggVZZZuusqhzeWZZZZ/VoTXlZ2Z2Z+hyGeaZZZ1ZsiTzeWzZgFZVoqaYH2zZZ+TXHWVZgZZZsqTzeRzZZZ/Voq4zeZzZewiXHWVZgYmZzqXugQzAgZ+13uiEMgZAYuKXd/OqQHJZCuD2VjFDmBX0C2chjPmY26t+uqvOHMh/9AaugZCmrDtKHZzhSb7VjJOheZTtBs5MfQ16oArfK5BsYqKD1184zinpXcsW+SGYAuaz67WTu+xQWzBUeNthJxTVO/OdITR/qhhsVAK6bw7pmnFRiO2gto4LFW+L6qXg47/ENel0VQN2kE03NZgMMrQdmdvraOVFlk/H2HpbwVQtqir2dohTjEvB9R6Ke2BApCluW8SVnqQqQFp2xph96B2ffyd4OrysMsMvaNRAh7Rh1Sa5+a0n7h9Nq90SSJJq+YI+T2kuCiQ7mmvJWLvo2xzhUd0K2p5By38syqGNJPF9LOEJavnVIqe/8vFhIAcEsG/QN2qlDCWkp3h6VsVuWKjRi2I8foq4tVGNBxffzAoWqfQTDFijzCZXp5uv1WDulAqQjqe1oAhqhUa0B7uSMz4q1upLZr7EEZYrKffq9dE8fLod9cybaR9cEZ6oyDBCttgvsSGY1OlOakcl/Y++eMWwgNoCC3Wg8XnO6eWvoTX6oqIJ0ODfQhK1phwmcLs8g/YoUFi7eVWWYWvNtb9LJlXBO4On7HiWAbH/rcED1sjC63hfNEJTK9ePmoZs0hFZNJvzFhznsV/C70C0DjCBOV+WCJTTDpYoP/LEfQbRpRHAB5UfZIRSFZgYAKd6djO3hfSolSenQ1WDpuC1WfJMpoSNa4jj4fL6tvWG36B0ql/kG4TID1KKPiI9r8KoRdgkI/U3n4IUVGgHJXC5A+eZh5RmjYo5kJppMDWQ6YuJtNqSFRZLXMwKdEtUjpl2nAs1PD4JuIOAGSpzJOw/rmeFEmWoWs4CmWiG+Y5VtIu3z9VqChym6YYTdeQ6R7e1c8ednj7ppetA0XuL8XNXz/AB0uCr7yGYdYPs3gjWx+wNK+wfEGxJRW0lsF64B0iFw++ciqIKhqt2EbaqMNzLiV3FHwLwy0VF8OegMIcX46igQkn5xfkrwO4kTF4c+F4QZKlJGC55aeKpKAkMsGFqQ+wFlRLZn4I+mFkJKoBN4HE+mNkasj+r7WFsQ3voJklRjLYyyNtjfTFnz9xW1FerxD/yOwx8Kc5rmWlKFSv7V5980z9kw5aHedoaX/vrILcugZSvLxTD/4RVTK7b70JB0PCJh5pOLPsrBaUs8mup/zbO1GwVD+ckUJlyBVQHFJn4IAh3SMRQhvZCHPYwCcww5Llswe1ziLEUMUHZEKQaRTN31MZwcj/R5GISZk+t7sFIW3WriuoIRPUW+owiEHU4zti8Zs9dctB2Vg5yE5Um/ujdjAaau28rzm+OCJwn+1J9UfCQj5mk3FccKwLFM6fSqUQrKU6UINbSZZUv7cXq3B3L2fT8WRCvsXTABH3/VkF2vENTW2rGkeon+l5ifriuammRyitrbI36s1Dkxv/2p+I6ZQQi+ybrcdBIOOZptSDHNkZZrNUkVpAVeU+pTQq5gqwM2oS4lO63qSfmll4Jwnv15cZH4S34R6WG8a8LHFFk4muSDjEFlCbAWdRPdr6PJXqoEiPu9h8HUd8ZGpfLuya3R7qw6++LAO6WfC93+8r9TXB58dqpgf2g2thao3311tinHBhzniQWTQLpab1TmsHEYRwr2WODuLwNnSHHcBlTVaGUziBRMWN0UEOGlFWDRiovNGNEFujZsggZpomiNbGaOS+fpVAxxVwedPoUlcV",
  ulandSrc: "201_11.230.188.217_8942114_1563529853358",
  umidToken: "T1B909C1008F917EC23F10509E607EFB7EF74F21A9C621A9A956FAEDC63"
};
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
  voucher: true,
  redEnvelope: true,
  postageInsurance: true
};
async function requestData(
  api: string,
  data: any,
  method: "get" | "post" = "get",
  version = "6.0",
  ttid = "#b#ad##_h5"
) {
  var t = Date.now();
  var data_str = JSON.stringify(data);
  var form: any;
  var token = getCookie("_m_h5_tk", cookie);
  token = token && token.split("_")![0];
  var qs: any = {
    jsv: "2.4.7",
    appKey,
    api,
    v: version,
    type: "originaljson",
    ecode: 1,
    dataType: "json",
    t,
    ttid,
    AntiFlood: true,
    LoginRequest: true,
    H5Request: true
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
    `https://h5api.m.taobao.com/h5/${api}/${version}/`,
    {
      method,
      qs,
      form
    }
  );
  var { data, ret } = JSON.parse(text);
  var arr_msg = ret[ret.length - 1].split("::");
  var code = arr_msg[0];
  var msg = arr_msg[arr_msg.length - 1];
  if (code !== "SUCCESS") {
    let err = new Error(msg);
    err.name = code;
    logFile(text, "_err-" + api);
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
      // 0:可领取 6:已失效 9:已领过
      couponStatus: "0" | "6" | "9";
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
  var _couponStatus = Number(couponStatus);
  if (_couponStatus === 0) {
    promises.push(
      (async () => {
        var res = await requestData(
          "mtop.alimama.union.hsf.app.coupon.apply",
          Object.assign(
            {
              couponKey
            },
            mteeInfo
          ),
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
  } else {
    success = _couponStatus === 9;
  }
  var _rightsStatus = Number(rightsInstance.rightsStatus);
  if (_rightsStatus === 0) {
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
  } else if (_rightsStatus !== 5) {
    success = false;
  }
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  return {
    success,
    url: getGoodsUrl(itemId),
    msg
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
      variableMap: JSON.stringify(
        Object.assign(
          {
            couponKey,
            af: "1",
            pid,
            st: "39",
            ulandSrc: "201_11.1.228.74_6456882_1563377267124",
            itemId,
            mteeAsac: "1A19322J4Z3PLXO583LRB6",
            mteeType: "sdk"
          },
          mteeInfo
        )
      ),
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

/**
 * 领取内部店铺券
 * @param url
 * @example https://uland.taobao.com/quan/detail?ut_sk=1.XSfi5EEpzUIDAD46j6ev8P7T_21380790_1563514793271.TaoPassword-QQ.windvane&imsi=460011598911726&__share__id__=1&share_crt_v=1&sellerId=2200827691658&xi=592229907275&sourceType=other&suid=BFEA8241-BCCD-4A63-BA5E-77CE930312AC&activityId=d48fc2fa5da44d7e9ff7d81fc0784f7d&sp_tk=77%20lTTZJbVlTUXF5dGbvv6U%3D&imei=861997040593290&un=04ec1ab5583d2c369eedd86203cf18d8&ttid=10005934%40taobao_android_8.7.0
 */
export async function getInnerStoreCoupon(url: string) {
  /*
    获取状态
    mtop.alimama.union.hsf.mama.coupon.get
    {"sellerId":"2200827691658","activityId":"d48fc2fa5da44d7e9ff7d81fc0784f7d","pid":"mm_33231688_7050284_23466709"}
    {
      "message": "",
      "result": {
        "msgInfo": "coupon status not valid",
        // 0:可领 12:失效
        "retStatus": "12",
        "shopLogo": "//img.alicdn.com/bao/uploaded//d7/2d/TB1QtptRQvoK1RjSZFNSuwxMVXa.jpg",
        "shopName": "鸿星尔克outlets店",
        "shopUrl": "https://s.click.taobao.com/t?e=m%3D2%26s%3DcDhKoND6PJFw4vFB6t2Z2jAVflQIoZeptCNrm84%2FxJjdZa3YWKemDUTN71Q0pd8s2FYyuHGhGgg%2FmLO%2F5foB9eoryUtqIh4%2B4jMnl1H7sduZ4Y8JljmSnsn1Peil2YWXl0Ey3zWanW1TqyIhDoGSFVum7ZfZdxsPxBB%2F012F9lkSPClEt413j5jZQFcAPNl6"
      },
      "success": "true"
    }
   */

  var { searchParams } = new URL(url);
  var res = await requestData(
    "mtop.alimama.union.hsf.mama.coupon.apply",
    Object.assign(
      {
        sellerId: searchParams.get("sellerId"),
        activityId: searchParams.get("activityId"),
        pid: searchParams.get("pid") || "mm_33231688_7050284_23466709"
      },
      mteeInfo
    ),
    "get",
    "1.0"
  );
  logFile(res, "内部店铺优惠券");
  var success = res.success;
  var msg = "领取成功";
  var manual;
  if (!success) {
    msg = res.message;
  } else {
    let { retStatus, msgInfo } = res.result;
    retStatus = Number(retStatus);
    if (retStatus === 4) {
      manual = true;
    }
    success = retStatus === 0;
    msg = msgInfo;
  }
  return {
    success,
    msg,
    manual
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

/**
 * 频道优惠券
 * @param url
 * @example https://pages.tmall.com/wow/heihe/act/shuizhc?wh_biz=tm&ttid=201200%40taobao_iphone_8.8.0&acm=lb-zebra-388386-6780630.1003.4.6235143&pagefrom=oneshare&scm=1003.4.lb-zebra-388386-6780630.OTHER_15615208738601_6235143&spm=a21123.11972687.9691253925.1&suid=0FFFDFE8-924F-4E9B-AFC2-1521D96CF32B&sourceType=other&un=d6aaf44ab3ac122d132b0f6991806569&share_crt_v=1&sp_tk=77%20lSFV5MFlTQXcwaG%2Fvv6U%3D&cpp=1&shareurl=true&short_name=h.e7FfZnA&sm=344f29&app=chrome&ali_trackid=&e=zBTlKRBSJZzBd_r_ai1-KGpBaNgt-RghPtiOPDZF-tECwK-xSj3q_Kii75CDSRjIKSB1w8nO61xBoMXtbrXD7nUMqDuuQbYO2Hyr0OpOG9Kuhyokdt7R7vrAyWozvChN0PoPs5PAFJrAXhOyyTJuFuSKgrBmYEx8WedverPZWVri72Vq2GG5v2oTnmcQ2mGGZR8yJRJeVBdar-lV7wZHDN7qciEKDAUlh_WaoNwutL4O4Hi3kiJ34g&type=2&tk_cps_param=127911237&tkFlag=0&tk_cps_ut=2&sourceType=other&suid=9cdd01dd-80b7-4b4b-83eb-27040a65a533&ut_sk=1.XK%2BQ06Gx8KwDAHyGAUJXIrJu_21646297_1563880055513.Copy.2688
 */
export async function getPindaoCoupon(url: string) {
  // https://h5api.m.tmall.com/h5/mtop.latour2.strategy.show/1.0/?jsv=2.4.16&appKey=12574478&t=1563887122704&sign=22ba1a070d08f48bc14533c5965a668a&api=mtop.latour2.strategy.show&v=1.0&isSec=1&secType=2&timeout=5000&interval=300&mock=SkBTJf68N&jsonpIncPrefix=marketingUtils&useTes=true&type=jsonp&dataType=jsonp&callback=mtopjsonpmarketingUtils3&data=%7B%22filterCrowd%22%3A%22true%22%2C%22currentPage%22%3A1%2C%22pageSize%22%3A20%2C%22strategyCode%22%3A%221fb93af846af4545a464b32da1ca8163%22%2C%22channel%22%3A%22lafite_tmallfood%22%2C%22withItem%22%3A%22false%22%2C%22filterEmptyInventory%22%3A%22false%22%2C%22withIncrement%22%3A%22true%22%7D
  var page = await newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3835.0 Mobile Safari/537.36"
  );
  await page.goto(url);
  var eles = await page.$$(".svelte-1k4joht.c39");
  let h = 0;
  let now_h = new Date().getHours();
  for (let i of [10, 15, 20, 24]) {
    if (now_h < i) {
      h = i;
      break;
    }
  }
  await delay(moment(h, "h").diff() - 100);
  await page.reload();
  eles.forEach(ele => {
    ele.click();
  });
  getPindaoCoupon(url);
  /* var p1 = req.post(
    "https://wgo.mmstat.com/tmall_interaction.fotocoupon.lottery",
    {
      json: {
        gmkey: "CLK",
        gokey: encodeURIComponent(
          qs.stringify({
            module: "fotocoupon",
            ownerId: "2200611788315",
            actId: "12750",
            playMethodId: "1549",
            action: "join",
            _hng: "CN%7Czh-CN%7CCNY%7C156",
            jsver: "aplus_wap",
            lver: "8.6.10",
            pver: "undefined",
            cache: "864846f",
            _slog: "0"
          })
        ),
        cna: "Zx73FIp3JVUCAXLYX3jF+aoY",
        "spm-cnt": "a21123.13070534.0.0.6c5531bbJZ8lO1",
        logtype: "2"
      }
    }
  );
  var p2 = req.post(
    "https://wgo.mmstat.com/bp_get_coupon.bp_get_coupon.bp_get_coupon",
    {
      json: {
        gmkey: "EXP",
        gokey: encodeURIComponent(
          qs.stringify({
            benefitId: "undefined",
            itemIds: "",
            channel: "lafite_tmallfood",
            scm: "undefined",
            pvid: "undefined",
            _hng: "CN%7Czh-CN%7CCNY%7",
            jsver: "aplus_wap",
            lver: "8.6.10",
            pver: "undefined",
            cache: "96618aa",
            _slog: "0"
          })
        ),
        cna: "Zx73FIp3JVUCAXLYX3jF+aoY",
        "spm-cnt": "a21123.13070534.0.0.6c5531bbJZ8lO1",
        logtype: "2"
      }
    }
  );
  await Promise.all([p1, p2]); */
}

export async function getChaoshiGoodsList(args) {
  var q = args.keyword;
  delete args.keyword;
  var buf = await req.get("https://list.tmall.com/chaoshi_data.htm", {
    qs: Object.assign(
      {
        p: 1,
        user_id: 725677994,
        q,
        cat: 50514008,
        sort: "p",
        unify: "yes",
        from: "chaoshi"
      },
      args
    ),
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    },
    encoding: null
  });
  var text = iconv.decode(buf, "gb2312");
  var { srp, status } = JSON.parse(text);
  if (status.success) {
    return srp;
  }
  throw new Error("出错了");
}

export async function getGoodsList(data: any) {}

export async function getGoodsListCoudan(data: any) {
  var page = data.page;
  var q = data.keyword;
  delete data.page;
  delete data.keyword;
  var qs = Object.assign(
    {
      page_size: "20",
      sort: "p",
      q,
      page_no: page,
      callback: "jsonp_20135"
    },
    data
  );
  var text: string = await req.get(
    "https://list.tmall.com/m/search_items.htm",
    {
      // page_size=20&sort=s&page_no=1&spm=a3113.8229484.coupon-list.7.BmOFw0&g_couponFrom=mycoupon_pc&g_m=couponuse&g_couponId=2995448186&g_couponGroupId=121250001&callback=jsonp_90716703
      qs,
      headers: {
        referer: "https://list.tmall.com/coudan/search_product.htm"
      }
    }
  );
  var { total_page, item } = getJsonpData(text);
  return {
    total: total_page,
    page,
    items: item
  };
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
    if (res.quantity === 0) {
      throw new Error("无库存了");
    }
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
    "post",
    "3.1"
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

function transformOrderData(orderdata: any, args: ArgOrder<any>) {
  var {
    data,
    linkage,
    hierarchy: { structure, root }
  } = orderdata;
  var invalids = structure[root].filter(name => name.startsWith("invalid"));
  if (invalids.length > 0) {
    throw new Error("有失效宝贝");
  }
  var realPay = data.realPay_1;
  if (typeof args.expectedPrice === "number") {
    if (Number(args.expectedPrice) < Number(realPay.fields.price)) {
      throw new Error("价格太高了，买不起");
    }
  }
  var orderData = Object.keys(data).reduce(
    (state, name) => {
      var item = data[name];
      item._request = request_tags[item.tag];
      if (item.submit) {
        item.fields.value = args.other[item.tag];
        state[name] = item;
      }
      return state;
    },
    <any>{}
  );
  var dataSubmitOrder = data.submitOrder_1;
  var address = data.address_1;
  realPay.fields.currencySymbol = "￥";
  dataSubmitOrder._realPay = realPay;
  if (address) {
    let { fields } = address;
    fields.info = {
      value: fields.options[0].deliveryAddressId.toString()
    };
    fields.url =
      "//buy.m.tmall.com/order/addressList.htm?enableStation=true&requestStationUrl=%2F%2Fstationpicker-i56.m.taobao.com%2Finland%2FshowStationInPhone.htm&_input_charset=utf8&hidetoolbar=true&bridgeMessage=true";
    fields.title = "管理收货地址";
    dataSubmitOrder._address = address;
  }
  var coupon = data.coupon_3;
  if (coupon && coupon.fields.totalValue) {
    coupon.fields.value =
      "-" + Number(/￥(.*)/.exec(coupon.fields.totalValue)![1]).toFixed(2);
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
  return postdata;
}

function getTransformData(data: any) {
  function sortObj(obj) {
    return Object.keys(obj)
      .sort()
      .reduce((state, key) => {
        var item = obj[key];
        if (typeof item === "object") {
          item = sortObj(item);
        }
        state[key] = item;
        return state;
      }, {});
  }
  var params = JSON.parse(data.params);
  Object.keys(params).forEach(key => {
    var item = JSON.parse(params[key]);
    params[key] = Object.keys(item)
      .sort()
      .reduce((state, key) => {
        state[key] = item[key];
        return state;
      }, {});
  });
  return JSON.stringify(sortObj(params), null, 2);
}

async function getPageData(args: ArgOrder<any>) {
  const qs = require("querystring");
  var page = await newPage();
  await page.goto(
    `https://buy.m.tmall.com/order/confirmOrderWap.htm?` +
      qs.stringify(args.data)
  );
  await page.setOfflineMode(true);
  page.click("span[title=提交订单]");
  var req = await page.waitForRequest(req =>
    req
      .url()
      .startsWith("https://h5api.m.tmall.com/h5/mtop.trade.createorder.h5/3.0")
  );
  var data = JSON.parse(qs.parse(req.postData()).data);
  return data;
}

export async function submitOrder(args: ArgOrder<any>) {
  var r = Date.now();
  console.time("订单结算" + r);
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
    data1 = await requestData(
      "mtop.trade.buildorder.h5",
      args.data,
      "post",
      "3.0"
    );
  } catch (e) {
    console.error("获取订单信息出错", e);
    if (e.name === "FAIL_SYS_TRAFFIC_LIMIT" || e.message.includes("被挤爆")) {
      console.log("太挤了，正在重试");
      return submitOrder(args);
    }
    throw e;
  }
  console.timeEnd("订单结算" + r);
  console.log("-------------已经进入手机订单结算页-------------");
  logFile(data1, "手机订单结算页");
  console.log("-------------进入手机订单结算页，准备提交-------------");
  var postdata = transformOrderData(data1, args);
  logFile(postdata, "订单结算页提交的数据");
  /* writeFile("a1.json", getTransformData(postdata));
  writeFile("a2.json", getTransformData(await getPageData(args))); */
  if (!config.isSubmitOrder) {
    return;
  }
  try {
    r = Date.now();
    console.time("订单提交" + r);
    let ret = await requestData(
      "mtop.trade.createorder.h5",
      postdata,
      "post",
      "3.0"
    );
    logFile(ret, "手机订单提交成功");
    console.log("----------手机订单提交成功----------");
    console.timeEnd("订单提交" + r);
  } catch (e) {
    if (
      e.message.includes("对不起，系统繁忙，请稍候再试") ||
      e.message.includes("被挤爆")
    ) {
      console.log(e.message);
      console.log(e.message, "正在重试");
      return submitOrder(args);
    }
    throw e;
  }
}

export function comment(args: any): Promise<any> {
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
  return Promise.all(args.orderIds.map(commentOrder));
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

export async function getCoupons({ page }: { page: number }) {
  var buf: Buffer = await req.get(
    "https://taoquan.taobao.com/coupon/list_my_coupon.htm",
    {
      qs: {
        sname: "",
        ctype: "44,61,65,66,247",
        sortby: "",
        order: "desc",
        page
      },
      encoding: null
    }
  );
  var html: string = iconv.decode(buf, "gb2312");
  var $ = cheerio.load(html);
  var items = $(".tmall-coupon-box:not(.tmall-coupon-out)")
    .not(".tmall-coupon-used")
    .map((index, ele) => {
      var $ele = $(ele);
      var $detail = $(ele).find(".key-detail");
      var title = $detail.text().trim();
      var limit = $ele
        .find(".limit-text")
        .text()
        .trim();
      var time = $detail
        .next()
        .text()
        .trim();
      var url = $ele.find(".btn").attr("href");
      var arr = /满(.*?)可使用(.*?)元/.exec(title)!;
      return {
        title,
        limit,
        time,
        url,
        params: qs.parse(url.substring(url.indexOf("?") + 1)),
        quota: arr[1],
        price: arr[2]
      };
    })
    .get();
  var total = Number(
    $(".vm-page-next")
      .prev()
      .text()
  );
  return {
    page,
    total,
    items
  };
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

export async function commentList(type: number, page = 1) {
  var {
    data: { group, meta }
  } = await requestData(
    "mtop.order.queryboughtlist",
    {
      appName: "tborder",
      appVersion: "1.0",
      tabCode: "waitRate",
      page
    },
    "get",
    "4.0",
    "##h5"
  );
  let items = group.map(obj => {
    let id = Object.keys(obj)[0];
    let list = obj[id].filter(
      ({ cellType, cellData }) => cellType === "sub" && cellData[0].fields.pic
    );
    let title = list.map(({ cellData }) => cellData[0].fields.title).join(",");
    let img = list[0].cellData[0].fields.pic;
    let url = list[0].cellData[0].fields.pic;
    return {
      id,
      items: [
        {
          id,
          title,
          img,
          url
        }
      ]
    };
  });
  return {
    items,
    page,
    more: page < Number(meta.page.fields.totalPage)
  };
}

const executer = createScheduler();

export async function commentOrder(orderId: string) {
  var {
    mainOrderRateInfo: { saleConsignmentScore, serviceQualityScore },
    subOrderRateInfos
  } = await requestData(
    "mtop.order.getOrderRateInfo",
    {
      orderId
    },
    "get",
    "1.0"
  );
  var items = subOrderRateInfos.map(item => {
    var ret: any = {
      key: item.key,
      feedback: getComment(),
      rateAnnoy: "1",
      ratePicInfos: [item.auctionInfo.auctionPicUrl]
    };
    if (item.orderMerchandiseScore) {
      ret.orderMerchandiseScore = "5";
    }
    if (item.rateResult) {
      ret.rateResult = "1";
    }
    return ret;
  });
  return executer(() =>
    requestData(
      "mtop.order.doRate",
      {
        mainOrderRateInfo:
          '{"serviceQualityScore":"5","saleConsignmentScore":"5"}',
        subOrderRateInfo: JSON.stringify(items),
        orderId
      },
      "get",
      "3.0"
    )
  );
}
