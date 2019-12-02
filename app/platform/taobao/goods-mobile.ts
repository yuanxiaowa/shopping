import { getItemId, requestData } from "./tools";
import setting from "./setting";
import { ArgSearch } from "../struct";
import { throwError } from "../../../utils/tools";

export async function getGoodsDetail(url: string) {
  var itemId = getItemId(url);
  /* 
    ttid: "2017@taobao_h5_6.6.0",
    AntiCreep: "true",
   */
  var { apiStack, item } = await requestData(
    "mtop.taobao.detail.getdetail",
    { itemNumId: itemId },
    "get"
  );
  let { skuBase, skuCore } = JSON.parse(apiStack[0].value);
  let sku_ret;
  if (skuBase) {
    let { props, skus } = skuBase;
    function f(i, vids: string[]) {
      var parent = {
        pid: props[i].pid,
        name: props[i].name,
        children: props[i].values.map(item => {
          var data: any = {
            value: item.vid,
            label: item.name
          };
          vids[i] = props[i].pid + ":" + item.vid;
          if (i < props.length - 1) {
            Object.assign(data, f(i + 1, vids));
          } else {
            let { skuId } = skus.find(item => item.propPath === vids.join(";"));
            let { quantity, price } = skuCore.sku2info[skuId];
            data.children = [
              {
                label: `￥${price.priceText}, ${quantity}`,
                value: skuId
              }
            ];
          }
          return data;
        })
      };
      return parent;
    }
    sku_ret = f(0, []);
  }
  return { skus: sku_ret, item, title: item.title };
}

export async function getGoodsInfo(url: string, skuId?: string) {
  var itemId = getItemId(url);
  /* 
    ttid: "2017@taobao_h5_6.6.0",
    AntiCreep: "true",
   */
  var data = await requestData(
    "mtop.taobao.detail.getdetail",
    { itemNumId: itemId },
    "get"
  );
  return transformMobileGoodsInfo(data, skuId);
}

function transformMobileGoodsInfo({ apiStack, item }, skuId?: string) {
  let { delivery, trade, skuBase, skuCore, price } = JSON.parse(
    apiStack[0].value
  );
  let buyEnable = trade.buyEnable === "true";
  let cartEnable = trade.cartEnable === "true";
  let msg: string | undefined;
  let cuxiao: any;
  let quantity = 0;
  if (!buyEnable) {
    if (trade.hintBanner) {
      msg = trade.hintBanner.text;
    } else {
      msg = trade.reason;
    }
  }
  if (!skuId) {
    skuId = "0";
  }
  /* if (skuBase && skuBase.props) {
    if (skus) {
      let propPath = skuBase.props
        .map(
          ({ pid, values }, i) =>
            `${pid}:${
              values[((skus[i] || 0) + values.length) % values.length].vid
            }`
        )
        .join(";");
      let skuItem = skuBase.skus.find(item => item.propPath === propPath);
      if (!skuItem) {
        throwError("指定商品型号不存在");
      } else {
        skuId = skuItem.skuId;
      }
    }
  } */
  if (skuCore) {
    if (skuId === "0") {
      let min = Infinity;
      for (let key of Object.keys(skuCore.sku2info)) {
        if (key === "0") {
          continue;
        }
        let { price, quantity } = skuCore.sku2info[key];
        if (price.priceText.includes("-") || !(Number(quantity) > 0)) {
          continue;
        }
        let p = Number(price.priceText);
        if (p < min) {
          min = p;
          skuId = key;
        }
      }
    }
    let item = skuCore.sku2info[skuId];
    if (item) {
      quantity = Number(item.quantity);
    }
  }
  if (price.shopProm) {
    cuxiao = price.shopProm.map(
      (p: { type: number; content: string[]; title: string }) => {
        var quota = 0;
        var discount = 1;
        var amount = 1;
        if (p.type === 3) {
          // 满多少件打折
          let arr = /满(\d+)件,打(\d+)折/.exec(p.content[0])!;
          amount = +arr[1];
          discount = +arr[2] / 10;
        } else if (p.type === 5) {
          // 送积分
          discount = Number(/(\d+)/.exec(p.content[0]![1]));
        }
        return {
          type: p.type,
          title: p.title,
          quota,
          discount,
          amount
        };
      }
    );
  }
  return {
    itemId: item.itemId,
    title: item.title,
    quantity,
    buyEnable,
    cartEnable,
    msg,
    skuId,
    delivery,
    price: price.price.priceText,
    cuxiao
  };
}

export async function getChaoshiGoodsList(args) {
  var q = args.keyword;
  delete args.keyword;
  var text: string = await setting.req.get(
    "https://list.tmall.com/chaoshi_data.htm",
    {
      qs: Object.assign(
        {
          p: 1,
          user_id: 725677994,
          q,
          cat: 50514008,
          sort: "p",
          unify: "yes",
          from: "chaoshi"
        },
        args
      ),
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    }
  );
  var { srp, status } = JSON.parse(text);
  if (status.success) {
    return srp;
  }
  throwError("出错了");
}

/**
 * 搜索商品
 * @param data
 */
export async function getGoodsList(data: ArgSearch) {
  var page = data.page;
  var q = data.keyword;
  delete data.page;
  delete data.keyword;
  var qs = Object.assign(
    {
      page_size: 20,
      sort: "p",
      type: "p",
      q,
      page_no: page,
      spm: "a220m.6910245.a2227oh.d100",
      from: "mallfp..m_1_searchbutton"
    },
    data
  );
  var text: string = await setting.req.get(
    "https://list.tmall.com/m/search_items.htm",
    {
      // page_size=20&sort=s&page_no=1&spm=a3113.8229484.coupon-list.7.BmOFw0&g_couponFrom=mycoupon_pc&g_m=couponuse&g_couponId=2995448186&g_couponGroupId=121250001&callback=jsonp_90716703
      qs,
      headers: {
        referer: "https://list.tmall.com/coudan/search_product.htm"
      }
    }
  );
  var { total_page, item } = JSON.parse(text);
  return {
    total: total_page,
    page,
    items: item.map(item =>
      Object.assign(item, {
        url: "https:" + item.url
      })
    )
  };
}
