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
