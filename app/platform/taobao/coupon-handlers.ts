/*
 * @Author: oudingyin
 * @Date: 2019-07-12 15:20:58
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-15 17:44:13
 */
import { requestData, logFile, getGoodsUrl } from "./tools";
import { newPage } from "../../../utils/page";
import { delay } from "../../../utils/tools";
import moment = require("moment");
import setting from "./setting";

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
            setting.mteeInfo
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
        let retStatus = Number(coupon.retStatus);
        if (retStatus !== 0) {
          if (retStatus !== 1) {
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
  var { couponActivityId, itemId, couponKey, retStatus, nCouponInfoMap } = data;
  if (!itemId) {
    throw new Error("宝贝不见了");
  }
  var keys = [couponKey];
  if (nCouponInfoMap) {
    keys.push(nCouponInfoMap.couponKeys);
  }
  var recoveryId = `201_11.1.228.74_6456882_${Date.now()}`;
  for (let key of keys) {
    var res = await requestData(
      "mtop.alimama.union.xt.en.api.entry",
      {
        variableMap: JSON.stringify(
          Object.assign(
            {
              couponKey: key,
              af: "1",
              pid,
              st: "39",
              ulandSrc: recoveryId,
              recoveryId,
              umidToken:
                "TE31913E427F435E86363DE377D124A1A16824AFB854138DC99D70FA124",
              union_lens: searchParams.get("union_lens"),
              itemId,
              mteeAsac: "1A19322J4Z3PLXO583LRB6",
              mteeType: "sdk",
              mteeUa:
                "120#bX1bSSanxLp5FnZyySqwjzvbP6vJtVwmR7r/No8CJkKLWTNmwkCmvhlmU+AOBcmPriP/Hb87mLwtmBvP21efq0n8oBwirW68N3lNXor8/E8Ht7Qa2FPMKMaVdzqs+53n3ZoSEcL2m0KsIOKJ7vjBcFA5I4+MetpU4t+sDzyUokW6UbcelO9HrpTEb+SDknLFlAPg9GwNUK3PTC9bPXubsly6XqPhL1bV75GPN0k/b1SOyq/C0NIbbgvpNqMzybxb75QyNPc/bkL0Y1UZSkR842uVSxtkOyzBzBjHlvO12zdt4/fhn9MgIloXwclXaywNgcM+pJ/PLOGkpv450nRduYvGV6IrNcfwusoJV90ClSVupI1oFlFagxoeDdqOLuqP84PI51S3pUFdKBZT3G/oMiVFW+SHtdi+heWtnFY1D8sOzJgk1YhHEAUJEPReDTEOQrWVO1uRojTmBK/tkuxHERlRyhr0DpRU/mlMM9Vd718JCg8SXhvrhtIMf1kQJF8P6o3CNcez8/rau820YZEYK3VicIdN/u2IvrMRPwD0iymS3zXYuGVX3KMQq5HbiZ93oo4RpY0TFVh6a1niSw2CLGmX4W1fkPr9wn0i8Tv56VCW7FXgtnOfJ9vvAiArt17CpFSM1ZD4zmnNEMOULIUQrjXi96Vz9qW13VyN2iVqGWHppVJpY9kiMHK2zRAtA3dv5vMTd/P+9BvkEySK0Psu3HgNNjMTzK1b40QneDGzYxx0cavHVq8XcTpyDyq6svJRJF8eGHBJsdN/AbM9MXHiyIdOLwt9U1Qg5Hjsoj1L5wS+hXCW70WgbIuQfuSj7HUiEq1+TtsQAfkgCtofPqEawcJbdrJuyo5w5LXvDDn19JLI9Lp/tGaPrZu7vm4yJPcwdQPAZY6Zu1GwTENN7vgnrmgwTfdMjZZjyF05+xb58I5F5Wis+CHG0tfijRaDdAR93k7i/p7QyJHYZaOGXceB+SE8ylrGRrGXANgT2Tz2iEkeFBED7B1EhT26vysvpjptTD2OyyUf57TP5HqlW+pIpJjvDm0EzAXdsbY6/zV2Tjc1530eaeAY824mbVhQ1wv02/ocxVtElMukYFWjyGyyg6M3wqKTEkQyO6z9uyyOMiY8zjRKFT9a8fauIUPjGarIRZ92cDnhOrEOJwKNthrk2OD4VwDMq2manUG5+9WEqUwlALV0lgcylyfAS/lCF+GtA6s3oLUpXS8H6lnsITyMEF7evU6ZIEtuXvT+DiBg/d7c1v=="
            },
            setting.mteeInfo
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
  }

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
  var uuid = searchParams.get("activity_id") || searchParams.get("activityId");
  var sellerId = searchParams.get("seller_id") || searchParams.get("sellerId");
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
      setting.mteeInfo
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
  await setting.req.get(
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
  let h = 0;
  let now_h = new Date().getHours();
  for (let i of [10, 15, 18, 20, 24]) {
    if (now_h < i) {
      h = i;
      break;
    }
  }
  await delay(moment(h, "h").diff() - 100);
  await page.reload();
  var eles = await page.$$(".svelte-1k4joht.c39,.coupon");
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

/**
 * 万券齐发
 * @param url
 * @example https://pages.tmall.com/wow/a/act/tmall/tmc/23149/wupr?ut_sk=1.XHjcj6bn6PYDABRjm1VuVqKG_21380790_1564927387752.TaoPassword-QQ.2688&ali_trackid=2%3Amm_127911237_497650034_108804550008%3A1564927778_209_148695274&tkFlag=0&tdsourcetag=s_pctim_aiomsg&cpp=1&sm=e0dc72&share_crt_v=1&e=GCUi9AOIB5blXTPXQzkfM4E_09Tyz3Sm5acU9otCs85q-XojkTwRIqY52dVwxnwDP8zggt9XAKJ61Q5N5T-gmOfOhNFpYanTFqSBVzqLUMNomLjE96MgeJ5h_3IkxzXgV5ELjWu7uEocAT_VAGnapNrQvPRQrl_JdRPtJrnIoB45cI_t3MRA4hARmXVb0HgZYAtujJ0q93QGZ3PtzF1lKW8dib3c3EYWUDYWruCX3MoDRb1Etzp3Lw&tk_cps_ut=2&shareurl=true&short_name=h.eRi2IJf&tk_cps_param=127911237&ttid=201200%40taobao_iphone_8.8.0&spm=a211oj.13152405.7740155150.d00&wh_pid=marketing-165174&sourceType=other&sp_tk=77%2BlelFESllSQllUdFjvv6U%3D&type=2&suid=B447DA05-B9A4-41C9-B1B4-F4996E72AF6C&un=8b4b3af2c961913546e6040d6f65052e&app=chrome&ali_trackid=2:mm_130931909_605300319_109124700033:1564927915_267_918396271
 */
export async function getMulCoupons(url: string) {
  var {
    resultValue: { data, fri, sysInfo }
  } = await requestData(
    "mtop.tmall.kangaroo.core.service.route.PageRecommendService",
    {
      url,
      cookie: "sm4=320500;hng=CN|zh-CN|CNY|156",
      device: "phone",
      backupParams: "device"
    },
    "get",
    "1.0"
  );
  // 需要钱的券
  var goodsCoupons: any[] = [];
  var keys = Object.keys(data);
  keys.forEach(key => {
    if (data[key] && data[key].coupons) {
      goodsCoupons.push(...data[key].coupons);
    }
  });
  var {
    resultValue: { data }
  } = await requestData(
    "mtop.tmall.kangaroo.core.service.route.PageRecommendService",
    {
      url,
      cookie: "sm4=320500;hng=CN|zh-CN|CNY|156",
      pvuuid: sysInfo.serverTime,
      fri: JSON.stringify(fri),
      sequence: 2,
      excludes: keys.join(";"),
      device: "phone",
      backupParams: "excludes,device"
    },
    "get",
    "1.0"
  );
  return Object.keys(data).map(key => {
    if (!data[key]) {
      return;
    }
    var { items, coupons } = data[key];
    if (items) {
      // 需要分享领的券
    } else if (coupons) {
      // 店铺券
      return Promise.all(
        coupons.map(item =>
          requestData(
            "mtop.alibaba.marketing.couponcenter.applycouponforchannel",
            {
              activityId: /activityId=(\w+)/.exec(item.couponUrl)![1],
              sellerId: item.sellerId,
              ua: "",
              asac: "1A17718T967KGL79J6T03W"
            },
            "get",
            "1.0"
          ).catch(e => e)
        )
      );
    }
  });
}

function getInputValue(name: string, text: string) {
  return new RegExp(`name="${name}" [^>]*value="([^"]*)"`).exec(text)![1];
}

export async function getUnifyCoupon(url: string) {
  var html = await setting.req.get(url);
  var _tb_token_ = getInputValue("_tb_token_", html);
  var ua = getInputValue("ua", html);
  return setting.req.post(url, {
    form: {
      _tb_token_,
      ua
    },
    headers: {
      Referer: url
    }
  });
}
