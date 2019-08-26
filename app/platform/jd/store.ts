/*
 * @Author: oudingyin
 * @Date: 2019-08-26 15:20:23
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-26 15:20:35
 */
import setting from "./setting";

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
