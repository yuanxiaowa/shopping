/*
 * @Author: oudingyin
 * @Date: 2019-08-26 15:20:10
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-26 16:07:23
 */
import setting from "./setting";
import { getUuid } from "./tools";
import { delayRun } from "../../../utils/tools";

/**
 * 每日视频红包
 * @example https://h5.m.jd.com/babelDiy/Zeus/2QJAgm3fJGpAkibejRi36LAQaRto/index.html?_ts=1561942901015&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=Wxfriends&ad_od=share&utm_user=plusmember&smartEntry=login
 */
export async function getVideoHongbao() {
  console.log("检查视频红包活动");
  var uuid = getUuid();
  var config_text = await setting.req.get(
    "https://storage.360buyimg.com/babel/00395792/873571/production/dev/config.js",
    {
      qs: {
        t: Date.now()
      }
    }
  );
  var {
    custom: { answerTime, adIds },
    activityId,
    pageId
  } = eval(
    `(${
      /\{[\s\S]*\}/.exec(config_text.replace("window.location.href", "1"))![0]
    })`
  );
  let now = new Date();
  let h: any = now.getHours();
  if (h < answerTime[0]) {
    if (h < 10) {
      h = "0" + h;
    }
    await delayRun(`${h}:00:20`);
  } else if (h > answerTime[1]) {
    return;
  }
  // 获取视频信息
  var text: string = await setting.req.get(
    "https://api.m.jd.com/client.action",
    {
      qs: {
        functionId: "getBabelAdvertInfo",
        body: JSON.stringify({
          ids: [
            adIds.video,
            adIds.shopId,
            adIds.question,
            adIds.actid,
            adIds.other
          ].join(",")
        }),
        uuid,
        clientVersion: "1.0.0",
        client: "wh5",
        callback: "jsonp0"
      }
    }
  );
  // jsonp2({"currentTimeVal":1562548286595,"currentTimeStr":"2019-07-08 09:11:26","returnMsg":"success","code":"0","subCode":"0","biTestId":"1","advertInfos":[{"groupName":"H5标题","deliveryId":"","stageName":"708蒙牛","groupId":"03303157","deliveryType":"1","list":[{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":{},"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"蒙牛纯甄发红包啦","copy2":"","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","tab3Flag":"0"},"pictureUrl":"","link":"","progId":"","materialId":"4301201749","advertId":"4301201749","biClk":"2","appointed":false,"mcInfo":"03303157-09477169-4301201749-N#0--99--0--#1-0-#1-#","name":"1","linkType":"99","comment":[],"advertModuleId":"advert_4301201749","beginTime":"2019-06-21 00:00:00","endTime":"2019-06-22 00:00:00","desc":""}],"stageId":"09477169"},{"groupName":"游戏规则","deliveryId":"","stageName":"","groupId":"03303159","deliveryType":"1","list":[{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":{},"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"看视频赢红包攻略： 1.用户观看视频，根据视频内容答题。答题正确可获得相应红包奖励，红包将自动发放至账户；<br/> 2.答题错误需根据页面引导，在弹窗中完成相应小任务，获得再次答题机会；<br/> 3.参与活动所获得红包需在红包有效期内使用，红包过期时间等信息可在“我的->钱包->红包”查看。<br/> 4.红包每日数量有限，按参与顺序先到先得；<br/> 5.6月26日起每日答题时间恢复为9点开始；<br/>","copy2":"红包规则：1.红包可在京东主站、手机京东v7.2.0及以上版本、M版京东、微信京东购物、手机QQ京东购物等渠道使用。<br/>  2.红包无使用门槛，可与其它资产叠加使用，在提交订单时抵减商品金额（不抵减运费）。<br/> 3.未使用完红包在有效期内可累积至下次使用，若超出有效期，则无法继续使用。   <br/> 4.使用红包的订单，若订单未拆分，则订单取消后，返还相应红包；若订单被拆分，则取消全部子订单后，返还相应红包；若只取消部分子订单，红包不予返还。 使用红包的订单，若发生售后退货，则红包不予返还。具体使用规则遵守红包使用的相关规则，可在京东首页>帮助中心中查阅。<br/> 5.红包发放可能存在一定延迟，请耐心等待。若24小时后仍未到账，请联系客服<br/>","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","tab3Flag":"0"},"pictureUrl":"","link":"","progId":"","materialId":"0301102452","advertId":"0301102452","biClk":"2","appointed":false,"mcInfo":"03303159-08618316-0301102452-N#0--99--0--#1-0-#1-#","name":"111","linkType":"99","comment":[],"advertModuleId":"advert_0301102452","beginTime":"2019-04-26 16:53:43","endTime":"2019-04-27 00:00:00","desc":""}],"stageId":"08618316"},{"groupName":"优惠券","deliveryId":"","stageName":"708蒙牛","groupId":"03303417","deliveryType":"204","list":[{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":[],"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"","copy2":"","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","inputType":"2","cl":[{"cn1":"食品饮料","c1":"1320"}],"disCount":"10.0","quota":"99.0","limitStr":"仅可购买蒙牛品牌部分商品","beginTime":"2019-07-09 00:00:00","endTime":"2019-07-09 23:59:59","couponValid":0,"couponInfo":"","couponNewName":"","soldOut":0,"couponStyle":0,"couponType":1,"totalInventory":"","jumpLink":"","beanJumpUrl":"","beanAmount":"","couponActLink":"","useCpnType":"0","useCpnLink":"","identity":"","pcLink":"","mLink":"","jdShareValue":"","createTime":"2019-07-03 16:58:52","couponKind":"1","venderId":"0","batchId":"236860374","userLabel":"0","addDays":0,"shopId":0,"limitPlatform":null,"discountDesc":"","key":"ceb16acf7040496494c6e0272e2724ef","roleId":"21205692","limitOrganization":"[1]","couponKey":"FP_ewqu4zf","userClass":10000,"overLap":"1","overLapDesc":"[]","platformType":0,"hourCoupon":"1","couponTitle":"7.9纯甄大牌秒杀日新客专享99-10","yn":1,"expireType":5,"couponMsg":"success","configStatus":6,"cpnResultCode":200,"cpnResultMsg":"查询活动成功"},"pictureUrl":"//m.360buyimg.com/babel/jfs/t1/61585/25/3795/21107/5d20874aE1e6d4bc4/290858587073461c.png","link":"21205692","progId":"","materialId":"2201187315","advertId":"2201187315","biClk":"1#fc4b7294197d5ef4d20bf91e5333d1320872c96d-104-619139#14378395","appointed":false,"mcInfo":"03303417-09477331-2201187315-N#0-6-98--70--#1-0-#204-14378395#","name":"","linkType":"98","comment":[],"advertModuleId":"advert_2201187315","beginTime":"2019-06-22 00:00:00","endTime":"2019-06-22 00:00:00","desc":""},{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":[],"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"","copy2":"","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","inputType":"2","cl":[{"cn1":"食品饮料","c1":"1320"}],"disCount":"20.0","quota":"199.0","limitStr":"仅可购买蒙牛品牌部分商品","beginTime":"2019-07-09 00:00:00","endTime":"2019-07-09 23:59:59","couponValid":0,"couponInfo":"","couponNewName":"","soldOut":0,"couponStyle":0,"couponType":1,"totalInventory":"","jumpLink":"","beanJumpUrl":"","beanAmount":"","couponActLink":"","useCpnType":"0","useCpnLink":"","identity":"","pcLink":"","mLink":"","jdShareValue":"","createTime":"2019-07-03 17:03:31","couponKind":"1","venderId":"0","batchId":"236872482","userLabel":"0","addDays":0,"shopId":0,"limitPlatform":null,"discountDesc":"","key":"7e2ca1cb989c492d8e8996b69a335b21","roleId":"21205894","limitOrganization":"[1]","couponKey":"FP_ezwqm0d","userClass":10000,"overLap":"1","overLapDesc":"[]","platformType":0,"hourCoupon":"1","couponTitle":"7.9纯甄大牌秒杀日199-20","yn":1,"expireType":5,"couponMsg":"优惠券无效，不在有效期范围内","configStatus":6,"cpnResultCode":200,"cpnResultMsg":"查询活动成功"},"pictureUrl":"//m.360buyimg.com/babel/jfs/t1/69104/31/3838/19767/5d208777E54b33e0a/7c037c1692520773.png","link":"21205894","progId":"","materialId":"2201187316","advertId":"2201187316","biClk":"1#fc4b7294197d5ef4d20bf91e5333d1320872c96d-104-619139#14378395","appointed":false,"mcInfo":"03303417-09477331-2201187316-N#0-6-98--70--#1-0-#204-14378395#","name":"","linkType":"98","comment":[],"advertModuleId":"advert_2201187316","beginTime":"2019-06-22 00:00:00","endTime":"2019-06-22 00:00:00","desc":""}],"stageId":"09477331"},{"groupName":"banner","deliveryId":"","stageName":"708蒙牛","groupId":"03303171","deliveryType":"1","list":[{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":{},"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"https://pro.m.jd.com/mall/active/293w63AzYhueNpFMKqKDrV1pZKPE/index.html","copy2":"","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","tab3Flag":"0"},"pictureUrl":"//m.360buyimg.com/babel/jfs/t1/41231/20/8487/103193/5d20848eE6ca7940e/d058550cb10c50a5.jpg!q70.jpg","link":"","progId":"","materialId":"0701210193","advertId":"0701210193","biClk":"2","appointed":false,"mcInfo":"03303171-09477309-0701210193-N#0--99--0--#1-0-#1-#","name":"1","linkType":"99","comment":[],"advertModuleId":"advert_0701210193","beginTime":"2019-06-21 00:00:00","endTime":"2019-06-22 00:00:00","desc":""}],"stageId":"09477309"},{"groupName":"预告","deliveryId":"","stageName":"528京东空调","groupId":"03303189","deliveryType":"1","list":[{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":{},"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"","copy2":"","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","tab3Flag":"0"},"pictureUrl":"//m.360buyimg.com/babel/jfs/t11014/106/2972232484/60748/4c88098c/5cde7e5fN142378ac.jpg!q70.jpg","link":"","progId":"","materialId":"8001111196","advertId":"8001111196","biClk":"2","appointed":false,"mcInfo":"03303189-08737069-8001111196-N#0--99--0--#1-0-#1-#","name":"111","linkType":"99","comment":[],"advertModuleId":"advert_8001111196","beginTime":"2019-04-26 16:59:05","endTime":"2019-04-27 00:00:00","desc":""}],"stageId":"08737069"},{"groupName":"头图","deliveryId":"","stageName":"708蒙牛","groupId":"03381049","deliveryType":"1","list":[{"linkParam":"","extension":{"advLinkStyle":1,"sortAttributes":{},"beanPlanId":"","oldVipPicUrl":"","pit":1,"progId":"","bindCgType":[],"cgType":[],"skuColor":"#FFFFFF","copy1":"","copy2":"","copy3":"","copy4":"","copy5":"","copy6":"","label":"","slogan":"","backupSlogan":"","auxPic":"","backupPicUrl":"","departmentId":"","pictureUrl":"","script":"","bkgdClor":"#FFFFFF","category":"","brandCode":"","logoUrl":"","tab3Flag":"0"},"pictureUrl":"//m.360buyimg.com/babel/jfs/t1/71170/20/3869/135230/5d20b01cE869eacb5/81c0f72104525e3c.png","link":"","progId":"","materialId":"8001203159","advertId":"8001203159","biClk":"2","appointed":false,"mcInfo":"03381049-09477315-8001203159-N#0--99--0--#1-0-#1-#","name":"1","linkType":"99","comment":[],"advertModuleId":"advert_8001203159","beginTime":"2019-06-21 00:00:00","endTime":"2019-06-22 00:00:00","desc":""}],"stageId":"09477315"}],"biDisplayTmpr":"1#fc4b7294197d5ef4d20bf91e5333d1320872c96d-104-619139-204"})
  var { advertInfos } = JSON.parse(/\((.*)\)/.exec(text)![1]);
  let shopId = advertInfos.find((item: any) => item.groupId === "03303162")
    .list[0].extension.copy1;
  let state_text = await setting.req.get("https://api.m.jd.com/client.action", {
    qs: {
      appid: "answer_20190513",
      t: Date.now(),
      functionId: "answerInfo",
      body: JSON.stringify({
        activityId,
        pageId,
        reqSrc: "mainActivity",
        platform: "APP/m",
        shopId
      }),
      client: "wh5",
      clientVersion: "1.0.0",
      uuid
    }
  });
  let {
    data: { answerStatusCode, hbStockPercent, userVo }
  } = JSON.parse(state_text);
  if (answerStatusCode === 3) {
    console.log("看视频赢红包活动，已获得", userVo.hbAmount);
    return;
  }
  if (hbStockPercent === 1) {
    console.log("视频红包已发放完");
    return;
  }
  // {"data":{"answerStatusCode":0,"answerUserNum":40276,"currentTime":1562548286331,"hbStockPercent":0.82,"playTime":20,"shopLogoUrl":"","shopName":"","userVo":{"additionalCount":0,"answerCount":0,"answerResult":0,"answerSelect":"","hbAmount":0}},"code":"0"}
  // {"data":{"answerStatusCode":3,"answerUserNum":41704,"currentTime":1562548313562,"hbStockPercent":0.81,"playTime":20,"shopLogoUrl":"","shopName":"","userVo":{"additionalCount":0,"answerCount":1,"answerResult":1,"answerSelect":"丹麦进口菌种","hbAmount":0.5}},"code":"0"}
  let answer = advertInfos.find(
    (item: any) =>
      item.groupId === "03303165" || item.groupName === "题目/选项/答案"
  );
  console.log("视频答案", answer.list[0].desc);
  // let res = await req.get("https://api.m.jd.com/client.action", {
  //   qs: {
  //     appid: "answer_20190513",
  //     t: now.getTime(),
  //     functionId: "answerSendHb",
  //     body: JSON.stringify({
  //       activityId,
  //       pageId,
  //       reqSrc: "mainActivity",
  //       platform: "APP/m",
  //       answer: 1,
  //       select: answer.list[0].desc
  //     }),
  //     client: "wh5",
  //     clientVersion: "1.0.0",
  //     uuid
  //   },
  //   headers: {
  //     Referer:
  //       "https://h5.m.jd.com/babelDiy/Zeus/2QJAgm3fJGpAkibejRi36LAQaRto/index.html?_ts=1561942901015&utm_source=iosapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=Wxfriends&ad_od=share&utm_user=plusmember&smartEntry=login"
  //   }
  // });
  // console.log("视频红包", res);

  // {"data":{"currentTime":1562548312483,"awardType":["1"],"couponList":null,"discount":0.50},"code":"0"}
}
