import { Controller } from "egg";
import moment = require("moment");
import { delay } from "../../utils/tools";

async function handle(p: Promise<any>, msg?: string) {
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

export default class ShopController extends Controller {
  public async cartList() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    ctx.body = await handle(app[platform].cartList(), "已获取购物车数据");
  }
  public async cartBuy() {
    const { ctx, app } = this;
    var { platform, t } = ctx.query;
    var data = ctx.request.body;
    var dt = moment(t).diff(moment());
    if (dt > 0) {
      (async () => {
        await delay(dt);
        console.log(platform, "开始直接下单");
        await app[platform].cartBuy(data);
      })();
      ctx.body = {
        code: 0,
        msg: moment(t || undefined).fromNow() + " 直接下单"
      };
    } else {
      ctx.body = await handle(app[platform].cartBuy(data), "下单成功");
    }
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
    var dt = moment(t).diff(moment());
    if (dt > 0) {
      (async () => {
        let p1 = delay(dt);
        let goodsInfo = await ins.getGoodsInfo(data.url, data.skus);
        let nextData = ins.getNextDataByGoodsInfo(goodsInfo, data.quantity);
        await p1;
        console.log(platform, "开始从购物车下单");
        await handle(ins.submitOrder(nextData, data.other));
      })();
      ctx.body = {
        code: 0,
        msg: moment(t || undefined).fromNow() + " 将直接下单"
      };
    } else {
      ctx.body = await handle(ins.buyDirect(data), "下单成功");
    }
  }
  public async coudan() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var { data } = ctx.request.body;
    ctx.body = await handle(app[platform].coudan(data));
  }
  public async qiangquan() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var { data } = ctx.request.body;
    ctx.body = await handle(app[platform].qiangquan(data));
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
  public async resolveUrls() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var { data } = ctx.request.body;
    ctx.body = await handle(app[platform].resolveUrls(data));
  }
  /**
   * 超市秒杀
   */
  public async seckillList() {
    const { ctx, app } = this;
    var { platform, name } = ctx.query;
    ctx.body = await handle(app[platform].seckillList(name));
  }

  public async sixtyCourseList() {
    const { ctx, app } = this;
    ctx.body = await handle(app.taobao.sixtyCourseList());
  }
  public async sixtyCourseReply() {
    const { ctx, app } = this;
    ctx.body = await handle(app.taobao.sixtyCourseReply(ctx.query));
  }
}
