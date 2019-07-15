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

  router.get("/sixty-course/list", controller.shop.sixtyCourseList);
  router.get("/sixty-course/reply", controller.shop.sixtyCourseReply);

  router.get("/qrcode/generate", controller.common.qrcode);
};
