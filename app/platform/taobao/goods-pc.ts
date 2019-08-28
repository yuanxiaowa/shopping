/*
 * @Author: oudingyin
 * @Date: 2019-08-26 09:17:48
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-28 11:26:28
 */
import setting from "./setting";
import { logFile } from "./tools";

export async function getGoodsInfo(url: string, hasForm = false) {
  var html: string = await setting.req.get(
    url.replace("detail.m.tmall.com/", "detail.tmall.com/"),
    {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36"
      }
    }
  );
  logFile(url + "\n" + html, "商品详情");
  var text = /TShop.Setup\(\s*(.*)\s*\);/.exec(html)![1];
  // detail.isHiddenShopAction
  var ret = JSON.parse(text);
  var { itemDO, valItemInfo } = ret;
  if (hasForm) {
    let form_str = /<form id="J_FrmBid"[^>]*>([\s\S]*?)<\/form>/.exec(html)![1];
    let form_item_r = /\sname="([^"]+)"\s+value="([^"]*)"/g;
    let form: Record<string, string> = {};
    while (form_item_r.test(form_str)) {
      form[RegExp.$1] = RegExp.$2;
    }
    if (!form.buyer_from) {
      form.buyer_from = "ecity";
    }
    let skuId = "0";
    if (itemDO.hasSku) {
      let { skuList, skuMap } = <
        {
          skuList: {
            names: string;
            pvs: string;
            skuId: string;
          }[];
          skuMap: {
            price: string;
            priceCent: number;
            skuId: string;
            stock: number;
          }[];
        }
      >valItemInfo;
      let items = Object.values(skuMap)
        .filter(item => item.stock > 0)
        .sort((a, b) => a.priceCent - b.priceCent);
      let skuItem = items[0];
      if (skuItem) {
        skuId = skuItem.skuId;
      } else {
        throw new Error("没货了");
      }
    }
    Object.assign(form, {
      root_refer: "",
      item_url_refer: url,

      allow_quantity: itemDO.quantity,
      buy_param: [itemDO.itemId, 1, skuId].join("_"),
      _tb_token_: "edeb7b783ff65",
      skuInfo: [itemDO.title].join(";"),
      _input_charset: "UTF-8",
      skuId,
      bankfrom: "",
      from_etao: "",
      item_id_num: itemDO.itemId,
      item_id: itemDO.itemId,
      auction_id: itemDO.itemId,
      seller_rank: "0",
      seller_rate_sum: "0",
      is_orginal: "no",
      point_price: "false",
      secure_pay: "true",
      pay_method: "\u6b3e\u5230\u53d1\u8d27",
      from: "item_detail",
      buy_now: itemDO.reservePrice,
      current_price: itemDO.reservePrice,
      auction_type: itemDO.auctionType,
      seller_num_id: itemDO.userId,
      activity: "",
      chargeTypeId: ""
    });
    ret.form = form;
  }
  /* var pdetail = this.req.get("https:" + /var l,url='([^']+)/.exec(html)![1], {
      headers: {
        Referer: url
      }
    });
    var detail_text = await pdetail;
    var {
      defaultModel: {
        deliveryDO: { areaId }
      }
    } = JSON.parse(/\((.*)\)/.exec(detail_text)![1]);
    Object.assign(form, {
      destination: areaId
    }); */
  /* var qs_data = {
      "x-itemid": itemDO.itemId,
      "x-uid": getCookie("unb", setting.cookie)
    }; */
  /* var page = await newPage();
    // await page.goto(url);
    await page.evaluate(form => {
      var ele = document.createElement("form");
      ele.action = "https://buy.tmall.com/order/confirm_order.htm";
      ele.method = "post";
      Object.keys(form).forEach(name => {
        var input = document.createElement("input");
        input.name = name;
        input.value = form[name];
        ele.appendChild(input);
      });
      document.body.appendChild(ele);
      ele.submit();
    }, form); */
  return ret;
}
