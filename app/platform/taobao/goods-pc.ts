/*
 * @Author: oudingyin
 * @Date: 2019-08-26 09:17:48
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-07 01:33:43
 */
import setting from "./setting";
import { logFile } from "./tools";
import { throwError } from "../../../utils/tools";
import cheerio = require("cheerio");

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

export async function getStock(id: string, skuId?: string) {
  var {
    defaultModel: { inventoryDO }
  } = await setting.req.get(
    `https://mdskip.taobao.com/core/initItemDetail.htm?itemId=${id}&isUseInventoryCenter=true&cartEnable=true&service3C=false&isApparel=false&isSecKill=false&tmallBuySupport=true&isAreaSell=false&tryBeforeBuy=false&offlineShop=false&showShopProm=true&isPurchaseMallPage=false&itemGmtModified=1567782519000&isRegionLevel=false&household=false&sellerPreview=false&queryMemberRight=false&addressLevel=3&isForbidBuyItem=false&callback=setMdskip&timestamp=1567790879892&isg=cBMsqBcgqOfrpb0TBOCwourza77OjIRAguPzaNbMi_5IK6TsOfQOkr-53F96cjWdtZ8p4K7K7H29-etfwz2T6qObHZ9R.&isg2=BJaWM8Tx1xPL9OPGmCxYgI6K50pYn9oZgxUXGQD_jXkUwzZdacbXgb7yWx-K69KJ`,
    {
      headers: {
        Referer:
          "https://detail.tmall.hk/hk/item.htm?id=585453718575&ali_trackid=2:mm_441610096_555100392_109014100361:1567790708_155_436441487"
      }
    }
  );
  var { skuQuantity, icTotalQuantity } = <
    {
      skuQuantity: Record<
        string,
        {
          quantity: number;
          totalQuantity: number;
          type: number;
        }
      >;
      icTotalQuantity: number;
      totalQuantity: number;
    }
  >inventoryDO;
  if (!skuId) {
    return icTotalQuantity;
  }
  return skuQuantity[skuId].quantity;
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
      form: {
        _tb_token_: "3e719770d9b35",
        _input_charset: "utf-8",
        favType: 0,
        favIdArr: items.map(({ id }) => id),
        operateType: "delete"
      },
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Referer:
          "https://shoucang.taobao.com/shop_collect_list.htm?spm=a21bo.2017.1997525053.3.5af911d930HH1R"
      }
    }
  );
  var { success, errorMsg } = JSON.parse(text);
  if (success) {
    return errorMsg;
  }
  throw new Error(errorMsg);
}
