import request = require("request-promise-native");

var req: request.RequestPromiseAPI;

async function requestData(functionId, body) {
  var { code, data, message } = await req.get(
    "https://api.m.jd.com/client.action",
    {
      qs: {
        functionId,
        body: JSON.stringify(body),
        uuid: "38276cc01428d153b8a9802e9787d279e0b5cc85",
        appid: "ld"
      }
    }
  );
  if (code === "0") {
    return data;
  }
  throw new Error(message);
}

/**
 * 关注频道
 * @param channelId
 * @example 482
 */
export function plantChannelNutrientsTask(channelId: string) {
  requestData("plantChannelNutrientsTask", { channelTaskId: "3", channelId });
  // {"code":"0","data":{"nutrState":"2","nutrNum":0,"nutrToast":"营养液走丢了"}}
}

/**
 * 待关注商品列表
 */
export async function productTaskList() {
  requestData("productTaskList", {
    monitor_source: "plant_m_plant_index",
    monitor_refer: "plant_productTaskList",
    version: "8.4.0.0"
  });
  // {"code":"0","data":{"productInfoList":[[{"productTaskId":"5181","productName":"俏香阁 年货礼盒 坚果大礼包1403g 干果零食 夏威夷果碧根果核桃8袋装 花开富贵1403g/盒","productImg":"https://m.360buyimg.com/n1/jfs/t1/92798/21/8280/357972/5e03131aE7d79499c/39b8d45bf4eb3488.jpg.dpg","price":"79.00","skuId":"100002171032","linkUrl":"https://item.m.jd.com/product/100002171032.html","taskState":"2"},{"productTaskId":"5182","productName":"徐福记 三斤装喜糖喜庆糖1500g(约300颗)结婚礼糖果散装什锦混合硬糖老式夹心水果糖大礼包(新老包装随机发)","productImg":"https://m.360buyimg.com/n1/jfs/t1/67465/7/16253/400541/5ddf29f2E024a5dc7/9253508ede1ac234.jpg.dpg","price":"59.90","skuId":"2210373","linkUrl":"https://item.m.jd.com/product/2210373.html","taskState":"2"}],[{"productTaskId":"5183","productName":"瑞士进口 瑞士莲（Lindt）软心精选巧克力分享装600g","productImg":"https://m.360buyimg.com/n1/jfs/t24058/128/2400952703/213420/87624bb3/5b7e595bN0711ff77.jpg.dpg","price":"144.00","skuId":"1950414","linkUrl":"https://item.m.jd.com/product/1950414.html","taskState":"2"},{"productTaskId":"5184","productName":"乐事（Lay's）薯片 休闲食品 小门神年货大礼盒 爱意满满大礼盒  零食大礼包 630g","productImg":"https://m.360buyimg.com/n1/jfs/t1/88633/8/3169/350007/5ddca49eE24667a8c/053dc4f2c9ae78e5.jpg.dpg","price":"65.00","skuId":"4825006","linkUrl":"https://item.m.jd.com/product/4825006.html","taskState":"2"}],[{"productTaskId":"5185","productName":"飞利浦（PHILIPS）男士电动剃须刀全身水洗刮胡刀剃胡刀胡须刀智能清洁舒仕系列S6840/25","productImg":"https://m.360buyimg.com/n1/jfs/t1/46961/21/5037/160138/5d2c3daeE46d8ab73/d8509e123ab4b6b2.jpg.dpg","price":"1499.00","skuId":"100000158925","linkUrl":"https://item.m.jd.com/product/100000158925.html","taskState":"2"},{"productTaskId":"5186","productName":"百筑别墅 | 2019款 315 欧式别墅（支持尺寸修改） | \"浙江大学规划院\"设计合作","productImg":"https://m.360buyimg.com/n1/jfs/t1/100426/14/2205/492944/5dcd0970Ec852e16d/fdb059a7fd24e21d.jpg.dpg","price":"5000.00","skuId":"55382716777","linkUrl":"https://item.m.jd.com/product/55382716777.html","taskState":"2"}],[{"productTaskId":"5187","productName":"资生堂珊珂（SENKA）绵润泡沫洗面奶套装（泡沫洁面乳120g+胶原洁面膏120g）（男女适用 日本原洗颜专科）","productImg":"https://m.360buyimg.com/n1/jfs/t1/58078/32/13722/219085/5da8225cE02c306b4/ef55716afa7ec8a5.jpg.dpg","price":"73.90","skuId":"100008884058","linkUrl":"https://item.m.jd.com/product/100008884058.html","taskState":"2"},{"productTaskId":"5188","productName":"可比克薯片105g*3分享装心有所薯休闲零食（番茄味+烧烤味+原味)","productImg":"https://m.360buyimg.com/n1/jfs/t19636/67/974385634/219519/ffc9c764/5ab472d0N81fae2fb.jpg.dpg","price":"19.90","skuId":"3088512","linkUrl":"https://item.m.jd.com/product/3088512.html","taskState":"2"}],[{"productTaskId":"5189","productName":"宝家乡墅科技2019乡村住宅技术白皮书标准版","productImg":"https://m.360buyimg.com/n1/jfs/t1/79596/21/14982/98880/5dc80c0dE6990f2d2/a5431d6d30bc886e.jpg.dpg","price":"18.80","skuId":"61525492273","linkUrl":"https://item.m.jd.com/product/61525492273.html","taskState":"2"},{"productTaskId":"5190","productName":"金螳螂家 特权定金优惠券 家装公司装潢效果图设计施工全包 室内装修设计效果图全屋装修服务","productImg":"https://m.360buyimg.com/n1/jfs/t1/81432/37/11264/143676/5d8b0795Eac00c43b/ebdda9bb445096e5.jpg.dpg","price":"10.00","skuId":"12597380224","linkUrl":"https://item.m.jd.com/product/12597380224.html","taskState":"2"}],[{"productTaskId":"5191","productName":"三只松鼠巨型零食2.0升级版/30包 圣诞节生日礼物送女友肩扛大礼包薯片猪肉脯豆干鱼豆腐3436g","productImg":"https://m.360buyimg.com/n1/jfs/t1/106191/30/8121/199127/5e017271E72f1b4db/3a4096e0497f2472.jpg.dpg","price":"188.00","skuId":"8321142","linkUrl":"https://item.m.jd.com/product/8321142.html","taskState":"2"},{"productTaskId":"5192","productName":"思念 开封灌汤风味猪肉小笼包450g*2 36只 早餐方便菜 灌汤包子","productImg":"https://m.360buyimg.com/n1/jfs/t1/76612/5/9519/530434/5d723afeE56ce9483/58590dc9609dc486.jpg.dpg","price":"22.90","skuId":"100004708923","linkUrl":"https://item.m.jd.com/product/100004708923.html","taskState":"2"}],[{"productTaskId":"5193","productName":"正官庄 旗舰店 高丽参茶人参茶300g 100包 六年根滋补保健食品 免疫调节（韩国原装进口）","productImg":"https://m.360buyimg.com/n1/jfs/t1/59234/27/16/133295/5cd2688bE4838dad9/7ca25ed5d9f2c0c0.jpg.dpg","price":"316.00","skuId":"12947157239","linkUrl":"https://item.m.jd.com/product/12947157239.html","taskState":"2"},{"productTaskId":"5194","productName":"健力宝故宫祥龙纳吉罐运动碳酸饮料橙蜜味整箱装330ml*24罐","productImg":"https://m.360buyimg.com/n1/jfs/t1/87974/24/3094/151510/5ddcd004Ef22effff/a229ed7ae396ddde.jpg.dpg","price":"55.90","skuId":"100010329102","linkUrl":"https://item.m.jd.com/product/100010329102.html","taskState":"2"}],[{"productTaskId":"5195","productName":"鱼跃（Yuwell）YT-1红外线电子体温计温度计婴儿高精度额温枪儿童医用家用测温仪精准额头","productImg":"https://m.360buyimg.com/n1/jfs/t1/96084/28/3173/92026/5ddddeaeE2ccf9a8a/a0c2b57e0197cad0.jpg.dpg","price":"99.00","skuId":"100003406321","linkUrl":"https://item.m.jd.com/product/100003406321.html","taskState":"2"},{"productTaskId":"5196","productName":"纳爱斯伢牙乐 儿童牙膏4支装套组（草莓味40g*2+苹果味40g+鲜橙味40g+20g+赠牙刷*2+赠故事书）防蛀牙","productImg":"https://m.360buyimg.com/n1/jfs/t1/105435/10/3517/197719/5de075cfE736e8cbe/b09cefd51a873d46.jpg.dpg","price":"55.90","skuId":"100005175243","linkUrl":"https://item.m.jd.com/product/100005175243.html","taskState":"2"}],[{"productTaskId":"5197","productName":"桂格(QUAKER)麦果脆燕麦片 杨紫同款(多种莓果+热带水果)京东专供 即食早餐麦片 不含反式脂肪酸840g/袋","productImg":"https://m.360buyimg.com/n1/jfs/t1/54254/12/14470/440446/5db66726Ecc30fd6f/77ac3f467086d162.jpg.dpg","price":"75.90","skuId":"100008496418","linkUrl":"https://item.m.jd.com/product/100008496418.html","taskState":"2"},{"productTaskId":"5198","productName":" 2019新茶 雀舌茶叶绿茶 雀舌茶春茶毛尖毛峰明前嫩芽毛尖竹叶茶叶青茶贵州雀舌湄潭翠芽散装250g","productImg":"https://m.360buyimg.com/n1/jfs/t1/82943/32/9847/201527/5d77aeebE76893d76/af53cc3bf6e15055.jpg.dpg","price":"128.00","skuId":"54505271074","linkUrl":"https://item.m.jd.com/product/54505271074.html","taskState":"2"}],[{"productTaskId":"5199","productName":"361度童鞋 男童休闲鞋 中大童 2019年冬季新品 系带防滑耐磨时尚男童休闲鞋 本白/墨蓝 37","productImg":"https://m.360buyimg.com/n1/jfs/t1/96606/34/8259/262401/5e02bc4aE689d756e/5874bcead0d56981.jpg.dpg","price":"209.00","skuId":"52086568290","linkUrl":"https://item.m.jd.com/product/52086568290.html","taskState":"2"},{"productTaskId":"5220","productName":"佐卡伊怦然心动 18k玫瑰金钻石项链吊坠女锁骨链心形会跳舞的钻石圣诞节礼物 质感版3分H/SI白红18K金丨现货/含18K金链","productImg":"https://m.360buyimg.com/n1/jfs/t1/87318/30/8362/111832/5e0386c9Ed25a9859/ddc397e6df800330.jpg.dpg","price":"1399.00","skuId":"47223418664","linkUrl":"https://item.m.jd.com/product/47223418664.html","taskState":"2"}]],"gainNutrients":"0","maxNutrients":"6","everyFollowNutrs":"1","taskState":"2"}}
}

/**
 * 关注商品
 */
export async function productNutrientsTask() {
  requestData("productNutrientsTask", {
    productTaskId: "5182",
    skuId: "2210373",
    monitor_source: "plant_m_plant_index",
    monitor_refer: "plant_productNutrientsTask",
    version: "8.4.0.0"
  });
}
