import setting from "./setting";
import { requestData } from "./tools";
import moment = require("moment");

export async function getSixtyCourse(actId: string) {
  var {
    answerDate,
    answered,
    courseVOList,
    sellerId,
    lotteryCount
  }: {
    answerDate?: string[];
    answered: ("true" | "false")[];
    sellerId: string;
    lotteryCount: string;
    courseVOList: {
      id: string;
      desc: string;
      options: Record<string, string>;
    }[];
  } = await requestData(
    "mtop.tmall.fansparty.sixty.getAct",
    {
      actId
    },
    "get",
    "1.0"
  );
  var finished = !answered.includes("false");
  var todayAnswered = false;
  var options = {};
  var title = "";
  var courseId = "";
  if (!finished) {
    var i = 0;
    moment.duration(1, "d");
    if (answerDate) {
      todayAnswered =
        moment().diff(
          moment(answerDate[answerDate.length - 1].split(" ")[0], "yyyy-MM-DD")
        ) <= moment.duration(1, "days").asMilliseconds();

      if (todayAnswered) {
        i = answerDate.length - 1;
      } else {
        i = answerDate.length;
      }
    }
    title = courseVOList[i].desc;
    courseId = courseVOList[i].id;
    options = courseVOList[i].options;
  }
  return {
    actId,
    finished,
    todayAnswered,
    title,
    options,
    courseId,
    sellerId,
    lotteryCount: Number(lotteryCount)
  };
}

export async function sixtyCourseList() {
  var html: string = await setting.req.get(
    "https://pages.tmall.com/wow/fsp/act/60sclass?q=%E5%A4%A9%E7%8C%AB60%E7%A7%92%E8%AF%BE%E5%A0%82&isFull=true&pre_rn=c21dff5a538d1c77a9e5c29674eefe94&scm=20140655.sc_c21dff5a538d1c77a9e5c29674eefe94"
  );
  var r = /<textarea style="display: none" class="vue-comp-data">(.*)<\/textarea>/g;
  r.test(html);
  var text = r.exec(html)![1];
  var {
    $root: {
      moqieDataWl: { jsonStr }
    }
  } = JSON.parse(text.replace(/&quot;/g, '"'));
  var {
    content: { areas }
  } = JSON.parse(jsonStr);
  var actIds = Object.keys(areas).map(
    key => /actId=(\w+)/.exec(areas[key].data.href)![1]
  );
  return Promise.all(actIds.map(getSixtyCourse));
}

export async function sixtyCourseReply({
  actId,
  courseId,
  option,
  sellerId,
  todayAnswered,
  finished
}: {
  actId: string;
  courseId: string;
  option: string;
  sellerId: string;
  todayAnswered: boolean;
  finished: boolean;
}) {
  if (!finished && !todayAnswered) {
    await requestData(
      "mtop.tmall.fansparty.sixty.answer",
      {
        actId,
        courseId,
        option
      },
      "get",
      "1.0"
    );
  }
  var data = await requestData(
    "mtop.tmall.fansparty.sixty.getlotterytoken",
    {
      actId,
      lotteryType: "shareLottery"
    },
    "get",
    "1.0"
  );
  var token = data.result;
  var res3 = await requestData(
    "mtop.tmall.fansparty.fansday.superfansinvation.openinvitation",
    {
      sellerId,
      actId,
      token
    },
    "get",
    "1.0"
  );
  var { awards } = res3;
  return awards;
}
