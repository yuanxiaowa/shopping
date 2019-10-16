/*
 * @Author: oudingyin
 * @Date: 2019-08-26 09:17:48
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-12 10:11:30
 */
import moment = require("moment");
import { requestData } from "./tools";
import setting from "./setting";
import R = require("ramda");

export async function seckillList(url: string) {
  var items: {
    id: string;
    quantity: number;
    title: string;
    seckillPrice: number;
    price: number;
    time: string;
    url: string;
  }[] = [];
  if (/\/wow\/chaoshi\/act\//.test(url)) {
    let {
      resultValue: { data, modules }
    } = await requestData(
      "mtop.tmall.kangaroo.core.service.route.PageRecommendService",
      {
        // https://pages.tmall.com/wow/chaoshi/act/wupr?ut_sk=1.WkOnn8QgYxYDAC42U2ubIAfi_21380790_1564621722050.Copy.chaoshi_act_page_tb&acm=201903280.1003.2.6362801&spm=a3204.12691414.1996846437.dBrand1&disableNav=YES&wh_pid=act%2Fbtbt&pos=1&wh_biz=tm&disableAB=true&suid=F566F29F-EC9D-41E1-94D3-C01BE8CAF17A&sourceType=other&utparam=%7B%22ranger_buckets%22%3A%223042%22%7D&scm=1003.2.201903280.OTHER_1564295073903_6362801&ttid=201200%40taobao_iphone_8.8.0&un=35fb12d24e9c47d946e6040d6f65052e&share_crt_v=1&sp_tk=77+lME0wOFlSV29jemLvv6U=&cpp=1&shareurl=true&short_name=h.eiq3Ce6&sm=4fb1c6&app=chrome
        // https://pages.tmall.com/wow/chaoshi/act/wupr?ut_sk=1.WkOnn8QgYxYDAC42U2ubIAfi_21380790_1563192248243.Copy.chaoshi_act_page_tb&__share__id__=1&share_crt_v=1&disableNav=YES&wh_pid=act%2Fxsj23874&tkFlag=1&disableAB=true&suid=1031708C-2844-47E2-B140-3CF358C1BD43&type=2&sp_tk=77%2BlelYxOVlob1FlTkrvv6U%3D&sourceType=other&tk_cps_param=127911237&un=04ec1ab5583d2c369eedd86203cf18d8&utparam=%7B%22ranger_buckets%22%3A%223042%22%7D&e=PlboetXBlJK4bXDJ8jCpJrfVFcC6KYAblz9f5x7nqEUPJTSplvxzY6R06N4nt-6t_nNM24L0rnGF2sp581q3i4RqxKSGsgCT8sviUM61dt2gxEj7ajbEb4gLMZYNRhg2HXKHH0u77i-I6M_vqqSeLITsM14S2xgDx9iN37b51zJw2qH-L52L1aTWVSTo88aBYOGm2rjvgGhaQJhxUPUeEtKYMBXg69krrlYyo_QbwE_DG_1N5hlzNg&ttid=201200%40taobao_iphone_8.8.0&cpp=1&shareurl=true&spm=a313p.22.kp.1050196516672&short_name=h.eS0ZZuy&sm=933952&app=chrome
        // https://pages.tmall.com/wow/chaoshi/act/wupr?tk_cps_ut=2&disableNav=YES&wh_pid=act%2Fhsbdpsx&wh_biz=tm&tkFlag=0&ali_trackid=2%3Amm_45076408_660600167_109222400252%3A1566437871_264_1174075255&tk_cps_param=45076408&type=2&disableAB=true&utparam=%7B%22ranger_buckets%22%3A%223042%22%7D&sourceType=other&suid=892410C2-70FD-4534-989A-8B76A6C51026&e=B73a-y_0l39KiQEfHTG2KVvL3I0OuQeVobvCOtOIPXQNFg6iSOB38s7jbpc07vXgMcGsTi_fmgh8fTxOKeqsQYPG-66F329l2Hyr0OpOG9JLi9M9jXIWFZi-K_y_OAbunazpduUQrsEv-of9BbU4ErQdWhBN4Zuu104hiS9Stn5w2qH-L52L1aTWVSTo88aBVrsDmfdXQppaQJhxUPUeEtKYMBXg69krrlYyo_QbwE_DG_1N5hlzNg&ttid=201200%40taobao_iphone_8.8.0&un=f6623c0d560a7210defba349c3f14615&share_crt_v=1&sp_tk=77%20laXhNU1k5UUFGTHXvv6U%3D&clickid=A220_356418526015664380113134196&UTABTEST-LOOPBACK=ignore&utabtest=aliabtest17545_13587&spm=a211b4.23468099&visa=13a09278fde22a2e&disablePopup=true&disableSJ=1&sourceType=other&suid=b4d087e6-e8f5-49d0-97bc-96b5f6b233b0&ut_sk=1.XK%2BQ06Gx8KwDAHyGAUJXIrJu_21646297_1566442518430.Copy.chaoshi_act_page_tb&ali_trackid=2:mm_130931909_605300319_109124700033:1566444559_112_1863632010
        url,
        cookie: "sm4=320506;hng=CN|zh-CN|CNY|156",
        device: "phone",
        backupParams: "device"
      },
      "get",
      "1.0"
    );
    let { dataId } = modules.find(item => /-act-ms\b/.test(item.name));
    let secKillItems = data[dataId].secKillItems;
    for (let item of secKillItems) {
      let { secKillTime } = item;
      let secKillTimeArr = secKillTime.split(",");
      secKillTimeArr.forEach(time => {
        items.push({
          id: item.itemId,
          quantity: item.itemNum,
          title: item.itemTitle,
          seckillPrice: item.itemSecKillPrice,
          price: item.itemTagPrice,
          time,
          url: "https:" + item.itemUrl
        });
      });
    }
  } else {
    // https://pages.tmall.com/wow/heihe/act/0820try?wh_biz=tm&ali_trackid=&ttid=700407%40taobao_android_8.8.0&e=sAsX_E3tJPiE5IjwFinSo3L6giCjJea-weShZufnUyzEva656Um3Ys7jbpc07vXg_piy-bl83AJfnG9gZa3lEIRqxKSGsgCT8sviUM61dt2gxEj7ajbEb4gLMZYNRhg2HXKHH0u77i-I6M_vqqSeLITsM14S2xgD1l7GcW5FttZw2qH-L52L1aTWVSTo88aB5YQ_egZY-KdaQJhxUPUeEtKYMBXg69krrlYyo_QbwE_DG_1N5hlzNg&type=2&tk_cps_param=127911237&tkFlag=0&tk_cps_ut=2&sourceType=other&suid=97d48507-afd2-4516-aa0a-69ca4f3deafe&ut_sk=1.XK%2BQ06Gx8KwDAHyGAUJXIrJu_21646297_1566366482399.Copy.ushare1103&un=04ec1ab5583d2c369eedd86203cf18d8&share_crt_v=1&sp_tk=77+ldGxJUFk5VFdLM2Hvv6U=&ali_trackid=2:mm_130931909_605300319_109124700033:1566374448_118_919207070
    let html = await setting.req.get(url);
    let pageInfo = /\{"pageInfo":.*/.exec(html);
    let resData: any;
    if (!pageInfo) {
      let { resultValue } = await requestData(
        "mtop.tmall.kangaroo.core.service.route.PageRecommendService",
        {
          url,
          cookie: "sm4=320506;hng=CN|zh-CN|CNY|156",
          schemaVersion: "44785e93-9e98-4fa8-83b4-75b330c76fce",
          device: "phone",
          backupParams: "device"
        },
        "get",
        "1.0"
      );
      resData = resultValue;
    } else {
      resData = JSON.parse(pageInfo[0]);
    }
    let { data, modules } = resData;
    let _item = modules.find(item => item.name.includes("-on-time-"));
    let dataId: string;
    if (!pageInfo) {
      dataId = _item.uuid;
    } else {
      dataId = _item.dataId;
    }
    let { params } = data[dataId];
    let itemIds: string[] = params.itemIds;
    let res = await requestData(
      "mtop.ju.seiya.selection.get",
      {
        param: JSON.stringify({
          itemIds,
          page: 1,
          pageSize: 100,
          showId: 251
        })
      },
      "get",
      "1.0"
    );
    items = res.data.result.data.map(item => ({
      id: item.itemId,
      title: item.title,
      url: "https:" + item.itemDetailUrl,
      quantity: item.totalStock,
      price: item.origPrice,
      seckillPrice: item.actPrice,
      time: moment(item.secKillTime).format("YYYY-MM-DD HH:mm:ss")
    }));
  }
  var gitems = R.groupBy(({ time }) => time, items);
  return Object.keys(gitems)
    .sort()
    .filter(time => moment().valueOf() < moment(time).valueOf())
    .map(time => ({
      time,
      items: gitems[time]
    }));
}
