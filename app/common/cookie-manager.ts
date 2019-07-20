import { writeFile, readFileSync, ensureFile } from "fs-extra";

export class Cookie {
  cookie = "";
  constructor(public filename: string) {}
  async init() {
    try {
      await ensureFile(this.filename);
      this.cookie = readFileSync(this.filename, "utf8");
    } catch (e) {
      this.cookie = "";
    }
  }
  get() {
    return this.cookie;
  }
  set(cookie: string) {
    this.cookie = cookie;
    writeFile(this.filename, cookie);
  }
}

const cookieManager = {
  jingdong: new Cookie(process.cwd() + "/.data/cookies/jingdong.txt"),
  jinrong: new Cookie(process.cwd() + "/.data/cookies/jingrong.txt"),
  taobao: new Cookie(process.cwd() + "/.data/cookies/taobao.txt")
};
export function onInitCookieManager() {
  return Promise.all(
    Object.keys(cookieManager).map(key => cookieManager[key].init())
  );
}
export default cookieManager;
