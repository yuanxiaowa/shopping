/*
 * @Author: oudingyin
 * @Date: 2019-07-22 08:53:50
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-16 10:34:23
 */
export interface ArgBuyDirect {
  url: string;
  quantity: number;
  other: any;
  expectedPrice?: number;
  skus?: number[];
  jianlou?: number;
  from_cart?: boolean;
  from_pc?: boolean;
}

export interface ArgOrder<T> {
  data: T;
  other: Record<string, string>;
  expectedPrice?: number;
  noinvalid?: boolean;
}

export interface ArgCartBuy {
  items: any[];
}

export type ArgSearch = {
  name: string;
  page: number;
  keyword: string;
  start_price?: string;
  coupon_tag_id?: string;
} & Record<string, any>;
