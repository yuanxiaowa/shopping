import { requestData } from "./tools";
import qs = require("querystring");
import iconv = require("iconv-lite");
import setting from "./setting";

export async function checkLogin() {
  try {
    await requestData("mtop.user.getUserSimple", {}, "get", "1.0");
    return true;
  } catch (e) {
    return false;
  }
}

export async function getCoupons({ page }: { page: number }) {
  var buf: Buffer = await setting.req.get(
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
