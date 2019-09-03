import { config } from "./setting";

/*
 * @Author: oudingyin
 * @Date: 2019-09-03 16:14:52
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-03 20:54:47
 */

export async function checkUser(): Promise<boolean> {
  var text = await config.req.post("https://kyfw.12306.cn/otn/login/checkUser");
  var {
    data: { flag }
  } = JSON.parse(text);
  return flag;
}

interface ResData {
  result_code: string;
  result_message: string;
}

export async function getCapchaImage() {
  var text = await config.req.get(
    "https://kyfw.12306.cn/passport/captcha/captcha-image64",
    {
      qs: {
        login_site: "E",
        module: "login",
        rand: "sjrand",
        1567499473633: "",
        callback: "jQuery19105808962391738053_1567497221230",
        _: Date.now()
      }
    }
  );
  var { image } = getJsonpData(text);
  return /* "data:image/jpg;base64," + */ image;
}

export async function checkCapchaImage(answer: string) {
  var text = await config.req.get(
    "https://kyfw.12306.cn/passport/captcha/captcha-check",
    {
      qs: {
        callback: "jQuery19105808962391738053_1567497221230",
        answer,
        rand: "sjrand",
        login_site: " E",
        _: Date.now()
      }
    }
  );
  var { result_code, result_message }: ResData = getJsonpData(text);
  // 4: 验证码校验成功
  // 5: 验证码校验失败
  return result_code === "4";
}

export async function login(data: {
  username: string;
  password: string;
  answer: string;
}) {
  var text = await config.req.post("", {
    form: Object.assign(data, { appid: "otn" })
  });
  var { result_code, result_message } = JSON.parse(text);
  // {"result_message":"登录名不存在。","result_code":1}
  return result_code !== 1;
}

/* (async () => {
  for (let i = 0; i < 50; i++) {
    var txt = await getCapchaImage();
    var buf = new Buffer(txt, "base64");
    require("fs-extra").writeFile(`.data/${i}.jpg`, buf);
  }
})(); */

export async function recognizeImage(txt: string) {
  var value = new Buffer(txt, "base64");
  var html = await config.req.post("http://littlebigluo.qicp.net:47720/", {
    formData: {
      pic_xxfile: {
        value,
        options: {
          filename: "topsecret.jpg",
          contentType: "image/jpeg"
        }
      }
    }
  });
  var str = /<B>(.*?)<\/B>/.exec(html)![1];
  var position = str.split(" ").map(s => {
    var n = Number(s) - 1;
    var row = (n / 4) >> 0;
    var col = n % 4;
    return [
      (72 * row + 30 * Math.random()) >> 0,
      (37 + 72 * col + 30 * Math.random()) >> 0
    ];
  });
  console.log(str, position);
}

getCapchaImage().then(recognizeImage);

export function getJsonpData(text: string) {
  text = /\w+\((.*)\)/.exec(text)![1];
  return JSON.parse(text);
}
