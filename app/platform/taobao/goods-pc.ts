/*
 * @Author: oudingyin
 * @Date: 2019-08-26 09:17:48
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-07 09:27:44
 */
import setting from "./setting";
import { logFile } from "./tools";
import { throwError } from "../../../utils/tools";
import cheerio = require("cheerio");
import qs = require("querystring");

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
  var { itemDO, valItemInfo, valTimeLeft, detail } = ret;
  /* if (!valTimeLeft) {
    throwError("商品已下架");
  } */
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
        throwError("没货了");
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

export async function getStock(arg: {
  url: string;
  id: string;
  skuId?: string;
}) {
  var text = await setting.req.get(
    `https://mdskip.taobao.com/core/initItemDetail.htm?itemId=${arg.id}`,
    {
      headers: {
        Referer: arg.url
      }
    }
  );
  var {
    defaultModel: { inventoryDO }
  } = JSON.parse(text);
  var { skuQuantity, icTotalQuantity } = <
    {
      skuQuantity: Record<
        string,
        {
          icTotalQuantity: number;
          quantity: number;
          totalQuantity: number;
          type: number;
        }
      >;
      icTotalQuantity: number;
      totalQuantity: number;
    }
  >inventoryDO;
  if (!arg.skuId || !skuQuantity[arg.skuId]) {
    return icTotalQuantity;
  }
  return skuQuantity[arg.skuId].quantity;
}

export async function getGoodsCollection(page = 1) {
  var html: string = await setting.req.get(
    `https://shoucang.taobao.com/item_collect_n.htm?spm=a1z0k.7385961.1997985201.2.348b10190raj9v`
  );
  var $ = cheerio.load(html);
  var _tb_token_ = /_tb_token_: '(\w+)'/.exec(html)![1];
  var items = $(".J_FavListItem")
    .map((_, ele) => {
      var $ele = $(ele);
      var img = $ele.find(".logo-img").attr("src");
      var $link = $ele.find(".img-controller-img-link");
      var url = $link.attr("href");
      var title = $link.attr("title");
      var id = $ele.data("id");
      return {
        id,
        img,
        url,
        title,
        _tb_token_
      };
    })
    .get();
  return {
    items,
    more: items.length > 0
  };
}

export async function delGoodsCollection(items: any[]) {
  var text: string = await setting.req.post(
    `https://shoucang.taobao.com/favorite/api/CollectOperating.htm`,
    {
      // form: {
      //   _tb_token_: items[0]._tb_token_,
      //   _input_charset: "utf-8",
      //   favType: 1,
      //   "favIdArr[]": items.map(({ id }) => id),
      //   operateType: "delete"
      // },
      body: qs.stringify({
        _tb_token_: items[0]._tb_token_,
        _input_charset: "utf-8",
        favType: 1,
        "favIdArr[]": items.map(({ id }) => id),
        operateType: "delete"
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        Referer:
          "https://shoucang.taobao.com/item_collect.htm?spm=a21bo.2017.1997525053.2.5af911d9umD3GI"
      }
    }
  );
  var { success, errorMsg } = JSON.parse(text);
  if (success) {
    return errorMsg;
  }
  throw new Error(errorMsg);
}
