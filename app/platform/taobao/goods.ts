import request = require("request-promise-native");
import signData from "./h";
import { getCookie } from "../../../utils/tools";

var req: request.RequestPromiseAPI;
var cookie = "";

// https://h5api.m.tmall.com/h5/com.taobao.mtop.deliver.getaddresslist/2.0/?jsv=2.4.0&appKey=12574478&t=1563378313960&sign=f0e97945748477d409a623c2cf6cad16&api=com.taobao.mtop.deliver.getAddressList&v=2.0&ecode=1&type=jsonp&dataType=jsonp&callback=mtopjsonp1&data=%7B%22addrOption%22%3A%220%22%2C%22sortType%22%3A%220%22%7D

export function setReq(_cookie: string) {
  cookie = _cookie;
  req = request.defaults({
    jar: true,
    headers: {
      cookie: _cookie,
      "user-agent":
        '"Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"'
    },
    transform(body) {
      return JSON.parse(body);
    }
  });
}

setReq(
  "t=b17ba128cb87baf02481840d21f9f31f; cookie2=1f3b30f7497f8eb5bd877018dd80c334; _tb_token_=edeb7b783ff65; cna=Zx73FIp3JVUCAXLYX3jF+aoY; hng=CN%7Czh-CN%7CCNY%7C156; thw=cn; tg=0; enc=jGov4GoSfyUEFhJqC8lLDSlc8kPLH%2FxStvlRAbhyE2Vy5hWvnktaNoQnWvXpeNYSoPb0k8zE42943f%2BeLJrS7Q%3D%3D; miid=1328163568710991654; UM_distinctid=16b13dde2086f5-09dcc562d5c79-37647e03-13c680-16b13dde2097af; tracknick=yuanxiaowaer; lgc=yuanxiaowaer; v=0; publishItemObj=Ng%3D%3D; dnk=yuanxiaowaer; linezing_session=acyS6t0WS2fVC2MrcGMeX5lw_15628604449132tJf_6; mt=ci=23_1&np=; _m_h5_tk=7257a573c340f42c480c80ca277a36ad_1563379817239; _m_h5_tk_enc=79979c68e897040b37a4c2c3f28c579d; unb=842405758; uc1=cookie16=UtASsssmPlP%2Ff1IHDsDaPRu%2BPw%3D%3D&cookie21=VFC%2FuZ9aiKIc&cookie15=U%2BGCWk%2F75gdr5Q%3D%3D&existShop=false&pas=0&cookie14=UoTaG7xg9Uup3w%3D%3D&cart_m=0&tag=8&lng=zh_CN; sg=r8d; _l_g_=Ug%3D%3D; skt=58ae8cc3a26be880; cookie1=Vv6bWmeYv86mmEqDzTiNqknTnpFlk5e11%2BTyi5eXquQ%3D; csg=e65ae886; uc3=vt3=F8dBy3%2Fxg%2Boxi%2BvoD18%3D&id2=W80qN4V3GqCv&nk2=Gh6VT7X9cESW5Bav&lg2=WqG3DMC9VAQiUQ%3D%3D; existShop=MTU2MzM3MzAwNw%3D%3D; _cc_=W5iHLLyFfA%3D%3D; _nk_=yuanxiaowaer; cookie17=W80qN4V3GqCv; l=cBTJoy3HvEn1rOEDBOCanurza77OSIRYYuPzaNbMi_5Bq6T6Z97OkDc4QF96VjWd97YB40AqG929-etXZJ6ZNzJJcihN.; isg=BFVVgOb9pLtuboZBQubpIwBhZFcPUglkieMDxNf6EUwbLnUgn6IZNGPs_DKYNSEc"
);

export function getGoodsUrl(itemId: string) {
  return `https://detail.m.tmall.com/item.htm?id=${itemId}`;
}

const appKey = "12574478";
async function requestData(api: string, data: any, method = "get") {
  var t = Date.now();
  var data_str = JSON.stringify(data);
  var form: any;
  var token = getCookie("_m_h5_tk", cookie);
  token = token && token.split("_")![0];
  var qs: any = {
    jsv: "2.4.16",
    appKey,
    api: "mtop.alimama.vegas.center.flb.coupon.query",
    v: "1.0",
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
  var { data, ret } = await req(`https://acs.m.taobao.com/h5/${api}/1.0/`, {
    method,
    qs,
    form
  });
  var [code, msg] = ret[0].split("::");
  if (code !== "SUCCESS") {
    throw new Error(msg);
  }
  return data;
}

export async function getTaolijin(url: string) {
  var { searchParams } = new URL(url);
  var {
    coupon: {
      // 6:已失效
      couponStatus
    },
    couponItem: { itemId },
    rightsInstance: {
      // 5:已领过 3:已发完
      rightsStatus
    }
  } = await requestData("mtop.alimama.vegas.center.flb.coupon.query", {
    eh: searchParams.get("eh"),
    activityId: searchParams.get("activityId"),
    isMobile: true
  });

  return {
    success: true,
    url: getGoodsUrl(itemId)
  };
}

export async function getCouponEdetail(url: string) {
  var { searchParams } = new URL(url);
  var pid = searchParams.get("pid");
  var res = await requestData("mtop.alimama.union.xt.en.api.entry", {
    floorId: 13193,
    variableMap: JSON.stringify({
      e: searchParams.get("e"),
      activityId: searchParams.get("activityId"),
      pid,
      type: "nBuy"
    })
  });
  var [data] = res[res.meta.resultListPath];
  var { couponActivityId, itemId, couponKey } = data;
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
  } = await requestData("mtop.alimama.union.xt.en.api.entry", {
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
  });
  console.log(retStatus);
  return {
    success: retStatus !== 4,
    url: getGoodsUrl(itemId),
    msg
  };
}

/* getTaolijin(
  "https://uland.taobao.com/taolijin/edetail?__share__id__=1&disablePopup=true&share_crt_v=1&spm=a211b4.23403405&src=fklm_hltk&from=tool&suid=314142A8-883C-40DC-A1BF-35942AAD77A9&activityId=2d8973e12a8244d0a40222489e217801&sight=fklm&eh=OdgudzU9bO2ZuQF0XRz0iAXoB%2BDaBK5LQS0Flu%2FfbSp4QsdWMikAalrisGmre1Id0BFAqRODu10eaAILNVfJVIICW0AShlqRrwGSVh%2BekNn6D0w3zIqy6JCSedajNqGKLca%2FMHHzcWHcqzN657atZujgTFwOoHsR9pXoNEnB3r8GQASttHIRqa9oS51D%2BT%2Ft61UeQv7abqSJZ5sS%2BWPoU6DMYDOAAcFNkv53eLl54N2CEGAk2C5LfegNSpmFJzaIWWIVP3HbMF0pboj7Cd1cQ%2F47SzsQhGnVVW6yqqeGJ%2FI%3D&sp_tk=77%2BlclZtQ1lTWWJjbzDvv6U%3D&sourceType=other&un=edd7dcd5e244e22b7415b581aeef1d0d&disableSJ=1&visa=13a09278fde22a2e&union_lens=lensId%3A0b0b1f78_0c63_16bfeecf056_3e9a%3Btraffic_flag%3Dlm&ttid=201200%40taobao_iphone_8.8.0&pid=mm_115130017_72750206_13960100382&sourceType=other&suid=d8682f98-45b7-4ced-8e3e-dc5cdcd9a311&ut_sk=1.XPxqyg%2F9b3UDABYgpjofB2SA_21646297_1563362314753.TaoPassword-QQ.windvane"
).then(console.log); */
getCouponEdetail(
  "https://uland.taobao.com/coupon/edetail?e=YOamQhkx9mMGQASttHIRqbf5Z9N7hSKqLKHbu8BwQo%2Bj9UWXND5EftuQqz1uTc5MU3jGil2r0%2B%2FZLbIdLtK%2Fa9jujJ%2FgN9Zi5MS0TQxqBjMXb7FQThC3mvsnwWZGSCD41ug731VBEQm0m3Ckm6GN2CwynAdGnOngkM20EQQvoa5qE39CYibXZdwlqg42JjTi&traceId=0b88592015633693203312365e&union_lens=lensId:0b153bbd_0b65_16c0012af9f_67cb&xId=ayWegUX8NmYbhUR79FvJEvf3ZEDyY7Jf2dWwLvSozVqrjmkkM0iMm7LOi5iq50nWFhHUqd4viXRxMpreweVB1F&ut_sk=1.utdid_null_1563369321802.TaoPassword-Outside.taoketop&sp_tk=77+lVTJ4Y1lTWERvUmbvv6U="
).then(console.log);
