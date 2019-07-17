import { getJsonpData } from "../../../utils/tools";

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
const pattern = /\$\{(.*)\}/;

export function getMobileCartList(resData: any) {
  var {
    data: { hierarchy, data, controlParas }
  } = resData;

  var structure: Record<string, string[]> = hierarchy.structure;

  function getPatternUrl(data: any) {
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
        ret.push({
          id: "",
          title: "聚划算未开团",
          sellerId: "",
          shopId: "",
          valid: false,
          url: "",
          items: items
            .filter(key => data[key].fields.titleInCheckBox === "预热")
            .map(mapper)
        });
        return;
      }
      structure[name].forEach(key => findData(key));
    }
  }

  findData(hierarchy.root);
  return ret;
}

export function getMobileGoodsInfo(resData: string, skus?: number[]) {
  let {
    data: { apiStack, item }
  } = getJsonpData(resData);
  let { delivery, trade, skuBase, skuCore } = JSON.parse(apiStack[0].value);
  let buyEnable = trade.buyEnable === "true";
  let cartEnable = trade.cartEnable === "true";
  let msg: string | undefined;
  if (!buyEnable) {
    if (trade.hintBanner) {
      msg = trade.hintBanner.text;
    } else {
      msg = trade.reason;
    }
  }
  let skuId = "0";
  if (skuBase && skuBase.props) {
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
        throw new Error("指定商品型号不存在");
      } else {
        skuId = skuItem.skuId;
      }
    }
  }
  if (skuCore) {
    if (skuId === "0") {
      let min = Infinity;
      for (let key of Object.keys(skuCore.sku2info)) {
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
    if (item && item.quantity === "0") {
      throw new Error("无库存了");
    }
  }
  return {
    itemId: item.itemId,
    buyEnable,
    cartEnable,
    msg,
    skuId,
    delivery
  };
}
