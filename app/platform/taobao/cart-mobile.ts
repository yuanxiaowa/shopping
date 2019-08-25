import { requestData } from "./tools";
import setting from "./setting";
import { getGoodsInfo } from "./goods-mobile";

export interface CartItemBase {
  id: string;
  title: string;
  valid: boolean;
  quantity: number;
  skuId: string;
  price: number;
  img: string;
  url: string;
}

export interface CartVendorInfoBase<T extends CartItemBase = CartItemBase> {
  id: string;
  title: string;
  valid: boolean;
  url: string;
  items: T[];
}

export interface VendorInfo extends CartVendorInfoBase {
  sellerId: string;
  shopId: string;
}

export interface CartItem extends CartItemBase {
  settlement: string;
  sellerId: string;
  cartId: string;
  shopId: string;
  itemId: string;
}

const spm = "a222m.7628550.0.0";
export async function getRawCartList() {
  return requestData(
    "mtop.trade.querybag",
    {
      exParams: JSON.stringify({
        mergeCombo: "true",
        version: "1.0.0",
        globalSell: "1",
        spm,
        cartfrom: "detail"
      }),
      isPage: "false",
      extStatus: "0",
      spm,
      cartfrom: "detail"
    },
    "get",
    "5.0"
  );
}

const pattern = /\$\{(.*)\}/;
export async function getCartList() {
  var resData = await getRawCartList();
  var { hierarchy, data, controlParas } = resData;

  var structure: Record<string, string[]> = hierarchy.structure;

  function getPatternUrl(data: any) {
    if (!data.url.startsWith("$")) {
      return data.url;
    }
    return (<string>controlParas[pattern.exec(data.url)![1]]).replace(
      pattern,
      (_, key) => data[key]
    );
  }

  function mapper(key: string) {
    var { id, fields } = data[key];
    var {
      title,
      valid,
      settlement,
      quantity: { quantity },
      sellerId,
      cartId,
      shopId,
      itemId,
      sku: { skuId },
      pay: { now },
      pic,
      checked
    } = fields;
    return <CartItem>{
      id,
      title,
      valid,
      settlement,
      quantity,
      sellerId,
      cartId,
      shopId,
      itemId,
      skuId,
      price: now / 100,
      img: pic,
      url: getPatternUrl(fields),
      checked
    };
  }

  var ret: VendorInfo[] = [];
  function findData(name: string) {
    if (!structure[name]) {
      return;
    }
    var items = structure[name];
    if (items[0].startsWith("shop")) {
      let { id, fields } = data[items[0]];
      // let groups = items.filter(item => item.startsWith("group_"));
      let children: any[] = [];
      items.slice(1).forEach(key => {
        if (!structure[key]) {
          return;
        }
        structure[key].map(_item => {
          children.push(mapper(_item));
        });
      });
      ret.push({
        id,
        title: fields.title,
        sellerId: fields.sellerId,
        shopId: fields.shopId,
        valid: fields.valid,
        url: getPatternUrl(fields),
        items: children
      });
    } else {
      if (name === "bundlev2_invalid") {
        let items_jhs = items
          .filter(key => data[key].fields.titleInCheckBox === "预热")
          .map(mapper);
        if (items_jhs.length > 0) {
          ret.unshift({
            id: "",
            title: "聚划算未开团",
            sellerId: "",
            shopId: "",
            valid: false,
            url: "",
            items: items_jhs
          });
        }
        let items_invalid = items
          .filter(key => data[key].fields.titleInCheckBox !== "预热")
          .map(mapper);
        if (items_invalid.length > 0) {
          ret.push({
            id: name,
            title: "失效宝贝",
            sellerId: "",
            shopId: "",
            valid: false,
            url: "",
            items: items_invalid
          });
        }
        return;
      }
      structure[name].forEach(key => findData(key));
    }
  }

  findData(hierarchy.root);
  return ret;
}

export async function addCart(args: {
  url: string;
  quantity: number;
  skus?: number[];
}) {
  var itemId;
  var skuId;
  if (/skuId=(\d+)/.test(args.url)) {
    skuId = RegExp.$1;
    itemId = /id=(\d+)/.exec(args.url)![1];
  } else {
    var res = await getGoodsInfo(args.url, args.skus);
    if (res.quantity === 0) {
      throw new Error("无库存了");
    }
    skuId = res.skuId;
    itemId = res.itemId;
  }
  var { cartId } = await requestData(
    "mtop.trade.addbag",
    {
      itemId,
      quantity: args.quantity,
      exParams: JSON.stringify({
        addressId: "9607477385",
        etm: "",
        buyNow: "true",
        _input_charset: "utf-8",
        areaId: "320583",
        divisionId: "320583"
      }),
      skuId
    },
    "post",
    "3.1"
  );
  return cartId;
}

export async function updateCart({ items }, action: string) {
  var { cartId, quantity } = items[0];
  var { hierarchy, data }: any = await getRawCartList();
  var updateKey = Object.keys(data).find(
    key => data[key].fields.cartId === cartId
  )!;
  var key = Object.keys(hierarchy.structure).find(key =>
    hierarchy.structure[key].includes(updateKey)
  )!;
  var cdata = hierarchy.structure[key].reduce((state, key) => {
    var { fields } = data[key];
    state[key] = {
      fields: {
        bundleId: fields.bundleId,
        cartId: fields.cartId,
        checked: fields.checked,
        itemId: fields.itemId,
        quantity: fields.quantity.quantity,
        shopId: fields.shopId,
        valid: fields.valid
      }
    };
    return state;
  }, {});
  cdata[updateKey].fields.quantity = quantity;
  var { cartId } = await requestData(
    "mtop.trade.updatebag",
    {
      p: JSON.stringify({
        data: cdata,
        operate: { [action]: [updateKey] },
        hierarchy
      }),
      extStatus: "0",
      feature: '{"gzip":false}',
      exParams: JSON.stringify({
        mergeCombo: "true",
        version: "1.0.0",
        globalSell: "1",
        spm: setting.spm,
        cartfrom: "detail"
      }),
      spm: setting.spm,
      cartfrom: "detail"
    },
    "post",
    "4.0"
  );
  return cartId;
}

export async function cartToggle() {
  // const page = await newPage();
  // await page.goto("https://cart.taobao.com/cart.htm");
  // // await page.waitForSelector("#J_Go");
  // // @ts-ignore
  // let firstData = await page.evaluate(() => window.firstData);
  // var cartIds: string[] = [];
  // var sellerids: string[] = [];
  // var items: {
  //   cartId: string;
  //   itemId: string;
  //   skuId: string;
  //   quantity: number;
  //   createTime: number;
  //   attr: string;
  // }[] = [];
  // firstData.list.forEach((shop: any) => {
  //   shop.bundles[0].items.forEach((item: any) => {
  //     cartIds.push(item.cartId);
  //     sellerids.push(item.sellerid);
  //     items.push({
  //       cartId: item.cartId,
  //       itemId: item.itemId,
  //       skuId: item.skuId,
  //       quantity: item.amount.now,
  //       createTime: item.createTime,
  //       attr: item.attr
  //     });
  //   });
  // });
  // var data = {
  //   hex: "n",
  //   cartId: cartIds.reverse().join(","),
  //   sellerid: sellerids.join(","),
  //   cart_param: JSON.stringify({
  //     items: items.reverse()
  //   }),
  //   unbalance: "",
  //   delCartIds: cartIds.join(","),
  //   use_cod: false,
  //   buyer_from: "cart",
  //   page_from: "cart",
  //   source_time: Date.now()
  // };
  // await page.evaluate((data: any) => {
  //   var form = document.createElement("form");
  //   form.method = "post";
  //   form.action =
  //     "https://buy.tmall.com/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined";
  //   Object.keys(data).map(key => {
  //     var input = document.createElement("input");
  //     input.type = "hidden";
  //     input.value = data[key];
  //     form.appendChild(input);
  //   });
  //   document.body.appendChild(form);
  //   form.submit();
  // }, data);
  // await page.waitForNavigation();
  // if (!isSubmitOrder) {
  //   await page.setOfflineMode(true);
  // }
  // await page.click(".go-btn");
}
