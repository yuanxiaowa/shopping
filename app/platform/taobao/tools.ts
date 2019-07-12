import request = require("request-promise-native");

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
