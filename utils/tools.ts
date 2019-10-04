/*
 * @Author: oudingyin
 * @Date: 2019-07-01 09:10:22
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-30 16:56:19
 */
import fs = require("fs-extra");
import moment = require("moment");
import { writeFile } from "fs-extra";
import { Spinner } from "cli-spinner";
import { DT } from "../app/common/config";

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

export function logResult() {
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
  return async (content: any, label: string, ext = ".txt") => {
    if (typeof content !== "string") {
      content = JSON.stringify(content);
    }
    var now = moment();
    var filename = `.data/${name}/${now.format(
      moment.HTML5_FMT.DATE
    )}/${label}/${now.format("HH_mm_ss.SSS") + ext}`;
    await fs.ensureFile(filename);
    return writeFile(filename, content);
  };
}

var https = require("https");

export function getSysTime(url: string, transform: (data: any) => number) {
  return async () => {
    function getDt(): Promise<{
      rtl: number;
      dt: number;
    }> {
      return new Promise(resolve => {
        var start = Date.now();
        https.get(url, res => {
          var end = Date.now();
          var text = "";
          res.on("data", chunk => (text += chunk));
          res.on("end", () => {
            var rtl = (end - start) / 2;
            var t = transform(JSON.parse(text));
            resolve({
              dt: rtl - (end - t),
              rtl
            });
          });
        });
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
  };
}

export const sysTaobaoTime = getSysTime(
  "https://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp",
  ({ data: { t } }) => t
);
export const sysJingdongTime = getSysTime(
  "https://a.jd.com//ajax/queryServerData.html",
  ({ serverTime }) => serverTime
);

export function TimerCondition(interval = 1500) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    var old_fn: Function = descriptor.value;
    descriptor.value = (data: any, duration = 15) => {
      var t = duration * 60 * 1000;
      var start = Date.now();
      async function f() {
        try {
          var ret = await old_fn.call(target, data);
          if (ret.success) {
            return ret.data;
          }
        } catch (e) {
          console.error(e);
        }
        if (Date.now() - start > t) {
          throw new Error("超时了");
        }
        console.log(new Date().toLocaleString(), interval + "ms后重试");
        await delay(interval);
        return f();
      }
      return f();
    };
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

export function Serial(t = 1500) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    var handlers: (() => any)[] = [];
    var pending = false;
    async function start() {
      if (pending === true) {
        return;
      }
      pending = true;
      while (handlers.length > 0) {
        try {
          await handlers.shift()!();
        } catch (e) {}
        await delay(t);
      }
      pending = false;
    }
    var old_fn = descriptor.value;
    descriptor.value = (...args: any[]) => {
      var p = new Promise((resolve, reject) => {
        handlers.push(() => old_fn.apply(target, args).then(resolve, reject));
      });
      start();
      return p;
    };
  };
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
      try {
        await handlers.shift()!();
      } catch (e) {}
      await delay(t);
    }
    pending = false;
  }
  return function(handler: () => any) {
    var p = new Promise(resolve => {
      handlers.push(() => handler().then(resolve));
    });
    start();
    return p;
  };
}

export function throwError(msg: string) {
  console.error(moment().toString(), msg);
  throw new Error(msg);
}

export async function sysPlatformTime(platform: string) {
  var handler = platform === "taobao" ? sysTaobaoTime : sysJingdongTime;
  console.log(platform + "开始同步时钟");
  var { dt, rtl } = await handler();
  console.log(
    platform + "同步时间",
    (dt > 0 ? "慢了" : "快了") + Math.abs(dt) + "ms"
  );
  console.log(platform + "单程时间", rtl + "ms");
  DT[platform] = dt + (platform === "taobao" ? Math.max(0, rtl - 20) : rtl);
}

const getDelayTime = (() => {
  var map: Record<number, Promise<number>> = {};
  return async (t: number, platform: string) => {
    if (map[t]) {
      return map[t];
    }
    let toTime = moment(t);
    if (toTime.format("mm:ss") !== "00:00") {
      return toTime.diff(moment()) - DT[platform];
    }
    let bt = 1000 * 60 * 10;
    let p = new Promise<number>(resolve => {
      setTimeout(async () => {
        await sysPlatformTime(platform);
        setTimeout(() => {
          delete map[t];
        }, bt + 5000);
        resolve(DT[platform]);
      }, toTime.diff(moment()) - DT[platform] - bt);
    });
    map[t] = p;
    return p;
  };
})();

interface TaskItem {
  id: number;
  name: string;
  platform: string;
  comment: string;
  url?: string;
  time?: number | string;
  timer?: any;
  cancel: () => void;
  handler?: () => Promise<any>;
  interval?: {
    handler: () => any;
    t: number;
  };
}

export class TaskManager {
  private tasks: TaskItem[] = [];
  private id = 0;
  private spinner = new Spinner();
  private count = 0;
  registerTask(
    data: Pick<
      TaskItem,
      "name" | "platform" | "comment" | "url" | "handler" | "time" | "interval"
    >,
    t: number
  ) {
    var id = this.id++;
    var p = <
      Promise<any> & {
        id: number;
      }
    >new Promise((resolve, reject) => {
      var toTime = moment(data.time);
      var time = toTime.valueOf();
      var status = "pending";
      var rejectHandler: any;
      var title = [data.platform, data.name, data.comment].join("-");
      var taskData = {
        id,
        name: data.name,
        platform: data.platform,
        comment: data.comment,
        url: data.url,
        cancel: rejectHandler,
        time: toTime.format(),
        timer: <any>0
      };
      if (!data.handler) {
        rejectHandler = (msg: string) => {
          if (taskData.timer) {
            clearTimeout(taskData.timer);
          }
          reject(msg);
        };
        if (data.url) {
          if (this.tasks.find(task => task.url === data.url)) {
            return rejectHandler(
              "已存在该任务 " + JSON.stringify(data.comment, null, 2)
            );
          }
        }
        (async () => {
          var dt = await getDelayTime(time, data.platform);
          taskData.timer = setTimeout(() => {
            this.removeTask(id);
            resolve();
          }, toTime.diff(moment()) - dt);
        })();
      } else {
        let update = (i: number) => {
          if (i === 1) {
            if (this.count === 0) {
              this.spinner.start();
            }
          } else {
            if (this.count === 1) {
              this.spinner.stop(true);
            }
          }
          this.count += i;
        };
        rejectHandler = (msg = `${moment().format()} 取消任务 ${title}`) => {
          status = "reject";
          update(-1);
          this.removeTask(id);
          reject(new Error(msg));
        };
        update(1);
        let f = async () => {
          try {
            if (status === "reject") {
              return;
            }
            this.spinner.setSpinnerTitle(`${moment().format()} ${title}`);
            let r = await data.handler!();
            if (r) {
              update(-1);
              this.removeTask(id);
              console.log(moment().format() + ` ${title} 任务已完成`);
              return resolve();
            }
            if (data.time) {
              if (Date.now() < time) {
                if (t) {
                  await delay(t);
                }
              } else {
                return rejectHandler(`${title} 超时了`);
              }
            }
            f();
          } catch (e) {
            if (e.name === "RequestError") {
              f();
              return;
            }
            rejectHandler(moment().format() + ` ${title} 任务已取消`);
          }
        };
        console.log(`${moment().format()} 开始任务 ${title}`);
        f();
        if (data.interval) {
          taskData.timer = setTimeout(function f() {
            data.interval!.handler();
            setTimeout(f, data.interval!.t);
          }, data.interval.t);
        }
      }
      this.tasks.push(taskData);
    });
    p.id = id;
    return p;
  }
  cancelTask(id: number) {
    var i = this.tasks.findIndex(item => item.id === id);
    if (i > -1) {
      let { timer, cancel } = this.tasks[i];
      cancel();
      if (timer) {
        clearTimeout(timer);
      }
      this.tasks.splice(i, 1);
    }
  }
  removeTask(id: number) {
    var i = this.tasks.findIndex(item => item.id === id);
    if (i > -1) {
      this.tasks.splice(i, 1);
    }
  }

  get items() {
    return this.tasks.map(({ id, name, platform, comment, url, time }) => ({
      id,
      name,
      platform,
      text: comment,
      url,
      time
    }));
  }
}

export const taskManager = new TaskManager();
