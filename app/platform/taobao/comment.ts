/*
 * @Author: oudingyin
 * @Date: 2019-08-26 09:17:47
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-04 17:13:23
 */
import { requestData } from "./tools";
import { getComment } from "../comment-tpl";
import { Serial } from "../../../utils/tools";
import setting from "../jd/setting";

export class TaobaoComment {
  async getCommentList(page = 1) {
    var html = await setting.req.post(
      "https://buyertrade.taobao.com/trade/itemlist/asyncBought.htm?action=itemlist/BoughtQueryAction&event_submit_do_query=1&_input_charset=utf8&sm",
      {
        form: {
          lastStartRow: "",
          options: "0",
          orderStatus: "ALL",
          pageNum: page,
          pageSize: "15",
          queryBizType: "",
          queryOrder: "desc",
          rateStatus: "I_HAS_NOT_COMMENT",
          tabCode: "waitRate",
          prePageNo: page - 1 || 2
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'referer': 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm?action=itemlist/BoughtQueryAction&event_submit_do_query=1&tabCode=waitRate'
        }
      }
    );
    var {
      mainOrders,
      page: { currentPage, totalPage }
    } = JSON.parse(html);
    var items = mainOrders.map(({ id, subOrders }) => ({
      id,
      items: subOrders.map(({ itemInfo }) => ({
        id,
        title: itemInfo.title,
        img: "https:" + itemInfo.pic,
        url: "https:" + itemInfo.itemUrl
      }))
    }));
    return {
      items,
      page,
      more: currentPage<totalPage
    }
    // var {
    //   data: { group, meta }
    // } = await requestData(
    //   "mtop.order.queryBoughtList",
    //   {
    //     appName: "tborder",
    //     appVersion: "1.0",
    //     tabCode: "waitRate",
    //     page
    //   },
    //   "get",
    //   "4.0",
    //   "##h5"
    // );
    // let items = group.map(obj => {
    //   let id = Object.keys(obj)[0];
    //   let list = obj[id].filter(
    //     ({ cellType, cellData }) => cellType === "sub" && cellData[0].fields.pic
    //   );
    //   let title = list
    //     .map(({ cellData }) => cellData[0].fields.title)
    //     .join(",");
    //   let img = list[0].cellData[0].fields.pic;
    //   let url = list[0].cellData[0].fields.pic;
    //   return {
    //     id,
    //     items: [
    //       {
    //         id,
    //         title,
    //         img,
    //         url
    //       }
    //     ]
    //   };
    // });
    // return {
    //   items,
    //   page,
    //   more: page < Number(meta.page.fields.totalPage)
    // };
  }

  async commentOrder(orderId: string) {
    var { subOrderRateInfos } = await requestData(
      "mtop.order.getOrderRateInfo",
      {
        orderId
      },
      "get",
      "1.0"
    );
    var items = subOrderRateInfos.map(item => {
      var ret: any = {
        key: item.key,
        feedback: getComment(),
        rateAnnoy: "1",
        ratePicInfos: [item.auctionInfo.auctionPicUrl]
      };
      if (item.orderMerchandiseScore) {
        ret.orderMerchandiseScore = "5";
      }
      if (item.rateResult) {
        ret.rateResult = "1";
      }
      return ret;
    });
    return this.commentGoods(items, orderId);
  }

  @Serial()
  commentGoods(items: any, orderId: string) {
    return requestData(
      "mtop.order.doRate",
      {
        mainOrderRateInfo:
          '{"serviceQualityScore":"5","saleConsignmentScore":"5"}',
        subOrderRateInfo: JSON.stringify(items),
        orderId
      },
      "get",
      "3.0"
    );
  }

  comment(args: any): Promise<any> {
    /* this.req.post("", {
    form: {
      callback: "RateWriteCallback548",
      _tb_token_: "edeb7b783ff65",
      um_token: "T0eb928a011b00316c98a9fed9edb4b2b",
      action: "new_rate_write_action",
      event_submit_do_write: "any",
      sellerId: "2200811872345",
      bizOrderIdList: "492409251844405857",
      itemId492409251844405857: "591795307112",
      eventId492409251844405857: "",
      parentOrderId: "492409251844405857",
      qualityContent492409251844405857: "fdsfdsafdsaf",
      serviceContent492409251844405857: "fdsaf",
      Filedata: "",
      urls: "",
      merDsr492409251844405857: "5",
      serviceQualityScore: "5",
      saleConsignmentScore: "5",
      anony: "1",
      ishares: "",
      ua:
        "118#ZVWZz7teaQVZ0e/LdH2mpZZTZsHhce/ezeVnvsqTzHRzZRbZXoTXOrezpgqTVHR4Zg2ZOzqTze0cZgYUHDqVze2zZCFhXHvnzhtZZzu7zeRZZgZZ2Yq4zH2zgeu1THWVZZ2ZZ2HhzHRzVgzYcoqVze2ZZVbhXHJmgiguZaq2zeRZZgZZfDqVzOqZzeZ4yH1JZBD1c78nByRuZZYCXfqYZH2zZZCTcHCVx20rEfqhzHWxzZZZV5q44aPiueZhXTVHZg2ZumqTzeRzZZZuVfq4zH2ZZZFhVHW4ZZ2uZ0bTzeRzZZZZ23Z4ze2zZZuXTiXejg2ZjUi5zPErwZubQozqF00nMWTKzLQvxN9m3LIVTHjaVcjjc2L3sKqSh8gTP5S8FDpKyTHCugZCmrDtKHZzhaquuI0DRgZTlItysC/ATH+z8N2Crbz04R4GIE3fdf3gV2gbTR2B7+zF3qqMmOW3N4mlfO6N1SuNkGAumAnxsKbe43gCE87ooXXoLBK3lPdtfJk4fgNaaid3jZa5RF8Y2HhI1WMgXAaXoZuDzJi8DMJT31BZjQHGH2432fvCzMLqB2yvwTQni66GyfOOVCFmOWAV0r+PqIDp5hZ1eB5Bn+p7OMJZSthhoMbH6k0vVh9Quf4xEHzfWFoHsYEPPDKiX23KElhfshnArhpIViJU4HlG5zsJuLxlGC7bW5Oltr5xn91jM4b4w44HlbDpVR9JXL2IQRJRJDV7xegJS2PZd/mtYaf0yA7dr8hb8PGj6N4Snl9fzfvVBqKY7XK/R41in/X1d+tazXEIugNPh4B8nxoRAYgk09rbCXRmoc+ffVjbrkh9hwIywk0m/xX4aP4z0jkihzBTyLDdz3xOp7FdrIbfBA0xlcfAftRigVieQTOVzg==",
      "492409251844405857_srNameList": ""
    }
  }); */
    return Promise.all(args.orderIds.map(item => this.commentOrder(item)));
  }
}

export const taobaoComment = new TaobaoComment();
