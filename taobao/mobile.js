"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pattern = /\$\{(.*)\}/;
function getMobileCartInfo(resData) {
    var { data: { hierarchy, data, controlParas } } = resData;
    var structure = hierarchy.structure;
    function getPatternUrl(data) {
        return controlParas[pattern.exec(data.url)[1]].replace(pattern, (_, key) => data[key]);
    }
    function mapper(key) {
        var { id, fields } = data[key];
        var { title, valid, settlement, quantity: { quantity }, sellerId, cartId, shopId, itemId, sku: { skuId }, pay: { now }, pic, checked } = fields;
        return {
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
    var ret = [];
    function findData(name) {
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
        }
        else {
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
exports.getMobileCartInfo = getMobileCartInfo;
