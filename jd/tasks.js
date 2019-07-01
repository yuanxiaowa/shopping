"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jd_util_1 = require("./jd-util");
const jr_util_1 = require("./jr-util");
const jinrong_1 = require("./jinrong");
Promise.all([jd_util_1.doAll(), jr_util_1.doAll()])
    .then(() => jinrong_1.getSignJRInfo())
    .then(({ isGet }) => {
    if (!isGet) {
        jinrong_1.getSignAwardJR();
    }
});
