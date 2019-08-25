import { requestData } from "./tools";
import setting from "./setting";

interface ArgInvitation {
  sellerId: number;
  actId: number;
}

export class TaobaoFans {
  /**
   *
   * @param url
   * @example https://fans.m.tmall.com/917264765?sourceType=other&suid=ad1a0af0-35c9-4c17-92ad-648b20e2b9bd&ut_sk=1.XPxqyg%2F9b3UDABYgpjofB2SA_21646297_1566673227385.TaoPassword-QQ.10000&un=48f481f5e4dfd0da96c164eb13e29777&share_crt_v=1&sp_tk=77+lY3Jvb1lrMTBmcVTvv6U=
   */
  async getStoreInfo(url: string): Promise<ArgInvitation> {
    var html = await setting.req.get(url);
    var text = /fsp_page_data\s*=\s*(.*\});/.exec(html)![1];
    var { sellerId } = JSON.parse(text);
    var actId = +/actId=(\d+)/.exec(html)![1];
    return {
      sellerId,
      actId
    };
  }

  async getFansInfo(sellerId: number) {
    var { value } = await requestData(
      "mtop.tmall.gtr.singlepagehead.fansparty.get",
      { sellerId, wbUid: "", wbOwner: "", wbDeviceInfo: "" },
      "get",
      "1.0"
    );
    return <
      {
        fans: "true" | "fasle";
        // 是否已关注
        following: "true" | "false";
        // 粉丝数量
        fansCount: string;
        name: string;
        sellerId: string;
        subscribe: "true" | "false";
      }
    >value;
  }

  /**
   * 关注
   * @param args
   */
  async follow(
    sellerId: number
  ): Promise<{
    // 操作是否成功
    followResult: "false" | "true";
  }> {
    return requestData(
      "mtop.tmall.caitlin.relation.common.follow",
      {
        targetId: String(sellerId),
        followTag: "fans-invitation-act",
        source: "fans-invitation-act",
        bizName: "fansparty"
      },
      "get",
      "1.0"
    );
  }

  async unfollow(
    sellerId: number
  ): Promise<{
    // 操作是否成功
    followResult: "false" | "true";
  }> {
    return requestData(
      "mtop.tmall.caitlin.relation.common.unfollow",
      {
        targetId: String(sellerId),
        followTag: "fansparty",
        source: "fansparty"
      },
      "get",
      "1.0"
    );
  }

  /**
   * 获取邀请函
   * @param args
   */
  async getinvitation(
    args: ArgInvitation
  ): Promise<{
    // 是否已领取
    crowdAwardDrawn: "true" | "false";
    brandId: string;
    brandName: string;
    sellerId: string;
    sellerName: string;
  }> {
    return requestData(
      "mtop.tmall.fansparty.fansday.superfansinvation.getinvitation",
      args,
      "get",
      "1.0"
    );
  }

  /**
   * 打开邀请函
   * @param args
   */
  async openinvitation(args: ArgInvitation) {
    return requestData(
      "mtop.tmall.fansparty.fansday.superfansinvation.openinvitation",
      args,
      "get",
      "1.0"
    );
  }
}

export const taobaoFans = new TaobaoFans();

export async function getInvitation(url: string) {
  var data = await taobaoFans.getStoreInfo(url);
  var fansInfo = await taobaoFans.getFansInfo(data.sellerId);
  if (fansInfo.fans === "fasle") {
    await taobaoFans.follow(data.sellerId);
  }
  var { crowdAwardDrawn } = await taobaoFans.getinvitation(data);
  if (crowdAwardDrawn === "false") {
    await taobaoFans.openinvitation(data);
  }
}
