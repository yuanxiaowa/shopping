import { getActivityCoupons, getGoodsCoupons, getFloorCoupons } from "./tools";
import { startsWith } from "ramda";
import { obtainFloorCoupon } from "./goods";
import { newPage } from "../../../utils/page";

const jingdongCouponHandlers = {
  wq: {
    // https://wq.jd.com/webportal/event/25842?cu=true&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=4b1871b719e94013a1e77bb69fee767e&scpos=#st=460
    // https://wq.jd.com/webportal/event/25842?cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=c39350c2555145809ef3f4c05465cdf0&scpos=#st=376
    test: startsWith("https://wq.jd.com/webportal/event/"),
    handler: async url => {
      // @ts-ignore
      var html: string = await this.req.get(url);
      var text = /window._componentConfig\s*=\s*(.*);/.exec(html)![1];
      var items = JSON.parse(text).filter(({ name }: any) => name === "coupon");
      var now = Date.now();
      items.forEach(({ data: { list } }: any) => {
        list.forEach(({ begin, end, key, level }: any) => {
          if (
            new Date(begin).getTime() < now &&
            new Date(end).getTime() > now
          ) {
            obtainFloorCoupon({
              key,
              level
            });
          }
        });
      });
      /* var page = await newPage();
      await page.goto(url);
      await page.evaluate(() => {
        Array.from(
          document.querySelectorAll<HTMLDivElement>(
            ".atmosphere_coupon_1600_591_skin_ft_cloud:not(.disabled)"
          )
        ).forEach(ele => {
          ele.click();
        });
        Array.from(
          document.querySelectorAll<HTMLDivElement>(
            ".coupon_2030_294_item"
          )
        ).forEach(ele => ele.click());
      });
      return page; */
    }
  },
  couponCenter: {
    test: startsWith("https://coupon.m.jd.com/center/getCouponCenter.action"),
    async handler(url) {
      var page = await newPage();
      await page.goto(url);
      await page.evaluate(() => {
        Array.from(
          document.querySelectorAll<HTMLDivElement>(".coupon_btn")
        ).forEach(ele => ele.click());
      });
      return page;
    }
  },
  jingfen: {
    test: startsWith("https://jingfen.jd.com/item.html"),
    async handler(url) {
      var page = await newPage();
      await page.goto(url);
      var b = await page.evaluate(() => {
        let button = document.querySelector<HTMLElement>(".btnget span")!;
        let text = button.innerText;
        if (text === "立即领取") {
          button.click();
        } else if (text === "已领完") {
          if (!confirm("券已领完，确定要继续吗？")) {
            return false;
          }
        } else {
          document.querySelector<HTMLParagraphElement>(".content")!.click();
        }
      });
      if (b === false) {
        page.close();
        throw new Error("券光了~");
      }
      await page.waitForNavigation();
      return page;
    }
  },
  goods_m: {
    test: startsWith("https://item.m.jd.com/product/"),
    async handler(url) {
      await getGoodsCoupons(/product\/(\w+)/.exec(url)![1]);
    }
  },
  floor: {
    // https://wqs.jd.com/event/promote/mobile8/index.shtml?ptag=17036.106.1&ad_od=4&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=e653d855fd454bfe86b29fa2bf38fdb2&scpos=#st=592
    test: startsWith("https://wqs.jd.com/event/promote"),
    async handler(url) {
      await getFloorCoupons(url);
    }
  },
  activity: {
    test: startsWith("https://pro.m.jd.com/mall/active"),
    async handler(url) {
      await getActivityCoupons(url);
    }
  }
};

export default jingdongCouponHandlers;
