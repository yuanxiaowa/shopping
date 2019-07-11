import { Controller } from "egg";

export default class TaobaoController extends Controller {
  public async cartInfo() {
    const { ctx } = this;
    ctx.body = { a: 1 };
  }
}
