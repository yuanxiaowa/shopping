import { Controller } from "egg";
import request = require("request-promise-native");
import { config } from "../common/config";

export default class ShopController extends Controller {
  public async qrcode() {
    var { ctx } = this;
    var text = await request.post("https://cli.im/api/browser/generate", {
      form: {
        data: ctx.query.url,
        zm: 0,
        dwz: 0,
        version: "2.5.2"
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36"
      }
    });
    var { status, data } = JSON.parse(text);
    if (status === 1) {
      ctx.body = {
        code: 0,
        data: data.qr_filepath
      };
    } else {
      ctx.body = {
        code: 1,
        msg: "二维码生成失败"
      };
    }
  }

  public async setConfig() {
    var { ctx } = this;

    ctx.body = {
      code: 0,
      data: Object.assign(config, ctx.request.body)
    };
  }

  public async getConfig() {
    var { ctx } = this;
    ctx.body = {
      code: 0,
      data: config
    };
  }
}
