import request = require("request-promise-native");
import { newPage } from "../../../utils/page";

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
