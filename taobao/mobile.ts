import { readJSONSync } from "fs-extra";

export interface CartItemBase {
  id: string;
  title: string;
  valid: boolean;
  amount: number;
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

export function getMobileCartInfo(resData: any) {
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
      amount: quantity,
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
    if (!items) {
      console.log(name);
    }
    if (items[0].startsWith("shop")) {
      let { id, fields } = data[items[0]];
      let groups = items.filter(item => item.startsWith("group_"));
      let children = structure[groups[groups.length - 1]].map(mapper);
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

console.log(getMobileCartInfo(readJSONSync(__dirname + "/cart.json")));
