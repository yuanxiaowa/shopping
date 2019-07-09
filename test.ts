import { getJinguoDayWork, signJinguo, getLottery } from "./jd/jinrong";
import { logReq } from "./utils/tools";
import request = require("request-promise-native");
import { writeFile } from "fs-extra";
import iconv from "iconv-lite";

const log = p => p.then(console.log);

log(getLottery());
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
