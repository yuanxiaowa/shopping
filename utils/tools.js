"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
function remain(h, m = 0) {
    var now = new Date();
    var next = new Date();
    next.setHours(h);
    next.setMinutes(m);
    next.setSeconds(0);
    next.setMilliseconds(0);
    // @ts-ignore
    return next - now;
}
exports.remain = remain;
function diffToNow(s) {
    let now = new Date();
    if (/^\d{2}(:\d{2}){2}$/.test(s)) {
        s = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${s}`;
    }
    console.log(s);
    let next = new Date(s).getTime();
    return next - now.getTime();
}
exports.diffToNow = diffToNow;
function delay(t = 1000) {
    return new Promise(resolve => setTimeout(resolve, t));
}
exports.delay = delay;
function timer(t, total = Number.MAX_VALUE) {
    const handler = (f) => {
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
exports.timer = timer;
function timerCondition(t, fn) {
    const handler = async (f) => {
        try {
            var data = await f();
            if (fn(data)) {
                console.log(data, fn(data));
                setTimeout(() => handler(f), t);
            }
        }
        catch (e) {
            setTimeout(() => handler(f), t);
        }
    };
    return handler;
}
exports.timerCondition = timerCondition;
function log(msg) {
    console.log(new Date().toLocaleString(), msg);
}
exports.log = log;
function logError(msg, e) {
    console.log(new Date(), msg, e.message);
}
exports.logError = logError;
async function logReq(msg, handler) {
    try {
        log(msg);
        await handler();
    }
    catch (e) {
        logError(msg, e);
    }
}
exports.logReq = logReq;
function logResult(msg) {
    return (target, key, desc) => {
        var old_f = desc.value;
        desc.value = async (...args) => {
            var ret = await old_f.call(target, ...args);
            return ret;
        };
    };
}
exports.logResult = logResult;
function extractJsonpData(text, key) {
    return JSON.parse(new RegExp(`${key}\\((.*)\\);`).exec(text)[1]);
}
exports.extractJsonpData = extractJsonpData;
function writeResult(filename) {
    return (target, key, desc) => {
        var old_f = desc.value;
        desc.value = async (...args) => {
            var ret = await old_f.call(target, ...args);
            fs_extra_1.default.writeFile(filename, JSON.stringify(ret));
            return ret;
        };
    };
}
exports.writeResult = writeResult;
function delayRun(time, label = "") {
    return new Promise(resolve => {
        let t = 0;
        if (time) {
            if (typeof time === "string") {
                t = diffToNow(time);
            }
            else {
                t = time;
            }
        }
        console.log(`${label}:将在${(t / 60000) >> 0}分${((t / 1000) >> 0) % 60}秒后开始`);
        setTimeout(resolve, t);
    });
}
exports.delayRun = delayRun;
function getCookie(name, cookie) {
    return new RegExp(`${name}=([^;]+)`).exec(cookie)[1];
}
exports.getCookie = getCookie;
