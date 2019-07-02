import { newPage } from "../utils/page";
import { delayRun } from "../utils/tools";

export async function getHongbao() {
  var page = await newPage();
  page.goto(
    `https://h5.m.jd.com/babelDiy/Zeus/2QJAgm3fJGpAkibejRi36LAQaRto/index.html?_ts=${Date.now()}&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=Wxfriends&ad_od=share&utm_user=plusmember`
  );
  var [
    data1,
    {
      data: { answerStatusCode }
    }
  ] = await Promise.all([
    page
      .waitForResponse(res =>
        /https:\/\/api.m.jd.com\/client.action?.*functionId=getBabelAdvertInfo/.test(
          res.url()
        )
      )
      .then(res => res.text())
      .then(text => JSON.parse(/\((.*)\)/.exec(text)![1])),
    page
      .waitForResponse(res =>
        /https:\/\/api.m.jd.com\/client.action?.*functionId=answerInfo/.test(
          res.url()
        )
      )
      .then(res => res.json())
  ]);
  if (answerStatusCode === 0) {
    await delayRun("09:00:00");
    await page.evaluate(() => {
      document.querySelector<HTMLElement>(".play-button")!.click();
    });
    await delayRun(25 * 1000);
    let {
      list: [{ desc }]
    } = data1.advertInfos.find(
      (item: any) =>
        item.groupId === "03303165" || item.groupName === "题目/选项/答案"
    );
    await page.evaluate((text: string) => {
      var eles = Array.from(
        document.querySelectorAll<HTMLButtonElement>(".answer-option button")
      );
      var ele = eles.find(ele => {
        var content = ele.textContent!.trim().replace(/\w+\./, "");
        return content === text;
      })!;
      ele.click();
    }, desc);
  }
  await page.close();
}

function delayPeriod(hours: number[]) {
  var now = new Date();
  var h = hours.find(n => n > now.getHours());
  if (h !== undefined) {
    return delayRun(`${h}:00:00`);
  }
  return false;
}

export async function getPeriodCoupon(): Promise<any> {
  var p = delayPeriod([10, 12, 14, 18]);
  if (p === false) {
    return;
  }
  var page = await newPage();
  await page.goto(
    "https://pro.m.jd.com/mall/active/4MtESUzHLukCr2mi8CLxPCjvrcht/index.html?ad_od=share&from=singlemessage&isappinstalled=0&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=442b91bf381643ceb18b3f42b8ffec69"
  );
  await p;
  await page.evaluate(function() {
    var eles = Array.from(
      document.querySelectorAll<HTMLLinkElement>(".coupon")
    );
    eles.forEach(ele => ele.click());
  });
  page.waitForResponse(res => {
    if (
      res.url() ===
      "https://api.m.jd.com/client.action?functionId=newBabelAwardCollection"
    ) {
      res.json().then(console.log);
    }
    return false;
  });
  await new Promise(resolve => setTimeout(resolve, 5000));
  await page.close();
  return getPeriodCoupon();
}
