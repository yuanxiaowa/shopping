import { Application } from "egg";

export default (app: Application) => {
  const { controller, router } = app;

  // router.get("/", controller.home.index);
  router.get("/cart", controller.shop.cartList);
  router.get("/cart/buy", controller.shop.cartBuy);
  router.get("/cart/toggle", controller.shop.cartToggle);
  router.get("/cart/add", controller.shop.cartAdd);
  router.get("/cart/del", controller.shop.cartDel);
  router.post("/cart/quantity", controller.shop.cartUpdateQuantity);
  router.get("/buy/direct", controller.shop.buyDirect);
  router.get("/coudan", controller.shop.coudan);
  router.get("/qiangquan", controller.shop.qiangquan);
  router.get("/comment", controller.shop.commentList);
  router.post("/comment/add", controller.shop.comment);
  router.get("/resolve/url", controller.shop.resolveUrl);
  router.get("/resolve/urls", controller.shop.resolveUrls);
};
