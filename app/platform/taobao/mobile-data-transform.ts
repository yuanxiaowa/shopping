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

export function transformMobileGoodsInfo({ apiStack, item }, skus?: number[]) {
  let { delivery, trade, skuBase, skuCore, price } = JSON.parse(
    apiStack[0].value
  );
  let buyEnable = trade.buyEnable === "true";
  let cartEnable = trade.cartEnable === "true";
  let msg: string | undefined;
  let cuxiao: any;
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
    if (item && item.quantity === "0") {
      throw new Error("无库存了");
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
    buyEnable,
    cartEnable,
    msg,
    skuId,
    delivery,
    price: price.price.priceText,
    cuxiao
  };
}
