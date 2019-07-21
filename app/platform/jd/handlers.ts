import { Page } from "puppeteer";
import { startsWith } from "ramda";
import { config } from "../../common/config";

const jingdongHandlers = {
  jindong: {
    test: startsWith("https://item.jd.com"),
    handler: async (num: number, page: Page) => {
      // var {
      //   skuCoupon
      // }: {
      //   skuCoupon: {
      //     id: number;
      //     quota: number;
      //     discount: number;
      //     trueDiscount: number;
      //   }[];
      // } = await page
      //   .waitForResponse(res =>
      //     res.url().startsWith("https://cd.jd.com/promotion/v2?")
      //   )
      //   .then(res => res.text())
      //   .then(text => JSON.parse(text.replace(/\w+\((.*)\)/, "$1")));
      page.click(".quan-item");
      await page.waitForResponse(res =>
        res.url().startsWith("https://item.jd.com/coupons?")
      );
      let frame = page.frames()[1];
      let eles = await frame.$$(".sku_coupon_item .btn-get");
      eles.forEach(ele => ele.click());

      await page.type("#buy-num", String(num));
      await page.click("#InitCartUrl");
      /* await page.goto("https://cart.jd.com/cart.action");
await page.waitForSelector('.submit-btn')
await page.click(".submit-btn");
await page.waitForNavigation(); */
      await page.goto(
        "https://trade.jd.com/shopping/order/getOrderInfo.action"
      );
      if (!config.isSubmitOrder) {
        await page.setOfflineMode(true);
      }
      await page.click("#order-submit");
    }
  },
  jindong_m: {
    test: startsWith("https://item.m.jd.com"),
    async handler(num: number, page: Page) {
      await page.evaluate((num: number) => {
        let df = document.querySelector<HTMLDivElement>("#discountFloor");
        if (df) {
          df.click();
          Array.from(
            document.querySelectorAll<HTMLDivElement>(
              ".coupon_voucher3:not(.coupon_voucher3_spec_tag) span.coupon_voucher3_info_btn:not(.disabled)"
            )
          ).forEach(ele => {
            ele.click();
          });
          document
            .querySelector<HTMLDivElement>("#discountPopup i.close")!
            .click();
        }
        document.querySelector<HTMLDivElement>("#skuWindow")!.click();
        document.querySelector<HTMLInputElement>("#buyNum1")!.value = String(
          num
        );
        document.querySelector<HTMLDivElement>("#popupConfirm")!.click();
        var ele_guide = document.querySelector<HTMLDivElement>(".guide");
        if (ele_guide) {
          ele_guide.click();
          return;
        }
        document.querySelector<HTMLDivElement>("#buyBtn2")!.click();
      }, num);
      await page.waitForNavigation();
      if (!config.isSubmitOrder) {
        await page.setOfflineMode(true);
        throw new Error("");
      }
      await page.click("#btnPayOnLine");
    }
  },
  pingou: {
    test: startsWith("https://wqs.jd.com/pingou/detail.shtml"),
    async handler(num: number, page: Page) {
      var ele = await page.$("#pcprompt-viewpc");
      if (ele) {
        ele.click();
      }
      await page.click(".tuan_status_btns");
      await page.click(".sku_panel__confirm");
      await page.waitForNavigation();
      ele = await page.$("#pcprompt-viewpc");
      if (ele) {
        ele.click();
      }
      if (!config.isSubmitOrder) {
        await page.setOfflineMode(true);
      }
      await page.click("#appConfirm");
    }
  }
};

export default jingdongHandlers;
