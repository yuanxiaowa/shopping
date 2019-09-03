/*
 * @Author: oudingyin
 * @Date: 2019-09-03 16:12:52
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-03 16:21:27
 */
import request = require("request-promise-native");

// @ts-ignore
export const config = {
  req: request.defaults({
    jar: true,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36"
    }
  })
};
