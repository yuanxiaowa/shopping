import { Controller } from "egg";
import moment = require("moment");
import { delay } from "../../utils/tools";

export default class ShopController extends Controller {
  public async cartList() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    ctx.body = await app[platform].cartList();
  }
  public async cartBuy() {
    const { ctx, app } = this;
    var { platform, t } = ctx.query;
    var { data } = ctx.body;
    console.log(platform, moment(t).fromNow(), "从购物车购买");
    await delay(moment().diff(t));
    ctx.body = await app[platform].cartBuy(data);
  }
  public async cartToggle() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var data = ctx.body;
    ctx.body = await app[platform].cartToggle(data);
  }
  public async cartAdd() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var data = ctx.body;
    ctx.body = await app[platform].cartAdd(data);
  }
  public async cartDel() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var data = ctx.body;
    ctx.body = await app[platform].cartDel(data);
  }
  public async cartUpdateQuantity() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var data = ctx.body;
    ctx.body = await app[platform].cartUpdateQuantity(data);
  }
  public async buyDirect() {
    const { ctx, app } = this;
    var { platform, t } = ctx.query;
    var data = ctx.body;
    console.log(platform, moment(t).fromNow(), "直接购买");
    await delay(moment().diff(t));
    ctx.body = await app[platform].buyDirect(data);
  }
  public async coudan() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var { data } = ctx.body;
    ctx.body = await app[platform].coudan(data);
  }
  public async qiangquan() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var { data } = ctx.body;
    ctx.body = await app[platform].qiangquan(data);
  }
  public async commentList() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    ctx.body = await app[platform].commentList();
  }
  public async comment() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var data = ctx.body;
    ctx.body = await app[platform].comment(data);
  }
  public async resolveUrl() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var { data } = ctx.body;
    ctx.body = await app[platform].resolveUrl(data);
  }
  public async resolveUrls() {
    const { ctx, app } = this;
    var { platform } = ctx.query;
    var { data } = ctx.body;
    ctx.body = await app[platform].resolveUrls(data);
  }
}
