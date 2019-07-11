import { getJinguoDayWork, signJinguo, getLottery } from "./jd/jinrong";
import { logReq } from "./utils/tools";
import request = require("request-promise-native");
import { writeFile } from "fs-extra";
import iconv from "iconv-lite";

const log = p => p.then(console.log);

// log(getLottery());
// request
//   .get(
//     "https://cart.taobao.com/cart.htm?spm=a21bo.2017.1997525049.1.5af911d95m9pSa&from=mini&ad_id=&am_id=&cm_id=&pm_id=1501036000a02c5c3739",
//     {
//       transform(body: Buffer, { headers }) {
//         var ctype = headers["content-type"]!;
//         if (/charset=(\w+)/i.test(ctype)) {
//           if (RegExp.$1 && RegExp.$1.toLowerCase() !== "utf-8") {
//             return iconv.decode(body, RegExp.$1);
//           }
//         }
//         return String(body);
//       },
//       encoding: null,
//       headers: {
//         // cookie:
//         //   "isg=BMbGryKt580BlbMshjs9tTzzF7zkNyJF8semkrDvsunEs2bNGLda8azDi67aGwL5; cookie17=W80qN4V3GqCv; _nk_=yuanxiaowaer; existShop=MTU2MjExNzQ5Nw%3D%3D; tracknick=yuanxiaowaer; cookie1=Vv6bWmeYv86mmEqDzTiNqknTnpFlk5e11%2BTyi5eXquQ%3D; publishItemObj=Ng%3D%3D; skt=9b2c440e8baeeaa2; sg=r8d; unb=842405758; _mw_us_time_=1562117453754; uc3=vt3=F8dBy34eMwM3EpQw7VU%3D&id2=W80qN4V3GqCv&nk2=Gh6VT7X9cESW5Bav&lg2=VFC%2FuZ9ayeYq2g%3D%3D; _tb_token_=VCP3rxEHGhT1nWAjoBZW; t=9575d60b26137373e930c1f87cbc73fe; _m_h5_tk=130942bb15279eaa363c053926ee6d07_1562062040515; cna=Y1SgFSIUjAYCAbR1oOKT3DUa; mt=ci=23_1&np=; miid=702102091220127220; x=e%3D1%26p%3D*%26s%3D0%26c%3D0%26f%3D0%26g%3D0%26t%3D0%26__ll%3D-1%26_ato%3D0; _m_h5_tk_enc=e3f4e3dcbd2ce9a15f73dccb2a2e66f4; cookie2=183d4922991b79ddb849cd327465fd56; _cc_=WqG3DMC9EA%3D%3D; tg=0; thw=cn; enc=nWiArCLT6ORvzZqeKYu68SBnWEf1pf55wgjB58L2pvYGqHwUXq4GhLr06YNL9u7N3ebMC1kR%2BU0IfLNI5vOxag%3D%3D; dnk=yuanxiaowaer; lgc=yuanxiaowaer; l=bBECps_cqNwgNYJ2BOCwiQKfMu_OSIRAguSJG2TWi_5CP6Y1i4QOkvHXiFv6VjfR_BYBq-YhSFe9-etuG; uc1=cookie16=WqG3DMC9UpAPBHGz5QBErFxlCA%3D%3D&cookie21=U%2BGCWk%2F7p4sj&cookie15=VFC%2FuZ9ayeYq2g%3D%3D&existShop=false&pas=0&cookie14=UoTaGqyjwWC5Mg%3D%3D&tag=8&lng=zh_CN; _l_g_=Ug%3D%3D; csg=34758d35; v=0"
//       }
//     }
//   )
//   .then(body => {
//     writeFile("a.html", body);
//   });

request
  .post(
    "https://buy.tmall.com/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined",
    {
      headers: {
        "Accept-Encoding": "br, gzip, deflate",
        Cookie:
          "isg=BHd3GFma5moU-2Lb3zBcGlV4BmttLGM6C7xXxckkk8ateJe60Qzb7jVaWpmDkCMW; _m_h5_tk=759a949ac45602b7cf54705a14700f8d_1562644541488; cookie17=W80qN4V3GqCv; _nk_=yuanxiaowaer; existShop=MTU2MjYzNDQ1OQ%3D%3D; v=0; csg=6cb0d328; tracknick=yuanxiaowaer; cookie1=Vv6bWmeYv86mmEqDzTiNqknTnpFlk5e11%2BTyi5eXquQ%3D; publishItemObj=Ng%3D%3D; skt=c5c6fea8bbd940b8; sg=r8d; unb=842405758; uc3=vt3=F8dBy3%2F6%2BQvDn1nPYUA%3D&id2=W80qN4V3GqCv&nk2=Gh6VT7X9cESW5Bav&lg2=U%2BGCWk%2F75gdr5Q%3D%3D; _tb_token_=739e1aee75e0e; UM_distinctid=16bc013bffabb6-027063aa63256e-591d3314-1fa400-16bc013bffbaec; cna=Y1SgFSIUjAYCAbR1oOKT3DUa; mt=ci=27_1&np=; miid=702102091220127220; x=e%3D1%26p%3D*%26s%3D0%26c%3D0%26f%3D0%26g%3D0%26t%3D0%26__ll%3D-1%26_ato%3D0; _m_h5_tk_enc=d92dbb87f88a9c8fd5b51d2d2912b3f9; cookie2=104a8e49284a3720799a98c562090f82; _cc_=VFC%2FuZ9ajQ%3D%3D; tg=0; thw=cn; enc=nWiArCLT6ORvzZqeKYu68SBnWEf1pf55wgjB58L2pvYGqHwUXq4GhLr06YNL9u7N3ebMC1kR%2BU0IfLNI5vOxag%3D%3D; dnk=yuanxiaowaer; l=cBECps_cqNwgNJKoKOCwiQKfMu_OSIRAguSJG2TWi_5pK6LsxA_Ok0nSzFp6VjXd9a8Bq-YhSFe9-etkig7l3zHe4UT1.; _l_g_=Ug%3D%3D; uc1=cookie16=VFC%2FuZ9az08KUQ56dCrZDlbNdA%3D%3D&cookie21=WqG3DMC9Fbxq&cookie15=UtASsssmOIJ0bQ%3D%3D&existShop=false&pas=0&cookie14=UoTaGqtNSiua5Q%3D%3D&tag=8&lng=zh_CN; lgc=yuanxiaowaer;t=9575d60b26137373e930c1f87cbc73fe",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
      },
      gzip: true,
      encoding: null,
      qs: {
        spm: "a220l.1.a22016.d011001001001.undefined",
        submitref: "0a67f6"
      },
      form: {
        _tb_token_: "739e1aee75e0e",
        action: "order/multiTerminalSubmitOrderAction",
        event_submit_do_confirm: "1",
        input_charset: "utf-8",
        authYiYao: "",
        authHealth: "",
        F_nick: "",
        praper_alipay_cashier_domain: "cashierstl",
        hierarchy:
          '{"structure":{"confirmOrder_1":["stepbar_1","invalidGroup_2","frontTrace_1","ncCheckCode_ncCheckCode1"],"invalidGroup_2":["order_2095840818"],"item_c700f6e5bb806359a936de83f8e2eacd":["itemInfo_c700f6e5bb806359a936de83f8e2eacd","quantity_c700f6e5bb806359a936de83f8e2eacd","itemPay_c700f6e5bb806359a936de83f8e2eacd"],"order_2095840818":["orderInfo_16e5b42cac0ebb174da1ca762c0ffa41","item_c700f6e5bb806359a936de83f8e2eacd"]}}',
        data:
          '{"frontTrace_1":{"fields":{},"id":"1","submit":true,"tag":"frontTrace","type":"biz"},"ncCheckCode_ncCheckCode1":{"fields":{"nc":"1"},"id":"ncCheckCode1","ref":"cbf3cf8","submit":true,"tag":"ncCheckCode","type":"biz"}}',
        linkage:
          '{"common":{"compress":true,"queryParams":"^^$$Z254f10358439d76a08f1ee9b227355a6e|null{$_$}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","submitParams":"^^$$Z2b4038fec27e7f367e1de5f0c4f7bdbf1|null{$_$}H4sIAAAAAAAAAK1V4W7jNgx+F//or8K1nTiJAxRDL9cOBa5p0Es7HHCAIVt0K8SSfJKcNlf0De4x9mfYcw17jZGykybFDSiG5U9EiqQ+kh/p56AyTMKjNqsFw5O9lE0dTJ+Dpmau0kYuNw2QXNbM2jmaBtOg1DJktShYwUJnGIewrAUoF0rNoQ6tbk0J4WIvwl0SHAeq817M8KwNF4rhS/HLcdCwe/i3dxzTBdMhHhut6A2+wTiiDCU4tqemUw1P4YfbL0m42AbsYmMoJ1ldo8jBlij+9fsff//4E2XJzAocal7xLa/OPn06gDhCjLUuWU3X3x/y2TxATWvBnFkr7tW764Mea4GlKQ0wJ9T9teFgQgPfWrAunO1rbzol4ijaDZhLHkwnw2QYpeN0chzYlWi82bliRY0+wbRitYW9m89sfaB/0E2DigXbSITycXlNqLE4yqGqN8OsuubRnQJHtKBjZbS8bDCzeBKFcTwO41EUJskI0VFKYPrEEWroK03toBpxoHy73gbnV4vlF2rJITF6RrySYNcBu7EO5BvvorVCgbW92j4wA123wFwgTsLr8K6HdHFzfZVTvHx2drNEQ8rlQ7uZ68ddbXyFO9+gZMYR8sqL0TE2U1XCyK6mHpBX9027NUiQ4MG5ZnpycpD+iUd00rvnXgofnEQIB+3fxnzu0+1x+zgYkDiqeVtv89nik7oQte+TsG/SEXYOj3dgrNDqtf9t02jjbgCLL9bgcfdXfSpUgCunmz0uCAd9WZDy2CIjtBFus+XmzhCeHBiclc9IMmIq1oc9MsNnCPaS22680LuEjnfoUojv5+ilCGRPRtjKV6whOc9znJ4ScsHzWliHMkYa8KzgvORxOkpGw3iSZNEwS9NhRizIc3jKG7/IvPHz10CvbcM2BhTWulSMc4PkWcHmazB1poXjQ4vuosvLx5MuZ3ydA80Z+Jgx6Tvr3AkJXrcDE0cD6nBrnZY5rYjcOrbJmcsPmJD3eylOIvoRgauqG/OApG+tdrCTDOCdAdNTzSLXiAd7y7GTkV6/2EaesiQudJhENKlZNk6TFGsUxmHKqiyOeQaX6o6bI+L4qRRKHDGORT49YtL/ld1f4//iNMKcRgiSRUmZloPxIPOQlF8/a2G0oo1Cs8hXCb4ypNEVhH04TkZpVXIYpFUBaZQUbJJVLMkARuOoKNCwlYIv9QoUzf2IxWVFS2405jGkE84m5SQqYTwcD1gZR8EL7d2GMwd+drYbc0dI/G5Re1sDy1eCEvW01A6Z1X3jOgYKO9Mtfj1uLbxOiYNmrj2Bdz4fhS11q9wFgL/Y7ePo59vyP6+9X8/n5zdn/+viw6/h/Pq3N1uPaP+ODfeeLfWTBYUqha+8f328vOzgJT24fwDKP1ZSlggAAA==","validateParams":"^^$$c92e6e2e398bdbed6b6538be76e9d26e{$_$}H4sIAAAAAAAAAIVQwU4CMRT8l55Js5QFF26yuyQmSDYRSTyZR/uADd22aUsUCX/gZ3gxfpfxN3wrMeLBeJuZvs5M5sBWHhp8sH5bAaFw1TjNRgfmNMSV9c1877DlUkMIMzplIyZtw0HXS1gCjx4UcqlrNJE3VqHmwe68RF6dOSwE6zBz+l3lhK1XtQFK6h47zMEa/8qJYJdgOUFnTZuh9uRTS95ghDO5RRof+fj2TvDq2/DkTVaxAa2JKgyS6PvL68fzG/EG/BYjKT/95teX0+mvigPqqK0E3T4/be7zGSNlF9BfhlCvzf/7hA14VNx5DFQWYm0Nd+3evIAICzpWX/OfdkJU+QblNqc52WgFOmCHoZF+7+JN9LVZU4iYTIqyNxwOBwORZ1meJqJ7MeknZV4mZZIUopuJnhD9LCmLdJym7Hj8BBGnpAntAQAA"},"signature":"84b3c81f60fbf3dd4f72bdf00359d84e"}'
      }
    },
    (err, res) => {
      console.log(res.statusCode);
    }
  )
  .then(console.log);
