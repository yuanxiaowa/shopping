/*
 * @Author: oudingyin
 * @Date: 2019-09-03 15:30:38
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-03 17:10:18
 */
import fs = require("fs-extra");
import { config } from "./setting";

export async function getStationNames() {
  var text = await config.req.get(
    "https://kyfw.12306.cn/otn/resources/js/framework/station_name.js?station_version=1.9109"
  );
  var stations: string[] = text.match(/(?<=@)([^@']+)/g);
  return stations.map(str => {
    var arr = str.split("|");
    return {
      py_j: arr[0],
      name: arr[1],
      code: arr[2],
      py: arr[3],
      py_j1: arr[4],
      num: arr[5]
    };
  });
}

async function queryTicket(data: { from: string; to: string; date: string }) {
  var text = await config.req.get(
    "https://kyfw.12306.cn/otn/leftTicket/queryT",
    {
      qs: {
        "leftTicketDTO.train_date": data.date,
        "leftTicketDTO.from_station": data.from,
        "leftTicketDTO.to_station": data.to,
        purpose_codes: "ADULT"
      }
    }
  );
  var {
    data: { flag, map, result }
  }: {
    data: { flag: "1" | "0"; map: Record<string, string>; result: string[] };
  } = JSON.parse(text);
  return result.map(item => item.split("|"));
}

queryTicket({
  from: "BJP",
  to: "SHH",
  date: "2019-09-03"
}).then(console.log);

// getStationNames().then(stations =>
//   fs.writeFile("stations.json", JSON.stringify(stations, null, 2))
// );
