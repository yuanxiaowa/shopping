/*
 * @Author: oudingyin
 * @Date: 2019-08-26 15:20:23
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 15:44:49
 */
import setting from "./setting";
import { reqJsonpData } from "./tools";

export async function getShopJindou() {
  await setting.req.get("https://bean.jd.com/myJingBean/list");
  var text: string = await setting.req.post(
    "https://bean.jd.com/myJingBean/getPopSign"
  );
  var { data } = JSON.parse(text);
  data.forEach(
    async ({ shopUrl, signed }: { shopUrl: string; signed: boolean }) => {
      if (!signed) {
        let id: string;
        if (/mall\.jd\.com\/index-(\w+)/.test(shopUrl)) {
          id = RegExp.$1;
        } else {
          let html: string = await setting.req.get(shopUrl);
          id = /var shopId = "(\d+)"/.exec(html)![1];
        }
        await setting.req.get(`https://mall.jd.com/shopSign-${id}.html`);
      }
    }
  );
}

export async function getStoreCollection(page = 1) {
  var data = await reqJsonpData(
    `https://wq.jd.com/fav/shop/QueryShopFavList?cp=${page}&pageSize=10&lastlogintime=0&_=1567755007872&sceneval=2&g_login_type=1&callback=jsonpCBKA&g_ty=ls`
  );
  var items = data.map(item =>
    Object.assign(item, {
      title: item.shopName,
      img: item.shopUrl,
      id: item.shopId
    })
  );
  return {
    items,
    more: items.length > 0
  };
}

export function delStoreCollection(items: any[]) {
  return Promise.all(
    items.map(item =>
      reqJsonpData(
        `https://wq.jd.com/fav/shop/DelShopFav?shopId=${item.id}&_=1567755472398&sceneval=2&g_login_type=1&callback=jsonpCBKH&g_ty=ls`
      )
    )
  );
}
