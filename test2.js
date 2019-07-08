"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_native_1 = __importDefault(require("request-promise-native"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const req = request_promise_native_1.default.defaults({
    encoding: null,
    transform(buff) {
        return iconv_lite_1.default.decode(buff, "gb2312");
    },
    headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
        Cookie: "hng=CN%7Czh-CN%7CCNY%7C156; t=b17ba128cb87baf02481840d21f9f31f; _tb_token_=edeb7b783ff65; cookie2=1f3b30f7497f8eb5bd877018dd80c334; dnk=yuanxiaowaer; cna=Zx73FIp3JVUCAXLYX3jF+aoY; sm4=320506; lid=yuanxiaowaer; csa=undefined; skt=15f199f1d516fa3a; tracknick=yuanxiaowaer; lgc=yuanxiaowaer; enc=jGov4GoSfyUEFhJqC8lLDSlc8kPLH%2FxStvlRAbhyE2Vy5hWvnktaNoQnWvXpeNYSoPb0k8zE42943f%2BeLJrS7Q%3D%3D; cq=ccp%3D0; _m_h5_tk=d7fcf4e49dd085d82bfe2d5286a4f42d_1561896467912; _m_h5_tk_enc=571f81e3edb123c3938b1c1342545ed9; uc1=cookie16=URm48syIJ1yk0MX2J7mAAEhTuw%3D%3D&cookie21=UIHiLt3xThN%2B&cookie15=V32FPkk%2Fw0dUvg%3D%3D&existShop=false&pas=0&cookie14=UoTaGdU6yvFWkw%3D%3D&cart_m=0&tag=8&lng=zh_CN; uc3=vt3=F8dBy34diSNFunjBxR4%3D&id2=W80qN4V3GqCv&nk2=Gh6VT7X9cESW5Bav&lg2=WqG3DMC9VAQiUQ%3D%3D; _l_g_=Ug%3D%3D; unb=842405758; cookie1=Vv6bWmeYv86mmEqDzTiNqknTnpFlk5e11%2BTyi5eXquQ%3D; login=true; cookie17=W80qN4V3GqCv; _nk_=yuanxiaowaer; sg=r8d; csg=f15bc1cc; isg=BM_PEPzazt4ZC8tIc585jgX0XmXZ9CMWna-FdOHcaz5FsO-y6cSzZs2hsqCryPuO; l=bBOkfyOlvEkXpHQTBOCwourza77OSIRAguPzaNbMi_5dM6L_Rz7OkAIp8Fp6Vj5Rs0YB4J_NPtw9-etXw; pnm_cku822=098%23E1hvSQvUvbpvUvCkvvvvvjiPRFzyQjr8R2LUQjthPmPWAj1Pn2dwljlnR2qOzjiEiQhvCvvvpZptvpvhvvCvpvGCvvpvvPMMkphvC9hvpyjwl8yCvv9vvhhuI9bAaqyCvm9vvhCvvvvvvvvvBJZvvvCbvvCHtpvv9ZUvvhcDvvmC5pvvBJZvvUHmmphvLUUxt%2Fwa18TJ%2Bul1b8AUI2ITR7ERsX7Je3Oqb64B9Cka%2BfvsxI2pjLeARFxjKOmAdXkKNx%2FBSBh7KfEYVVzhdiGwjcBO0f06W3vOPZvCvpvVvvBvpvvv"
    }
});
// async function directBuy(url: string) {
//   var html: string = await req.get(url);
//   var pdetail = req.get("https:" + /var l,url='([^']+)/.exec(html)![1], {
//     headers: {
//       Referer: url
//     }
//   });
//   var text = /TShop.Setup\(\s*(.*)\s*\);/.exec(html)![1];
//   var { itemDO, valItemInfo } = JSON.parse(text);
//   var form_str = /<form id="J_FrmBid"[^>]*>([\s\S]*?)<\/form>/.exec(html)![1];
//   var form_item_r = /\sname="([^"]+)"\s+value="([^"]*)"/g;
//   var form: Record<string, string> = {};
//   while (form_item_r.test(form_str)) {
//     form[RegExp.$1] = RegExp.$2;
//   }
//   if (!form.buyer_from) {
//     form.buyer_from = "ecity";
//   }
//   var skuId = valItemInfo.skuList[0].skuId;
//   Object.assign(form, {
//     root_refer: "",
//     item_url_refer: "",
//     allow_quantity: itemDO.quantity,
//     buy_param: [itemDO.itemId].join("_"),
//     quantity: 1,
//     _tb_token_: "edeb7b783ff65",
//     skuInfo: [itemDO.itemId, 1, skuId].join(";"),
//     _input_charset: "UTF-8",
//     skuId,
//     bankfrom: "",
//     from_etao: "",
//     item_id_num: itemDO.itemId,
//     item_id: itemDO.itemId,
//     auction_id: itemDO.itemId,
//     seller_rank: "0",
//     seller_rate_sum: "0",
//     is_orginal: "no",
//     point_price: "false",
//     secure_pay: "true",
//     pay_method: "\u6b3e\u5230\u53d1\u8d27",
//     from: "item_detail",
//     buy_now: itemDO.reservePrice,
//     current_price: itemDO.reservePrice,
//     auction_type: itemDO.auctionType,
//     seller_num_id: itemDO.userId,
//     activity: "",
//     chargeTypeId: ""
//   });
//   var detail_text = await pdetail;
//   var {
//     defaultModel: {
//       deliveryDO: { areaId }
//     }
//   } = JSON.parse(/\((.*)\)/.exec(detail_text)![1]);
//   Object.assign(form, {
//     destination: areaId
//   });
//   var qs_data = {
//     "x-itemid": itemDO.itemId,
//     "x-uid": user.unb
//   };
// }
// directBuy(
//   "https://detail.tmall.com/item.htm?spm=a220l.1.0.0.76577f33XEjg8i&id=594102186015&skuId=4323285303573"
// );
