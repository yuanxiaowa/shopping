/*
 * @Author: oudingyin
 * @Date: 2019-09-06 15:45:00
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 17:44:03
 */
import setting from "./setting";
import cheerio = require("cheerio");

export async function getStoreCollection(page = 1) {
  var _tb_token_: any;
  var html: string = await setting.req.get(
    "https://shoucang.taobao.com/shop_collect_list_n.htm?spm=a1z0k.7386009.1997992801.3.7e5110196EtWUO"
  );
  _tb_token_ = /_tb_token_: '(\w+)'/.exec(html)![1];
  if (page > 1) {
    html = await setting.req.get(
      `https://shoucang.taobao.com/nodejs/shop_collect_list_chunk.htm?ifAllTag=0&tab=0&categoryCount=0&tagName=&type=0&categoryName=&needNav=false&startRow=${(page -
        1) *
        6}&t=${Date.now()}`
    );
  }
  var $ = cheerio.load(html);
  var items = $(".J_FavListItem")
    .map((_, ele) => {
      var $ele = $(ele);
      var img = $ele.find(".logo-img").attr("src");
      var $link = $ele.find(".shop-name-link");
      var url = $link.attr("href");
      var title = $link.text().trim();
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

export async function delStoreCollection(items: any[]) {
  var text: string = await setting.req.post(
    `https://shoucang.taobao.com/favorite/api/CollectOperating.htm`,
    {
      form: {
        _tb_token_: items[0]._tb_token_,
        _input_charset: "utf-8",
        favType: 0,
        "favIdArr[]": items.map(({ id }) => id),
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
