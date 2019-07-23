import { getActivityCoupons, getGoodsCoupons, getFloorCoupons } from "./tools";
import { startsWith, test } from "ramda";
import {
  obtainFloorCoupon,
  getQuanpinCoupon,
  getJingfen,
  getCouponSingle,
  getShopCoupons,
  getFanliCoupon
} from "./goods";
import { newPage } from "../../../utils/page";
import { delay } from "../../../utils/tools";

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
    }
  },
  jingfen: {
    test: startsWith("https://jingfen.jd.com/item.html"),
    handler: getJingfen
  },
  goods: {
    test: test(
      /^https?:\/\/(item\.m\.jd.com\/product\/|item\.jd\.com\/\d+\.html)/
    ),
    async handler(url) {
      await getGoodsCoupons(/\d+/.exec(url)![0]);
      return {
        success: true,
        url
      };
    }
  },
  floor: {
    // https://wqs.jd.com/event/promote/mobile8/index.shtml?ptag=17036.106.1&ad_od=4&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=e653d855fd454bfe86b29fa2bf38fdb2&scpos=#st=592
    test: startsWith("https://wqs.jd.com/event/promote"),
    handler: getFloorCoupons
  },
  activity: {
    // https://pro.m.jd.com/mall/active/2fJDHSrZhhDcNKg9ahyKkbny5r4X/index.html?jd_pop=29588686-c925-471d-b9f2-49696e154408&abt=0&jd_pop=be4dd5ce-8a22-4e00-a791-b00f4c114ab6&abt=0&cu=true&cu=true&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=d1dc38952a544e00879cf4a4f4b871b6
    test: test(/^https:\/\/pro(\.m)?\.jd\.com\/mall\/active/),
    async handler(url) {
      return getActivityCoupons(url);
    }
  },
  quanpinByPhone: {
    test: startsWith("https://h5.m.jd.com/babelDiy/Zeus"),
    handler: getQuanpinCoupon
  },
  shop: {
    test: startsWith("https://shop.m.jd.com/?"),
    async handler(url: string) {
      var urls = await getShopCoupons(url);
      try {
        await Promise.all(urls.map(getCouponSingle));
        return {
          success: true
        };
      } catch (e) {
        return e;
      }
    }
  },
  couponSingle: {
    test: startsWith("https://coupon.m.jd.com/coupons/show.action"),
    handler: getCouponSingle
  },
  shop2: {
    test: startsWith("https://ifanli.m.jd.com/rebate/couponMiddle.html"),
    handler: getFanliCoupon
  }
};

export default jingdongCouponHandlers;
