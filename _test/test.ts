import request = require("request-promise-native");
import {
  getWelfareList,
  doWelfareAction,
  getFanpaiInfo,
  fanpai,
  getLotteryInfo,
  getLottery,
  getHealthInsuredInfo,
  getHealthInsured,
  getGiftInfo
} from "../app/platform/jd/jinrong";

const log = p => p.then(console.log, console.error);

log(getGiftInfo());
// fanpai();
// log(getWelfareList());
