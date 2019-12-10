/*
 * @Author: oudingyin
 * @Date: 2019-07-01 09:10:22
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-10-05 11:58:53
 */
import fs = require("fs-extra");
import moment = require("moment");
import { writeFile } from "fs-extra";
import { Spinner } from "cli-spinner";
import { DT, config } from "../app/common/config";
import request = require("request-promise-native");
import crypto = require("crypto");

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

export function logFileWrapper(name: string, fn = () => "") {
  return async (content: any, label: string, ext = ".txt") => {
    if (typeof content !== "string") {
      content = JSON.stringify(content);
    }
    var subname = fn();
    if (subname) {
      subname += "/";
    }
    var now = moment();
    var filename = `.data/${name}/${now.format(
      moment.HTML5_FMT.DATE
    )}/${subname}${label}/${now.format("HH_mm_ss.SSS") + ext}`;
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
      return new Promise((resolve, reject) => {
        var start = Date.now();
        https.get(url, res => {
          var end = Date.now();
          var text = "";
          res.on("data", chunk => (text += chunk));
          res.on("end", () => {
            try {
              var rtl = (end - start) / 2;
              var t = transform(JSON.parse(text));
              resolve({
                dt: rtl - (end - t),
                rtl
              });
            } catch (e) {
              reject(e);
            }
          });
        });
      });
    }
    var count = 100;
    var total = 0;
    var total_rtl = 0;
    var total_count = 0;
    for (let i = 0; i < count; i++) {
      try {
        var { rtl, dt } = await getDt();
        total += dt;
        total_rtl += rtl;
        total_count++;
      } catch (e) {}
    }
    return {
      dt: total / total_count,
      rtl: total_rtl / total_count
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

export function Serial(
  t = 1500,
  retryInfo?: {
    count: number;
    delay: number;
  }
) {
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
        if (t > 0) {
          await delay(t);
        }
      }
      pending = false;
    }
    var old_fn = descriptor.value;
    descriptor.value = (...args: any[]) => {
      var p = new Promise((resolve, reject) => {
        if (retryInfo) {
          let count = retryInfo.count;
          handlers.push(async function f() {
            count--;
            try {
              let r = await old_fn.apply(target, args);
              resolve(r);
            } catch (e) {
              console.error(count + 1, e.message);
              if (count > 0) {
                await delay(retryInfo.count);
                return f();
              } else {
                reject(e);
              }
            }
          });
        } else {
          handlers.push(() => old_fn.apply(target, args).then(resolve, reject));
        }
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
  console.error(moment().format(moment.HTML5_FMT.TIME), msg);
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
  DT[platform] =
    dt +
    (platform === "taobao"
      ? Math.max(0, rtl - config.delay_all)
      : Math.max(0, rtl - 100));
}

const getDelayTime = (() => {
  var map: Record<number, Promise<number>> = {};
  return async (t: number, platform: string) => {
    if (map[t]) {
      return map[t];
    }
    let toTime = moment(t);
    if (toTime.format("mm:ss") !== "00:00") {
      return DT[platform];
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
  cancel: (msg?: string) => void;
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

  private titles: string[] = [];
  private title_index = 0;
  private title_timer: any = 0;
  switchSpinTitle() {
    if (this.titles.length === 0) {
      return;
    }
    this.spinner.setSpinnerTitle(
      `${moment().format(moment.HTML5_FMT.TIME_SECONDS)} ${
        this.titles[this.title_index++]
      }`
    );
    this.title_index %= this.titles.length;
    this.title_timer = setTimeout(() => this.switchSpinTitle(), 500);
  }
  registerTask(
    data: Pick<
      TaskItem,
      "name" | "platform" | "comment" | "url" | "handler" | "time" | "interval"
    >,
    t: number,
    finish_msg = "任务已完成"
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
          this.removeTask(id);
          reject(new Error(msg));
        };
        if (data.url) {
          if (this.tasks.find(task => task.url === data.url)) {
            return rejectHandler(
              "\n 已存在该任务 " + JSON.stringify(data.comment, null, 2)
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
        let update = (b: number) => {
          if (b === 1) {
            this.titles.push(title);
            if (this.titles.length === 1) {
              this.title_timer = this.switchSpinTitle();
              this.spinner.start();
            }
          } else {
            let i = this.titles.indexOf(title);
            this.titles.splice(i, 1);
            if (this.titles.length === 0) {
              this.spinner.stop(true);
              clearTimeout(this.title_timer);
            }
          }
        };
        rejectHandler = (
          msg = `\n${moment().format(
            moment.HTML5_FMT.TIME_SECONDS
          )} 取消任务 ${title}`
        ) => {
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
            let r = await data.handler!();
            if (r) {
              update(-1);
              this.removeTask(id);
              console.log(
                `\n${moment().format(
                  moment.HTML5_FMT.TIME_SECONDS
                )} ${title} ${finish_msg}`
              );
              return resolve();
            }
            if (data.time) {
              if (Date.now() < time) {
                if (t) {
                  await delay(t);
                }
              } else {
                return rejectHandler(
                  `\n${moment().format(
                    moment.HTML5_FMT.TIME_SECONDS
                  )} ${title} 超时了`
                );
              }
            }
            f();
          } catch (e) {
            if (e.name === "RequestError") {
              f();
              return;
            }
            console.error(e);
            rejectHandler(
              `\n${moment().format(
                moment.HTML5_FMT.TIME_SECONDS
              )} ${title} 任务已取消`
            );
          }
        };
        console.log(
          `\n${moment().format(
            moment.HTML5_FMT.TIME_SECONDS
          )} 开始任务 ${title}`
        );
        f();
        if (data.interval) {
          taskData.timer = setTimeout(function f() {
            data.interval!.handler();
            setTimeout(f, data.interval!.t);
          }, data.interval.t);
        }
      }
      taskData.cancel = rejectHandler;
      this.tasks.push(taskData);
    });
    p.id = id;
    return p;
  }
  cancelTask(id: number) {
    var i = this.tasks.findIndex(item => item.id === id);
    if (i > -1) {
      let { timer, cancel } = this.tasks[i];
      cancel("手动取消任务 " + this.tasks[i].comment);
      if (timer) {
        clearTimeout(timer);
      }
      // this.tasks.splice(i, 1);
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

export function sendQQMsg(message: string, user_id = "870092104") {
  request.get("http://localhost:5700/send_private_msg", {
    qs: {
      user_id,
      message
    }
  });
}

export function md5(content: string) {
  return crypto
    .createHash("md5")
    .update(content)
    .digest("hex");
}
