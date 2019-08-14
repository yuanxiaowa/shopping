import fs = require("fs-extra");
import { join } from "path";
import moment = require("moment");
import { writeFile, writeJSON } from "fs-extra";
import http = require("http");

export function remain(h: number, m = 0) {
  var now = new Date();
  var next = new Date();
  next.setHours(h);
  next.setMinutes(m);
  next.setSeconds(0);
  next.setMilliseconds(0);
  // @ts-ignore
  return next - now;
}

export function diffToNow(s: string) {
  let now = new Date();
  if (/^\d{2}(:\d{2}){2}$/.test(s)) {
    s = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${s}`;
  }
  console.log(s);
  let next = new Date(s).getTime();
  return next - now.getTime();
}

export function delay(t = 1000) {
  return new Promise<void>(resolve => setTimeout(resolve, t));
}

export function timer(t: number, total = Number.MAX_VALUE) {
  const handler = (f: Function) => {
    f();
    total--;
    if (total > 0) {
      setTimeout(() => handler(f), t);
    }
  };
  return handler;
  /* return (target: any, key: string, desc: PropertyDescriptor) => {
    var old_f: Function = desc.value;
    desc.value = (...args: any[]) => {
      total--;
      if (total > 0) {
        setTimeout(desc.value, t);
      }
      return old_f.call(target, ...args);
    };
  }; */
}

export function timerCondition<T = any>(t: number, fn: (data: T) => boolean) {
  const handler = async (f: Function) => {
    try {
      var data = await f();
      if (fn(data)) {
        console.log(data, fn(data));
        setTimeout(() => handler(f), t);
      }
    } catch (e) {
      setTimeout(() => handler(f), t);
    }
  };
  return handler;
}

export function log(msg: string) {
  console.log(new Date().toLocaleString(), msg);
}

export function logError(msg: string, e: Error) {
  console.log(new Date(), msg, e.message);
}

export async function logReq(msg: string, handler: Function) {
  try {
    log(msg);
    await handler();
  } catch (e) {
    logError(msg, e);
  }
}

export function logResult(msg: string) {
  return (target: any, key: string, desc: PropertyDescriptor) => {
    var old_f: Function = desc.value;
    desc.value = async (...args: any[]) => {
      var ret = await old_f.call(target, ...args);
      return ret;
    };
  };
}
export function getJsonpData<T = any>(body: string): T {
  let text = /[\w$]+\(([\s\S]*)\)(;|$)/.exec(body.trim())![1];
  return eval(`(${text})`);
}

export function writeResult(filename: string) {
  return (target: any, key: string, desc: PropertyDescriptor) => {
    var old_f: Function = desc.value;
    desc.value = async (...args: any[]) => {
      var ret = await old_f.call(target, ...args);
      fs.writeFile(filename, JSON.stringify(ret));
      return ret;
    };
  };
}

export function delayRun(time?: string | number, label = "") {
  return new Promise(resolve => {
    let t = 0;
    if (time) {
      if (typeof time === "string") {
        t = diffToNow(time);
      } else {
        t = time;
      }
    }
    console.log(
      `${label}:将在${(t / 60000) >> 0}分${((t / 1000) >> 0) % 60}秒后开始`
    );
    setTimeout(resolve, t);
  });
}

export function getCookie(name: string, cookie: string) {
  var arr = new RegExp(`${name}=([^;]+)`).exec(cookie);
  if (arr) {
    return arr[1];
  }
  return "";
}

export function logFileWrapper(name: string) {
  return async (content: any, label: string) => {
    var now = moment();
    var filename = `.data/${name}/${now.format(
      moment.HTML5_FMT.DATE
    )}/${label}/${now.format("HH_mm_ss.SSS")}`;
    await fs.ensureFile(filename);
    if (typeof content === "string") {
      return writeFile(filename, content);
    }
    return writeJSON(filename, content);
  };
}

export async function sysTaobaoTime() {
  function getDt(): Promise<{
    rtl: number;
    dt: number;
  }> {
    return new Promise(resolve => {
      var start = Date.now();
      http.get(
        "http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp",
        res => {
          var end = Date.now();
          var text = "";
          res.on("data", chunk => (text += chunk));
          res.on("end", () => {
            var rtl = (end - start) / 2;
            var {
              data: { t }
            } = JSON.parse(text);
            resolve({
              dt: rtl - (end - t),
              rtl
            });
          });
        }
      );
    });
  }
  var count = 100;
  var total = 0;
  var total_rtl = 0;
  for (let i = 0; i < count; i++) {
    var { rtl, dt } = await getDt();
    total += dt;
    total_rtl += rtl;
  }
  return {
    dt: total / count,
    rtl: total_rtl / count
  };
}

export function createTimerExcuter<T = any>(
  func: Function,
  duration = 15,
  interval = 1500
) {
  var t = duration * 60 * 1000;
  var start = Date.now();
  return new Promise<T>((resolve, reject) => {
    async function f() {
      var ret = await func();
      if (ret.success) {
        resolve(ret.data);
      } else {
        if (Date.now() - start > t) {
          reject("超时了");
        } else {
          console.log(new Date().toLocaleString(), interval + "ms后重试");
          setTimeout(f, interval);
        }
      }
    }
    f();
  });
}

export function createScheduler(t = 1500) {
  var handlers: (() => any)[] = [];
  var pending = false;
  async function start() {
    if (pending === true) {
      return;
    }
    pending = true;
    while (handlers.length > 0) {
      await handlers.shift()!();
      await delay(t);
    }
    pending = false;
  }
  return function(handler: () => any) {
    var p = new Promise(resolve => {
      handlers.push(() => resolve(handler()));
    });
    start();
    return p;
  };
}

export async function createDailyTask(handler: () => any, hours?: number[]) {
  if (!hours) {
    await handler();
  } else {
    for (let hour of hours) {
      if (new Date().getHours() < hour) {
        await delay(moment(hour, "HH").diff(moment()));
        await handler();
      }
    }
  }
  await delay(
    moment("00", "HH")
      .add("d", 1)
      .diff(moment())
  );
  return createDailyTask(handler, hours);
}
