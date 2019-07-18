import fs = require("fs-extra");
import { join } from "path";
import moment = require("moment");
import { writeFile, writeJSON } from "fs-extra";

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
  return new Promise(resolve => setTimeout(resolve, t));
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
  return JSON.parse(/[\w$]+\(([\s\S]*)\)(;|$)/.exec(body.trim())![1]);
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

export function getCookieFilename(name: string) {
  return join(process.cwd(), ".data", "cookies", name + ".txt");
}

export function getCookieFromFile(name: string) {
  var filename = getCookieFilename(name);
  if (fs.existsSync(filename)) {
    return fs.readFileSync(filename, "utf8");
  }
  return "";
}

export function logFileWrapper(name: string) {
  return async (content: any, label: string) => {
    var now = moment();
    var filename = `.data/${name}/${now.format(moment.HTML5_FMT.DATE)}/${label +
      now.format("HH_mm_ss.SSS")}`;
    await fs.ensureFile(filename);
    if (typeof content === "string") {
      return writeFile(filename, content);
    }
    return writeJSON(filename, content);
  };
}
