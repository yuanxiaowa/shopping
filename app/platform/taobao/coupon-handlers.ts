import { startsWith } from "ramda";
import { newPage } from "../../../utils/page";

async function handler(
  url: string,
  handler: () => {
    success: boolean;
    url: string;
  }
) {
  var page = await newPage();
  await page.goto(url);
  var data: any = await page.evaluate(handler);
  if (data.success) {
    let res = await page.waitForResponse(res =>
      res
        .url()
        .startsWith(
          "https://h5api.m.taobao.com/h5/mtop.alimama.union.xt.en.api.entry"
        )
    );
    let text = await res.text();
    text = text.replace(/\w+\((.*)\)/, "$1");
    let {
      data: {
        recommend: {
          resultList: [
            {
              coupon: { retStatus }
            }
          ]
        }
      }
    } = JSON.parse(text);
    data.success = retStatus !== 4;
    if (!data.success) {
      data.manual = true;
    }
  }
  page.close();
  return data;
}

const taobaoCouponHandlers = {
  uland: {
    test: startsWith("https://uland.taobao.com/coupon/edetail?"),
    async handler(url: string) {
      return handler(url, () => {
        var ele = document.querySelector<HTMLDivElement>(".coupon-btn")!;
        var url = document.querySelector("a")!.href;
        var success = true;
        if (ele.classList.contains("err-coupon-btn")) {
          success = false;
        } else {
          success = true;
          ele.click();
        }
        return {
          success,
          url
        };
      });
    }
  },
  taolijin: {
    // https://uland.taobao.com/taolijin/edetail?__share__id__=1&disablePopup=true&spm=a211b4.25023749&share_crt_v=1&sourceType=other&suid=ACA8079C-11A2-4558-AEB4-CC293DAC21B4&activityId=c9cc2ed7ebde4cdea80b32fbaf0e5d14&eh=drsdKEc3miiZuQF0XRz0iAXoB%2BDaBK5LQS0Flu%2FfbSp4QsdWMikAalrisGmre1Id0BFAqRODu12sb0fs3kJs2WT2LCKke3MVrwGSVh%2BekNkl4ynEHkuQjoxMu4NJfU64xi%2FUG8D2mm7cRMni2A61u8Mcy3ymkJpISShhSgHZF6PMAQLNOhwDsyELYR4WgPdoc99dUAcp2RxTtkLMzGodPgnle77VoPfrt4OXyVBuK232x40NvnBo%2BTt%2FowcrQRtOR0J0GUlAliz3qkBkleR4Us1rh%2B4QgJspTA0FRtOwCuw%3D&sp_tk=77%2BlN1pSdllnNFM1dlfvv6U%3D&un=d54169c7170fca0646e6040d6f65052e&disableSJ=1&visa=13a09278fde22a2e&union_lens=lensId%3A0bb793a8_0bfa_16ba2229f9d_a55a%3Btraffic_flag%3Dlm&ttid=201200%40taobao_iphone_8.8.0&sourceType=other&suid=dab38898-fc99-4579-a103-67bfa0dd8e8b&ut_sk=1.XHaHBRrZq7EDADaBhKpGUSG2_21646297_1561796887884.Copy.windvane
    test: startsWith("https://uland.taobao.com/taolijin/edetail"),
    async handler(url: string) {
      return handler(url, () => {
        var nonore = document.querySelector(".coupon-nomore");
        var url = document.querySelector("a")!.href;
        if (nonore) {
          return {
            success: false,
            url
          };
        }
        var ele = document.querySelector<HTMLDivElement>(".use-btn")!;
        ele.click();
        return {
          success: true,
          url
        };
      });
    }
  }
};

export default taobaoCouponHandlers;
