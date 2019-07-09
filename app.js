const request = require("request-promise-native");

var start = Date.now();
request
  .get("http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp")
  .then(res => {
    var {
      data: { t }
    } = JSON.parse(res);
    var now = Date.now();
    console.log((now - start) / 2, now - t);
  });
