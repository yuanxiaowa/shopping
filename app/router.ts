/*
 * @Author: oudingyin
 * @Date: 2019-07-11 17:44:17
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-13 11:13:20
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
  router.post("/resolve/urls", controller.shop.resolveUrls);
  router.get("/seckill/list", controller.shop.seckillList);
  router.get("/goods/list", controller.shop.goodsList);
  router.get("/coupons", controller.shop.coupons);
  router.get("/calc/price", controller.shop.calcPrice);

  router.get("/shop", controller.shop.shopCollection);
  router.post("/shop/del", controller.shop.shopDelete);

  router.get("/check/status", controller.shop.checkStatus);

  router.get("/sixty-course/list", controller.shop.sixtyCourseList);
  router.get("/sixty-course/reply", controller.shop.sixtyCourseReply);

  router.get("/qrcode/generate", controller.common.qrcode);
  router.get("/test/order", controller.shop.testOrder);

  router.get("/config", controller.common.getConfig);
  router.post("/config", controller.common.setConfig);
  router.get("/sys/time", controller.shop.sysTime);
};
