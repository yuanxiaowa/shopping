/*
 * @Author: oudingyin
 * @Date: 2019-09-02 14:43:19
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 09:40:25
 */
import moment = require("moment");
import { delay } from "./tools";
import { DT } from "../app/common/config";

export function log(label: string) {
  return (target: any, key: string, desc: PropertyDescriptor) => {
    var old_f: Function = desc.value;
    desc.value = (...args: any[]) => {
      console.log(moment().toString(), label);
      return old_f.apply(target, args);
    };
  };
}

export function timer(t = 60 * 1000, count = Infinity) {
  return (target: any, key: string, desc: PropertyDescriptor) => {
    var old_f: Function = desc.value;
    desc.value = function(...args: any[]) {
      var c = 0;
      var func = () => {
        var ret = old_f.apply(this, args);
        if (++c < count) {
          setTimeout(func, t);
        }
        return ret;
      };
      return func();
    };
  };
}

export function timerCondition(handler: (data: any) => boolean, t = 1000 * 60) {
  return (target: any, key: string, desc: PropertyDescriptor) => {
    var old_f: Function = desc.value;
    desc.value = (...args: any[]) => {
      var func = async () => {
        var ret = await old_f.apply(target, args);
        if (handler(ret)) {
          setTimeout(func, t);
        }
        return ret;
      };
      return func();
    };
  };
}

export function timerHourPoint(hours: number[][], t = 0) {
  return (target: any, key: string, desc: PropertyDescriptor) => {
    var old_f: Function = desc.value;
    desc.value = (...args: any[]) => {
      var func = async () => {
        for (let [start, end] of hours) {
          let now = new Date();
          let h = now.getHours();
          if (h < end) {
            if (h < start) {
              await delay(
                moment(
                  "00".substring(start < 10 ? 1 : 2) + start,
                  "HH"
                ).valueOf() -
                  now.getTime() -
                  DT.jingdong +
                  t
              );
            }
            old_f.apply(target, args);
          }
        }
      };
      return func();
    };
  };
}

export const daily = (() => {
  const funcs_map: Record<string, Function[]> = {};
  function run(t: string) {
    var funcs = funcs_map[t];
    setTimeout(
      () => funcs.forEach(func => func()),
      moment(t, "HH")
        .add("d", 1)
        .valueOf() - Date.now()
    );
  }
  return (t = "00") => {
    if (!funcs_map.hasOwnProperty(t)) {
      funcs_map[t] = [];
      run(t);
    }
    return (target: any, key: string, desc: PropertyDescriptor) => {
      var old_f: Function = desc.value;
      desc.value = (...args: any[]) => {
        var func = () => old_f.apply(target, args);
        funcs_map[t].push(func);
        return func();
      };
    };
  };
})();
