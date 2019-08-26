/*
 * @Author: oudingyin
 * @Date: 2019-08-26 14:38:22
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-26 14:57:11
 */
import request = require("request-promise-native");

interface Setting {
  req: request.RequestPromiseAPI;
  cookie: string;
  fp: string;
  eid: string;
}

const setting = <Setting>{
  eid: "",
  fp: "0a2d744505998993736ee93c5880c826"
};

export default setting;

export function setSetting(name: keyof Setting, value: any) {
  setting[name] = value;
}
