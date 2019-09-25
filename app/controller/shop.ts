/*
 * @Author: oudingyin
 * @Date: 2019-07-11 18:00:06
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-25 09:47:28
 */
import { Controller } from "egg";
import moment = require("moment");
import { sysTaobaoTime, sysJingdongTime } from "../../utils/tools";
import { DT } from "../common/config";

var delayMap: Record<
  number,
  {
    data: {
      type: string;
      time: string;
      platform: string;
      comment: string;
      url?: string;
    };
    cancel(): void;
  }
> = {};

var counter = 0;
function delay(
  t: number,
  data: {
    type: string;
    time: string;
    platform: string;
    comment: string;
    url?: string;
  }
) {
  return new Promise<void>((resolve, reject) => {
    if (typeof data.url === "string") {
      for (let key in delayMap) {
        if (delayMap[key].data.url === data.url) {
          return reject(
            "已存在该任务 " + JSON.stringify(data.comment, null, 2)
          );
        }
      }
    }
    var id = counter++;
    var timerId = setTimeout(() => {
      delete delayMap[id];
      resolve();
    }, t);
    delayMap[id] = {
      data,
      cancel() {
        reject(new Error("手动取消任务 " + data.type));
        clearTimeout(timerId);
        delete delayMap[id];
      }
    };
  });
}

async function handle(p: any, msg?: string) {
  try {
    var data = await p;
    return {
      code: 0,
      data,
      msg
    };
  } catch (e) {
    return {
      code: 1,
      msg: e.message
    };
  }
}

async function sysTime(platform: string) {
  var handler = platform === "taobao" ? sysTaobaoTime : sysJingdongTime;
  console.log(platform + "开始同步时钟");
  var { dt, rtl } = await handler();
  console.log(
    platform + "同步时间",
    (dt > 0 ? "慢了" : "快了") + Math.abs(dt) + "ms"
  );
  console.log(platform + "单程时间", rtl + "ms");
  DT[platform] = dt + rtl - 30;
}

sysTime("taobao");
sysTime("jingdong");

export default class ShopController extends Controller {
  public async cartList() {
    const { ctx, app } = this;
    var { platform, from_pc } = ctx.query;
    ctx.body = await handle(
      app[platform].cartList({ from_pc }),
      "已获取购物车数据"
    );
  }
  public async cartBuy() {
    const { ctx, app } = this;
    var { platform, t } = ctx.query;
    var data = ctx.request.body;
    if (t) {
      let toTime = moment(t);
      let dt = toTime.diff(moment()) - DT[platform];
      if (dt > 0) {
        let p = delay(dt, {
          type: `从购物车下单`,
          time: t,
          platform,
          comment: data._comment
        });
        data.seckill = true;
        (async () => {
          console.log(platform, "开始从购物车下单");
          await app[platform].cartBuy(data, p);
        })();
        ctx.body = {
          code: 0,
          msg: toTime.fromNow() + " 从购物车下单"
        };
        return;
      }
    }
    ctx.body = await handle(app[platform].cartBuy(data), "下单成功");
  }
  public async cartToggle() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var data = ctx.request.body;
    ctx.body = await handle(app[platform].cartToggle(data), "切换成功");
  }
  public async cartToggleAll() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var data = ctx.request.body;
    ctx.body = await handle(app[platform].cartToggleAll(data), "切换成功");
  }
  public async cartAdd() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var data = ctx.request.body;
    ctx.body = await handle(app[platform].cartAdd(data), "商品已加入购物车");
  }
  public async cartDel() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var data = ctx.request.body;
    ctx.body = await handle(app[platform].cartDel(data), "删除成功");
  }
  public async cartUpdateQuantity() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var data = ctx.request.body;
    ctx.body = await handle(app[platform].cartUpdateQuantity(data), "更新成功");
  }
  public async buyDirect(args: any) {
    const { ctx, app } = this;
    var { platform, t } = ctx.query;
    var data = ctx.request.body;
    var ins = app[platform];
    if (platform === "taobao" && data.mc_dot1) {
      let id = await ins.cartAdd(data);
      let items: any[] = await ins.goodsList({
        name: "chaoshi",
        keyword: "",
        page: 1
      });
      let i = items.findIndex(item => Number(item.price) > 0.01);
      let ids: string[] = [id];
      for (let { url } of items.slice(0, i)) {
        try {
          let id = await ins.cartAdd({
            url,
            quantity: 1
          });
          ids.push(id);
        } catch (e) {}
      }
      let _items = items.slice(0, i);
      ctx.body = await handle(
        ins.coudan(
          Object.assign({
            urls: _items.map(({ url }) => url),
            quantities: _items.map(() => 1)
          })
        ),
        "下单成功"
      );
      return;
    }
    if (t) {
      let toTime = moment(t);
      let dt = toTime.diff(moment()) - DT[platform];
      if (dt > 0) {
        let p = delay(dt, {
          type: `直接购买`,
          time: t,
          platform,
          comment: data._comment,
          url: data.url
        });
        data.seckill = true;
        ins.buyDirect(data, p);
        ctx.body = {
          code: 0,
          msg: toTime.fromNow() + " 将直接下单"
        };
        return;
      }
    }
    ctx.body = await handle(ins.buyDirect(data), "下单成功");
  }
  public async coudan() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var data = ctx.request.body;
    ctx.body = await handle(app[platform].coudan(data));
  }
  public async qiangquan() {
    const { ctx, app } = this;
    var { platform, t } = ctx.query;
    var { data } = ctx.request.body;
    if (t) {
      let toTime = moment(t);
      let dt = toTime.diff(moment()) - DT[platform];
      if (dt > 0) {
        let p = delay(dt, {
          type: `抢券`,
          time: t,
          platform,
          comment: data._comment
        });
        (async () => {
          await p;
          app[platform].qiangquan(data);
        })();
        ctx.body = {
          code: 0,
          msg: toTime.fromNow() + " 将直接抢券"
        };
        return;
      }
    }

    ctx.body = await handle(app[platform].qiangquan(data));
  }
  public async coupons() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    ctx.body = await handle(app[platform].coupons(ctx.query));
  }
  public async commentList() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    ctx.body = await handle(
      app[platform].commentList(ctx.query),
      "成功获取待评论列表"
    );
  }
  public async comment() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var data = ctx.request.body;
    ctx.body = await handle(app[platform].comment(data), "评论成功");
  }
  public async checkStatus() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    ctx.body = await handle(app[platform].checkStatus());
  }
  public async resolveUrl() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var { data } = ctx.request.body;
    ctx.body = await handle(app[platform].resolveUrl(data));
  }
  /**
   * 秒杀列表
   */
  public async seckillList() {
    const { ctx, app } = this;
    var { platform, url } = ctx.query;
    ctx.body = await handle(app[platform].seckillList(url));
  }

  public async goodsList() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    ctx.body = await handle(app[platform].goodsList(ctx.query));
  }

  public async calcPrice() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    ctx.body = await handle(app[platform].calcPrice(ctx.query));
  }

  public async sixtyCourseList() {
    const { ctx, app } = this;
    ctx.body = await handle(app.taobao.sixtyCourseList());
  }
  public async sixtyCourseReply() {
    const { ctx, app } = this;
    ctx.body = await handle(app.taobao.sixtyCourseReply(ctx.query));
  }

  public async testOrder() {
    const { ctx, app } = this;
    ctx.body = await handle(app[ctx.query.platform].testOrder(ctx.query));
  }

  public async sysTime() {
    const { ctx, app } = this;
    ctx.body = await handle(sysTime(ctx.query.platform));
  }

  public async taskList() {
    const { ctx } = this;
    ctx.body = await handle(
      Object.keys(delayMap)
        .map(id => Object.assign({ id }, delayMap[id].data))
        .sort((a, b) => moment(a.time).valueOf() - moment(b.time).valueOf())
    );
  }

  public async taskCancel() {
    const { ctx } = this;
    var { id } = ctx.query;
    if (!delayMap[id]) {
      ctx.body = {
        code: 1,
        msg: "指定任务不存在"
      };
      return;
    }
    ctx.body = await handle(delayMap[id].cancel());
  }

  public async getMyCoupons() {
    this.ctx.body = await handle(this.app.jingdong.getMyCoupons());
  }

  public async getPlusQuanpinList() {
    this.ctx.body = await handle(this.app.jingdong.getPlusQuanpinList());
  }

  public async getPlusQuanpin() {
    var data = this.ctx.request.body;
    this.ctx.body = await handle(this.app.jingdong.getPlusQuanpin(data));
  }

  public async getCollection() {
    var { platform } = this.ctx.query;
    this.ctx.body = await handle(
      this.app[platform].getCollection(this.ctx.query)
    );
  }

  public async delCollection() {
    var { platform } = this.ctx.query;
    var data = this.ctx.request.body;
    this.ctx.body = await handle(this.app[platform].delCollection(data));
  }

  public async getStock() {
    const { ctx, app } = this;
    this.ctx.body = await handle(
      app.jingdong.getStock(ctx.request.body.items, {})
    );
  }

  public async miaosha() {
    const { ctx, app } = this;
    this.ctx.body = await handle(app.taobao.miaosha(ctx.query.url, DT.taobao));
  }
}
