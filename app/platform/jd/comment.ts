/*
 * @Author: oudingyin
 * @Date: 2019-08-26 15:05:07
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-26 15:16:55
 */
import setting from "./setting";
import { getJsonpData, Serial, delay } from "../../../utils/tools";
import { getCookie, time33 } from "./tools";
import R = require("ramda");
import { getComment } from "../comment-tpl";

export class JingDongComment {
  async getCommentList(type: number, page: number) {
    var Referer =
      "https://wqs.jd.com/order/orderlist_merge.shtml?tab=1&ptag=7155.1.11&sceneval=2#page=2&itemInd=0&curTab=waitComment";
    var text: string = await setting.req.get(
      "https://wqdeal.jd.com/bases/orderlist/deallist",
      {
        qs: {
          callersource: "mainorder",
          order_type: type,
          start_page: page,
          last_page: "0",
          page_size: "10",
          recycle: "0",
          isoldpin: "0",
          utfswitch: "1",
          sceneval: 2,
          // traceid: '685039158036729252',
          _: Date.now(),
          g_login_type: "1",
          callback: "dealList_Cb",
          g_ty: "ls"
        },
        headers: {
          Referer
        }
      }
    );
    var { total_count, deal_list } = getJsonpData(text);

    text = await setting.req.get(
      "https://wqdeal.jd.com/bases/orderlist/GetOrderShare",
      {
        qs: {
          orderids: deal_list.map(({ deal_id }) => deal_id).join(","),
          sceneval: 2,
          // traceid: "685088953887582016",
          _: Date.now(),
          g_login_type: "1",
          callback: "orderShare_Cb",
          g_ty: "ls"
        },
        headers: {
          Referer
        }
      }
    );
    var {
      jingdong_club_listorderhandlestate_get_responce: { vouchers }
    } = getJsonpData(text);
    var items = deal_list
      .filter(
        (_, i) => vouchers[i].isAppraise || vouchers[i].isNotBeenEvaluated
      )
      .map(item => {
        var id = item.deal_id;
        var items = item.trade_list.map(item => ({
          id: item.item_skuid,
          title: item.item_title,
          img: item.item_pic,
          url: `https://item.jd.com/${item.item_skuid}.html`
        }));
        return {
          id,
          items
        };
      });
    return {
      items,
      more: Number(total_count) >= 10
    };
  }

  async addComment(orderId: string) {
    var Referer = `https://wqs.jd.com/wxsq_project/comment/evalProduct/index.html?orderid=${orderId}&ordertype=1&sceneval=2`;
    var res = await setting.req.get("https://wq.jd.com/eval/GetEvalPage", {
      qs: {
        orderId,
        operation: 16,
        pageIndex: 1,
        pageSize: "100",
        _: Date.now(),
        sceneval: "2",
        g_login_type: "1",
        callback: "jsonpCBKA",
        g_ty: "ls"
      },
      headers: {
        Referer
      }
    });
    var {
      data: {
        jingdong_club_voucherbyorderid_get_response: {
          success,
          userCommentVoList
        }
      }
    } = getJsonpData(res);
    if (!success) {
      throw new Error("出错了");
    }
    await Promise.all(
      userCommentVoList
        .filter(({ commentStatus }) => commentStatus === "0")
        .map(item => this.commentGoodsItem({ data: item, Referer }))
    );
    // 总体评价
    await this.commentService(orderId, Referer);
  }

  commentService(orderId: string, Referer: string) {
    return setting.req.get("https://wq.jd.com/eval/SendDSR", {
      qs: {
        pin: getCookie("pin"),
        userclient: "29",
        orderId,
        otype: "1",
        // 商品符合度
        DSR1: 5,
        // 店铺服务态度
        DSR2: 5,
        // 物流发货速度
        DSR3: 5,
        // 配送员服务
        DSR4: 5,
        _: Date.now(),
        sceneval: "2",
        g_login_type: "1",
        callback: "jsonpCBKC",
        g_ty: "ls"
      },
      headers: {
        Referer
      }
    });
  }

  @Serial(3000)
  async commentGoodsItem({ data, Referer }: { data; Referer: string }) {
    let comments = await this.getGoodsCommentList(data.productId);
    let images = R.compose(
      R.map((item: any) =>
        item.imgUrl.replace(/s128x96_/, "").replace(/^https?:/, "")
      ),
      R.sort((a, b) => Math.random() ** (Math.random() - 0.5)),
      R.flatten,
      R.map(R.prop("images"))
    )(comments);
    let res = await setting.req.post(
      "https://wq.jd.com/eval/SendEval?sceneval=2&g_login_type=1&g_ty=ajax",
      {
        form: {
          productId: data.productId,
          orderId: data.orderId,
          score: 5,
          content: getComment(),
          commentTagStr: "1",
          userclient: "29",
          imageJson: images
            .slice(1, (Math.random() * Math.min(images.length, 5)) >> 0)
            .join(","),
          anonymous: "0",
          syncsg: "0",
          scence: "101100000",
          videoid: "",
          URL: ""
        },
        headers: {
          Referer
        }
      }
    );
    let {
      data: {
        jingdong_club_productcomment_weixinsave_responce: {
          resultCode,
          errorMessage
        }
      }
    } = JSON.parse(res);
    if (resultCode === "11") {
      console.log(errorMessage);
      await delay(3000);
      return this.commentGoodsItem({ data, Referer });
    }
  }

  async getGoodsCommentList(skuId: string) {
    var text: string = await setting.req.get(
      "https://wq.jd.com/commodity/comment/getcommentlist",
      {
        qs: {
          callback: "skuJDEvalA",
          pagesize: "10",
          sceneval: "2",
          score: "0",
          sku: skuId,
          sorttype: "5",
          page: "1",
          t: Math.random(),
          g_tk: time33(getCookie("wq_skey")),
          g_ty: "ls"
        },
        headers: {
          Referer: `https://item.m.jd.com/product/${skuId}.html`
        }
      }
    );
    var {
      result: { comments }
    } = getJsonpData(text);
    return <
      {
        content: string;
        images: {
          imgUrl: string;
        }[];
      }[]
    >comments;
  }
}

export const jingDongComment = new JingDongComment();
