import { startsWith } from "ramda";
import { config } from "../../common/config";

const taobaoHandlers = {
  tmall: {
    test: startsWith("https://detail.tmall.com/item.htm"),
    async handler(num, page) {
      await page.evaluate(() => {
        Array.from(
          document.querySelectorAll<HTMLUListElement>(".J_TSaleProp")
        ).forEach(ul => {
          // @ts-ignore
          var lis = Array.from(<HTMLLIElement[]>ul.children);
          if (!lis.find(ele => ele.classList.contains("tb-selected"))) {
            lis[0].querySelector("a")!.click();
          }
        });
      });
      await page.type(".tb-text", String(num));
      // #J_LinkBasket 加入购物车
      await page.click("#J_LinkBuy");
      await page.waitForNavigation();
      if (!config.isSubmitOrder) {
        await page.setOfflineMode(true);
      }
      await page.click("a.go-btn");
    }
  },
  tmall_m: {
    test: startsWith("https://detail.m.tmall.com/item.htm"),
    async handler(num, page) {
      await page.evaluate(() => {
        document.querySelector<HTMLDivElement>("a.buy")!.click();
      });
      // await page.click(".skuText");
      await page.waitForResponse(res =>
        res.url().startsWith("https://g.alicdn.com/tm/detail-b")
      );
      await page.waitForSelector("#number");
      await page.evaluate((num: string) => {
        Array.from(
          document.querySelectorAll<HTMLLinkElement>(".sku-list-wrap>li")
        ).forEach(li => {
          var links = Array.from(li.querySelectorAll<HTMLLinkElement>("a"));
          if (!links.find(link => link.classList.contains("checked"))) {
            links.find(link => !link.classList.contains("disabled"))!.click();
          }
        });
        document.querySelector<HTMLInputElement>("#number")!.value = num;
        document.querySelector<HTMLLinkElement>("a.ok")!.click();
      }, num);
      await page.waitForNavigation();

      if (!config.isSubmitOrder) {
        await page.setOfflineMode(true);
      }
      let btn = await page.waitForSelector('span[title="提交订单"]');
      await btn.click();
      // await new Promise(resolve => {});
    }
  },
  chaoshi: {
    test: startsWith("https://chaoshi.detail.tmall.com/item.htm"),
    async handler(num, page) {
      await page.type(".tb-text", String(num));
      await page.click("#J_LinkBasket");
    }
  },
  taobao: {
    test: startsWith("https://item.taobao.com/item.htm"),
    async handler(num, page) {
      await page.evaluate(() => {
        Array.from(
          document.querySelectorAll<HTMLUListElement>(".J_TSaleProp")
        ).forEach(ul => {
          // @ts-ignore
          var lis = Array.from(<HTMLLIElement[]>ul.children);
          if (!lis.find(ele => ele.classList.contains("tb-selected"))) {
            lis[0].querySelector("a")!.click();
          }
        });
      });
      await page.type("#J_IptAmount", String(num));
      // a.J_LinkAdd 加入购物车
      await page.click("#J_LinkBuy");
      await page.waitForNavigation();
      if (!config.isSubmitOrder) {
        await page.setOfflineMode(true);
      }
      await page.click("a.go-btn");
    }
  },
  taobao_m: {
    test: startsWith("https://h5.m.taobao.com/awp/core/detail.htm"),
    async handler(num, page) {
      await page.evaluate(() => {
        Array.from(
          document.querySelectorAll<HTMLUListElement>(".sku-info ul")
        ).forEach(ul => {
          // @ts-ignore
          var lis = Array.from(<HTMLLIElement[]>ul.children);
          if (!lis.find(ele => ele.classList.contains("sel"))) {
            lis[0].click();
          }
        });
      });
      await page.type(".btn-input input", String(num));
      // .addcart
      await page.click(".gobuy");
      await page.waitForNavigation();
      if (!config.isSubmitOrder) {
        await page.setOfflineMode(true);
      }
      await page.click('div[aria-label="提交订单"]');
    }
  }
};

export default taobaoHandlers;
