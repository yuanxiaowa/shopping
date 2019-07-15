import request = require("request-promise-native");
import { getSignJRInfo } from "../app/platform/jd/jinrong";

const log = p => p.then(console.log, console.error);

getSignJRInfo().catch(e => {
  // console.log(e.response.body);
});
