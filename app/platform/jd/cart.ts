/*
 * @Author: oudingyin
 * @Date: 2019-08-26 14:38:10
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-26 15:01:40
 */
import setting from "./setting";
import { getJsonpData } from "../../../utils/tools";

export async function getCartList() {
  var html: string = await setting.req.get(
    "https://p.m.jd.com/cart/cart.action?sceneval=2"
  );
  var text = /window.cartData =([\s\S]*?)(if\s*\(|window\._)/.exec(html)![1];
  var data: {
    traceId: string;
    areaId: string;
    cart: {
      allChecked: string;
      venderCart: {
        // 价格×100
        price: string;
        // 1: 选中 0:未选中
        checkType: string;
        popInfo: {
          vid: string;
          vname: string;
          type: string;
          fbpVender: string;
        };
        sortedItems: {
          itemId: string;
          polyType: string;
          polyItem: {
            checkType: string;
            ts: string;
            price: string;
            products: {
              checkType: string;
              mainSku: {
                id: string;
                name: string;
                maxNum: string;
              };
            }[];
          };
        }[];
      }[];
    };
  } = JSON.parse(text);
  var other = {
    areaId: data.areaId,
    traceId: data.traceId
  };
  var items = data.cart.venderCart.map(item => {
    var vendor: any = {
      id: item.popInfo.vid,
      title: item.popInfo.vname,
      items: [],
      checked: item.checkType === "1"
    };
    item.sortedItems.forEach(({ polyItem, itemId, polyType }: any) => {
      polyItem.products.forEach(product => {
        var sku = product.mainSku;
        return vendor.items.push({
          id: sku.id,
          itemId: itemId,
          title: sku.name,
          cid: sku.cid,
          img: "//img10.360buyimg.com/cms/s80x80_" + sku.image,
          url: `https://item.jd.com/${sku.id}.html`,
          price: product.price / 100,
          quantity: product.num,
          polyType,
          checked: product.checkType === "1"
        });
      });
    });
    return vendor;
  });
  return {
    other,
    items
  };
}

async function operateCart(
  url: string,
  data: {
    areaId: string;
    traceId: string;
    items: any[];
  }
) {
  var qs = {
    templete: "1",
    version: "20190418",
    sceneval: "2",
    // mainSku.id,,1,mainSku.id,11,itemid,0
    commlist: data.items
      .map(item =>
        [
          item.id,
          ,
          item.quantity,
          item.id,
          Number(item.polyType).toString(2),
          item.polyType === "1" ? "" : item.itemId,
          0
        ].join(",")
      )
      .join("$"),
    callback: "checkCmdyCbA",
    type: "0",
    all: data.items.length === 0 ? 1 : 0,
    checked: "0",
    reg: "1",
    traceid: data.traceId,
    locationid: data.areaId,
    t: Math.random()
  };
  var text = await setting.req.get(url, {
    qs,
    headers: {
      Referer: "https://p.m.jd.com/cart/cart.action?sceneval=2"
    }
  });
  var { errId, errMsg } = getJsonpData(text);
  if (errId !== "0") {
    throw new Error(errMsg);
  }
}

export async function toggleCartChecked(data) {
  return operateCart(
    `https://wqdeal.jd.com/deal/mshopcart/${
      data.checked ? "checkcmdy" : "uncheckcmdy"
    }`,
    data
  );
}

export async function addCart(skuId: string, quantity: number) {
  var text = await setting.req.get("https://wq.jd.com/deal/mshopcart/addcmdy", {
    qs: {
      callback: "addCartCBA",
      sceneval: "2",
      reg: "1",
      scene: "2",
      type: "0",
      commlist: [skuId, , quantity, skuId, 1, 0, 0].join(","),
      // locationid: "12-988-40034",
      t: Math.random()
    },
    headers: {
      Referer: `https://item.m.jd.com/product/${skuId}.html`
    }
  });
  var { errId, errMsg } = getJsonpData(text);
  if (errId !== "0") {
    throw new Error(errMsg);
  }
  return skuId;
}

export function delCart(data: any) {
  return operateCart("https://wqdeal.jd.com/deal/mshopcart/rmvCmdy", data);
}

export function updateCartQuantity(data: any) {
  return operateCart(
    "https://wqdeal.jd.com/deal/mshopcart/modifycmdynum",
    data
  );
}
