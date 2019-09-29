/*
 * @Author: oudingyin
 * @Date: 2019-07-11 18:00:06
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-29 10:57:42
 */
import { Controller } from "egg";
import moment = require("moment");
import { sysTaobaoTime, sysJingdongTime, taskManager } from "../../utils/tools";
import { DT } from "../common/config";
import R = require("ramda");

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
  DT[platform] = dt + (platform === "taobao" ? 0 : rtl);
}

sysTime("taobao").then(() => sysTime("jingdong"));

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
        let p = taskManager.registerTask(
          {
            name: `从购物车下单`,
            time: t,
            platform,
            comment: data._comment
          },
          dt
        );
        data.seckill = true;
        (async () => {
          console.log(platform, t + "从购物车下单");
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
  public async buyDirect() {
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
        let p = taskManager.registerTask(
          {
            name: `直接购买`,
            time: t,
            platform,
            comment: data._comment,
            url: data.url
          },
          dt
        );
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
        let p = taskManager.registerTask(
          {
            name: `抢券`,
            time: t,
            platform,
            comment: data._comment
          },
          dt
        );
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
      R.sort(
        (a, b) => moment(a.time).valueOf() - moment(b.time).valueOf(),
        taskManager.items
      )
    );
  }

  public async taskCancel() {
    const { ctx } = this;
    var { id } = ctx.query;
    let item = taskManager.items.find(R.propEq("id", Number(id)));
    if (!item) {
      ctx.body = {
        code: 1,
        msg: "指定任务不存在"
      };
      return;
    }
    ctx.body = await handle(taskManager.cancelTask(item.id));
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
