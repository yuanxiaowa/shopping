const request = require("request-promise-native");
const fs = require("fs");

const req = request.defaults({
  headers: {
    "x-requested-with": "XMLHttpRequest",
    "Accept-Language": "zh-CN",
    Referer: "http://www.jsjtxx.com/jpv2/web/personPlan!player.do",
    Accept: "application/json, text/javascript, */*; q=0.01",
    isajaxrequest: "yes",
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept-Encoding": "gzip, deflate",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
    Pragma: "no-cache",
    Cookie:
      "JSESSIONID=C8F38469CF1D52428FCD7B463F952DB2; 133_vq=6; 133_vq=3; Hm_lvt_100b5fcec311c71ddb1584b24b0cf2ab=1562574001; Hm_lpvt_100b5fcec311c71ddb1584b24b0cf2ab=1562574365; RouteId=c5bfe57fbee49310e84be1144f837a15"
  },
  transform(s) {
    var { message } = JSON.parse(s);
    try {
      return JSON.parse(message);
    } catch (e) {
      return message;
    }
  }
});
var startId;
if (fs.existsSync(".start-id")) {
  startId = Number(fs.readFileSync(".start-id"));
}
req
  .post(
    "http://www.jsjtxx.com/jpv2/web/$%7BpageContext.request.contextPath%7D/web/personPlan!createTreeJson.do"
  )
  .then(async list => {
    let startIndex = list.findIndex(item => item.id === startId);
    if (startIndex === -1) {
      startIndex = 0;
    }
    for (let i = startIndex; i < list.length; i++) {
      let item = list[i];
      let name = />(.*)</.exec(item.name)[1];
      try {
        if (!name.includes("(学时")) {
          continue;
        }
        console.log("开始学习", name);
        let info = await req.post(
          `http://www.jsjtxx.com/jpv2/web/player!treePlayHandle.do`,
          {
            qs: {
              chapterIds: item.id,
              chapterWareId: "",
              curCourseId: item.courseId,
              cj: Date.now(),
              handleType: "0"
            }
          }
        );
        fs.writeFile(".start-id", item.id, () => {});
        await handler(info);
        console.log("学习完", name);
      } catch (e) {
        console.error(name, e);
      }
    }
  });
async function handler(info, t = 60) {
  await delay(t);
  var msg = await req.post(
    "http://www.jsjtxx.com/jpv2/web/player!treePlayHandle.do",
    {
      qs: {
        cj: new Date().toUTCString(),
        handleType: "1",
        curCourseId: info.wareId,
        liao: info.fileNameCc
      }
    }
  );
  if (msg === "学习时长小于课件播放最小时长，请继续学习！") {
    console.log(msg, "30秒后再试");
    return handler(info, 30);
  }
  if (msg !== "{code:11}") {
    throw msg;
  }
}

function delay(t) {
  return new Promise(resolve => setTimeout(resolve, t * 1000));
}
