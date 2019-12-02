/*
 * @Author: oudingyin
 * @Date: 2019-07-12 15:48:14
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-30 16:46:34
 */
import request = require("request-promise-native");
import { newPage } from "../../../utils/page";
import { logFileWrapper, md5 } from "../../../utils/tools";
import setting from "./setting";
import { jar } from "../../common/config";

export class Taokouling {
  req = request.defaults({
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      Cookie:
        "PHPSESSID=pm3qggbm4u7p8373ogu3aljqj4; UM_distinctid=16df26fbfa43f0-03658146aed134-3c375f0d-1fa400-16df26fbfa549c; tkdg_user_info=think%3A%7B%22id%22%3A%2245137%22%2C%22password%22%3A%2229d82efd358b8a2f85ac0b7d99a8fbe2%22%7D; Hm_lvt_73f904bff4492e23046b74fe0d627b3d=1575264071,1575264385,1575264390,1575264467; CNZZDATA1261806159=583648882-1571728999-https%253A%252F%252Fwww.baidu.com%252F%7C1575270309; Hm_lpvt_73f904bff4492e23046b74fe0d627b3d=1575272041"
    },
    gzip: true
  });

  async resolveText(tkl: string) {
    var data: string = await this.req.get(
      "https://api.taokouling.com/tkl/tkljm",
      {
        qs: {
          tkl,
          apikey: "ccNMxlaXdJ"
        }
      }
    );
    return <string>JSON.parse(data).url;
  }

  async resolveClick(url: string) {
    var text = await this.req.post(
      "http://www.taokouling.com/index/tbclickljjx/",
      {
        form: {
          url
        }
      }
    );
    return getGoodsUrl(JSON.parse(text).data.itemid);
  }
}

export const taokouling = new Taokouling();

export async function resolveUrl(url: string) {
  if (!url.startsWith("http")) {
    url = await taokouling.resolveText(url);
  }
  if (url.includes("t.cn/")) {
    var page = await newPage();
    await page.goto(url);
    url = page.url();
    page.close();
  }
  // http://t.cn/AigEktko
  else if (url.startsWith("https://m.tb.cn/")) {
    let html: string = await request.get(url);
    return /var url = '([^']+)/.exec(html)![1];
  }
  if (/^https?:\/\/s.click.taobao.com\/t/.test(url)) {
    url = await taokouling.resolveClick(url);
  }
  return url;
}

export var logFile = logFileWrapper("taobao", () => setting.username);

export function getItemId(url: string) {
  if (url.startsWith("https://a.m.taobao.com")) {
    return /(\d+)\.htm/.exec(url)![1];
  }
  return /id=(\d+)/.exec(url)![1];
}
export function getGoodsUrl(itemId: string) {
  return `https://detail.m.tmall.com/item.htm?id=${itemId}`;
}

export function setReq() {
  setting.token = getCookie("_m_h5_tk");
}

export function getCookie(key: string) {
  var item = jar
    .getCookies("https://www.taobao.com")
    .find(item => item.key === key);
  return item ? item.value : "";
}

export async function requestData(
  api: string,
  data: any,
  method: "get" | "post" = "get",
  version = "6.0",
  ttid = "#b#ad##_h5",
  _qs?: any
) {
  var t = Date.now() + 1000;
  var data_str = JSON.stringify(data);
  var form: any;
  var token = setting.token;
  token = token && token.split("_")![0];
  var qs: any = Object.assign(
    {
      jsv: "2.5.1",
      appKey: setting.appKey,
      api,
      v: version,
      type: "originaljson",
      ecode: 1,
      dataType: "json",
      t,
      ttid,
      AntiFlood: true,
      LoginRequest: true,
      H5Request: true,
      post: method === "post" ? 1 : undefined
    },
    _qs
  );
  qs.sign = md5([token, t, setting.appKey, data_str].join("&"));
  if (method === "get") {
    qs.data = data_str;
  } else {
    form = {
      data: data_str
    };
  }
  var text: string = await setting.req(
    `https://h5api.m.taobao.com/h5/${api}/${version}/`,
    {
      method,
      qs,
      form,
      timeout: 1000 * 30
    }
  );
  var { data, ret } = JSON.parse(text);
  var arr_msg = ret[ret.length - 1].split("::");
  var code = arr_msg[0];
  var msg = arr_msg[arr_msg.length - 1];
  if (code !== "SUCCESS") {
    let err = new Error(msg);
    err.name = api + code;
    logFile(text, "_err-" + api);
    throw err;
  }
  return data;
}
