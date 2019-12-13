/*
 * @Author: oudingyin
 * @Date: 2019-07-11 17:44:17
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 16:31:16
 */
import { Application } from "egg";

export default (app: Application) => {
  const { controller, router } = app;

  // router.get("/", controller.home.index);
  router.get("/cart", controller.shop.cartList);
  router.post("/cart/buy", controller.shop.cartBuy);
  router.post("/cart/toggle", controller.shop.cartToggle);
  router.post("/cart/toggle-all", controller.shop.cartToggleAll);
  router.post("/cart/add", controller.shop.cartAdd);
  router.post("/cart/del", controller.shop.cartDel);
  router.post("/cart/quantity", controller.shop.cartUpdateQuantity);
  router.post("/buy/direct", controller.shop.buyDirect);
  router.post("/coudan", controller.shop.coudan);
  router.post("/qiangquan", controller.shop.qiangquan);
  router.get("/comment", controller.shop.commentList);
  router.post("/comment/add", controller.shop.comment);
  router.post("/resolve/url", controller.shop.resolveUrl);
  router.get("/seckill/list", controller.shop.seckillList);
  router.get("/goods/list", controller.shop.goodsList);
  router.get("/goods/detail", controller.shop.goodsDetail);
  router.get("/coupons", controller.shop.coupons);
  router.get("/addresses", controller.shop.addresses);
  router.get("/calc/price", controller.shop.calcPrice);

  router.get("/collection", controller.shop.getCollection);
  router.post("/collection/del", controller.shop.delCollection);

  router.get("/check/status", controller.shop.checkStatus);

  router.get("/sixty-course/list", controller.shop.sixtyCourseList);
  router.get("/sixty-course/reply", controller.shop.sixtyCourseReply);

  router.get("/qrcode/generate", controller.common.qrcode);
  router.get("/test/order", controller.shop.testOrder);

  router.get("/config", controller.common.getConfig);
  router.post("/config", controller.common.setConfig);
  router.get("/sys/time", controller.shop.sysTime);
  router.get("/task/list", controller.shop.taskList);
  router.get("/task/cancel", controller.shop.taskCancel);

  router.get("/my/coupons", controller.shop.getMyCoupons);
  router.get("/quanpin/plus", controller.shop.getPlusQuanpinList);
  router.post("/quanpin/plus/get", controller.shop.getPlusQuanpin);

  router.get("/miaosha", controller.shop.miaosha);
};
