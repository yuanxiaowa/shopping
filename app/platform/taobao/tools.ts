/*
 * @Author: oudingyin
 * @Date: 2019-07-12 15:48:14
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 11:30:50
 */
import request = require("request-promise-native");
import { newPage } from "../../../utils/page";
import { logFileWrapper } from "../../../utils/tools";
import signData from "./h";
import bus_global from "../../common/bus";
import setting from "./setting";
import { jar } from "../../common/config";

export async function resolveTaokouling(text: string) {
  var data: string = await request.post(
    "http://www.taokouling.com/index/taobao_tkljm",
    {
      form: {
        text
      },
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      },
      gzip: true
    }
  );
  return <string>JSON.parse(data).data.url;
}

export async function resolveUrl(url: string) {
  if (!url.startsWith("http")) {
    url = await resolveTaokouling(url);
  }
  if (/^https?:\/\/s.click.taobao.com\/t/.test(url) || url.includes("t.cn/")) {
    var page = await newPage();
    await page.goto(url);
    url = page.url();
    page.close();
  } else if (url.startsWith("https://m.tb.cn/")) {
    let html: string = await request.get(url);
    return /var url = '([^']+)/.exec(html)![1];
  }
  return url;
}

export var logFile = logFileWrapper("taobao");

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
  ttid = "#b#ad##_h5"
) {
  var t = Date.now();
  var data_str = JSON.stringify(data);
  var form: any;
  var token = setting.token;
  token = token && token.split("_")![0];
  var qs: any = {
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
    H5Request: true
  };
  var sign = signData([token, t, setting.appKey, data_str].join("&"));
  qs.sign = sign;
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
      form
    }
  );
  var { data, ret } = JSON.parse(text);
  var arr_msg = ret[ret.length - 1].split("::");
  var code = arr_msg[0];
  var msg = arr_msg[arr_msg.length - 1];
  if (code !== "SUCCESS") {
    let err = new Error(msg);
    err.name = code;
    logFile(text, "_err-" + api);
    throw err;
  }
  return data;
}
