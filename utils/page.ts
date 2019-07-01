import puppeteer, { Browser, Request, Page } from "puppeteer";

var browser: Browser;
var defaultPage: Page;
export var browser_promise = (async () => {
  browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./data-dir",
    devtools: false,
    executablePath:
      "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
  });
  [defaultPage] = await browser.pages();
  defaultPage.goto("http://localhost:8080/");
  defaultPage.exposeFunction("evalFunction", async (code: string) => {
    console.log("进入函数执行");
    var f = eval(`(${code})`);
    console.log(f);
    var page = await newPage();
    var ret = await f(page);
    page.close();
    return ret;
  });
  defaultPage.exposeFunction("evalFile", async (filename, refresh = false) => {
    console.log(require.resolve(filename));
    if (refresh) {
      filename = require.resolve(filename, {
        paths: [process.cwd()]
      });
      delete require.cache[filename];
    }
    require(filename);
  });
})();

export async function newPage() {
  var page = await browser.newPage();
  await page.setViewport({
    width: 400,
    height: 573
  });
  /* page.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
  ); */
  // await page.setRequestInterception(true);
  // page.on("request", request => {
  //   if (handle && handle(request)) {
  //     return;
  //   }
  //   var url = request.url();
  //   var type = request.resourceType();
  //   if (["font", "stylesheet", "media", "image"].includes(type)) {
  //     request.respond({
  //       status: 200
  //     });
  //   } else if (type === "xhr" || type === "fetch") {
  //     if (/\.(png|jpeg|webp|gif)$/i.test(url)) {
  //       request.respond({
  //         status: 200
  //       });
  //     } else {
  //       request.continue();
  //     }
  //   } else {
  //     request.continue();
  //   }
  // });
  return page;
}

/**
 * @return {Promise<Page>}
 */
export async function injectDefaultPage({
  reqFilter,
  handle,
  globalFns
}: {
  reqFilter?: (url: string) => boolean;
  handle?: (request: Request) => any;
  globalFns?: Record<string, any>;
}) {
  if (!browser) {
    await browser_promise;
  }
  if (globalFns) {
    Object.keys(globalFns).forEach(name =>
      defaultPage.exposeFunction(name, globalFns[name])
    );
  }
}
