/*
 * @Author: oudingyin
 * @Date: 2019-09-13 02:33:00
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-13 02:33:00
 */
const fs = require("fs");
const qs = require("querystring");

function handleTextData(name) {
  var text = fs.readFileSync(`.data/${name}`, "utf8");
  var data = qs.parse(text);
  return transformData(data, "textdata1.json");
}

function handleFormData(name) {
  var text = fs.readFileSync(`.data/${name}`, "utf8");
  var data = JSON.parse(text);
  return transformData(data, "textdata2.json");
}

function transformData(data, filename) {
  Object.keys(data).forEach(key => {
    data[key] = decodeURIComponent(data[key]);
  });

  ["hierarchy", "data", "linkage", "endpoint"].forEach(key => {
    var ret = JSON.parse(data[key]);
    data[key] = getSortedData(ret);
  });
  var ret = getSortedData(data);
  fs.writeFileSync(".data/" + filename, JSON.stringify(ret, null, 2));
}

function getSortedData(data) {
  return Object.keys(data)
    .sort()
    .reduce((state, key) => {
      state[key] = data[key];
      return state;
    }, {});
}

handleTextData("form_params.txt");
handleFormData("my-params.json");
