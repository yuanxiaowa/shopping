export interface ArgBuyDirect {
  url: string;
  quantity: number;
  other: any;
  expectedPrice?: number;
  skus?: number[];
  jianlou?: number;
  from_cart?: boolean;
}

export interface ArgOrder<T> {
  data: T;
  other: Record<string, string>;
  expectedPrice?: number;
}

export interface ArgCartBuy {
  items: any[];
}
