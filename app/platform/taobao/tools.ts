import request = require("request-promise-native");
import { newPage } from "../../../utils/page";
import { logFileWrapper, getCookie } from "../../../utils/tools";
import signData from "./h";
import bus_global from "../../common/bus";

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
  if (/^https?:\/\/s.click.taobao.com\/t/.test(url)) {
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

export var mteeInfo = {
  mteeAsac: "1A19322J4Z3PLXO583LRB6",
  mteeType: "sdk",
  mteeUa:
    "118#ZVWZzwoQWZOMce1AcZ2C2ZZTZeeh2Z3PZe2x1zqTzHRzZyCZXoTSOE2zZCmQVHR4Zg2ZOzqTzfQZZZZZyUTctZxv2ic2vggVZZZuusqhzeWZZZZ/VoTXlZ2Z2Z+hyGeaZZZ1ZsiTzeWzZgFZVoqaYH2zZZ+TXHWVZgZZZsqTzeRzZZZ/Voq4zeZzZewiXHWVZgYmZzqXugQzAgZ+13uiEMgZAYuKXd/OqQHJZCuD2VjFDmBX0C2chjPmY26t+uqvOHMh/9AaugZCmrDtKHZzhSb7VjJOheZTtBs5MfQ16oArfK5BsYqKD1184zinpXcsW+SGYAuaz67WTu+xQWzBUeNthJxTVO/OdITR/qhhsVAK6bw7pmnFRiO2gto4LFW+L6qXg47/ENel0VQN2kE03NZgMMrQdmdvraOVFlk/H2HpbwVQtqir2dohTjEvB9R6Ke2BApCluW8SVnqQqQFp2xph96B2ffyd4OrysMsMvaNRAh7Rh1Sa5+a0n7h9Nq90SSJJq+YI+T2kuCiQ7mmvJWLvo2xzhUd0K2p5By38syqGNJPF9LOEJavnVIqe/8vFhIAcEsG/QN2qlDCWkp3h6VsVuWKjRi2I8foq4tVGNBxffzAoWqfQTDFijzCZXp5uv1WDulAqQjqe1oAhqhUa0B7uSMz4q1upLZr7EEZYrKffq9dE8fLod9cybaR9cEZ6oyDBCttgvsSGY1OlOakcl/Y++eMWwgNoCC3Wg8XnO6eWvoTX6oqIJ0ODfQhK1phwmcLs8g/YoUFi7eVWWYWvNtb9LJlXBO4On7HiWAbH/rcED1sjC63hfNEJTK9ePmoZs0hFZNJvzFhznsV/C70C0DjCBOV+WCJTTDpYoP/LEfQbRpRHAB5UfZIRSFZgYAKd6djO3hfSolSenQ1WDpuC1WfJMpoSNa4jj4fL6tvWG36B0ql/kG4TID1KKPiI9r8KoRdgkI/U3n4IUVGgHJXC5A+eZh5RmjYo5kJppMDWQ6YuJtNqSFRZLXMwKdEtUjpl2nAs1PD4JuIOAGSpzJOw/rmeFEmWoWs4CmWiG+Y5VtIu3z9VqChym6YYTdeQ6R7e1c8ednj7ppetA0XuL8XNXz/AB0uCr7yGYdYPs3gjWx+wNK+wfEGxJRW0lsF64B0iFw++ciqIKhqt2EbaqMNzLiV3FHwLwy0VF8OegMIcX46igQkn5xfkrwO4kTF4c+F4QZKlJGC55aeKpKAkMsGFqQ+wFlRLZn4I+mFkJKoBN4HE+mNkasj+r7WFsQ3voJklRjLYyyNtjfTFnz9xW1FerxD/yOwx8Kc5rmWlKFSv7V5980z9kw5aHedoaX/vrILcugZSvLxTD/4RVTK7b70JB0PCJh5pOLPsrBaUs8mup/zbO1GwVD+ckUJlyBVQHFJn4IAh3SMRQhvZCHPYwCcww5Llswe1ziLEUMUHZEKQaRTN31MZwcj/R5GISZk+t7sFIW3WriuoIRPUW+owiEHU4zti8Zs9dctB2Vg5yE5Um/ujdjAaau28rzm+OCJwn+1J9UfCQj5mk3FccKwLFM6fSqUQrKU6UINbSZZUv7cXq3B3L2fT8WRCvsXTABH3/VkF2vENTW2rGkeon+l5ifriuammRyitrbI36s1Dkxv/2p+I6ZQQi+ybrcdBIOOZptSDHNkZZrNUkVpAVeU+pTQq5gqwM2oS4lO63qSfmll4Jwnv15cZH4S34R6WG8a8LHFFk4muSDjEFlCbAWdRPdr6PJXqoEiPu9h8HUd8ZGpfLuya3R7qw6++LAO6WfC93+8r9TXB58dqpgf2g2thao3311tinHBhzniQWTQLpab1TmsHEYRwr2WODuLwNnSHHcBlTVaGUziBRMWN0UEOGlFWDRiovNGNEFujZsggZpomiNbGaOS+fpVAxxVwedPoUlcV",
  ulandSrc: "201_11.230.188.217_8942114_1563529853358",
  umidToken: "T1B909C1008F917EC23F10509E607EFB7EF74F21A9C621A9A956FAEDC63"
};

export function getItemId(url: string) {
  if (url.startsWith("https://a.m.taobao.com")) {
    return /(\d+)\.htm/.exec(url)![1];
  }
  return /id=(\d+)/.exec(url)![1];
}

var req: request.RequestPromiseAPI;
var cookie = "";

export function setReq(
  /* _req: request.RequestPromiseAPI,  */ _cookie: string
) {
  cookie = _cookie;
  req = request.defaults({
    jar: true,
    headers: {
      cookie: _cookie,
      "user-agent":
        '"Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"'
    }
  });
}

bus_global.on("taobao:cookie", setReq);

export function getReq() {
  return req;
}

const appKey = "12574478";

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
  var token = getCookie("_m_h5_tk", cookie);
  token = token && token.split("_")![0];
  var qs: any = {
    jsv: "2.4.7",
    appKey,
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
  var sign = signData([token, t, appKey, data_str].join("&"));
  qs.sign = sign;
  if (method === "get") {
    qs.data = data_str;
  } else {
    form = {
      data: data_str
    };
  }
  var text: string = await req(
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
