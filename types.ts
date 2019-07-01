import { Page } from "puppeteer";

export type HandlerMap = Record<
  string,
  {
    test(url: string): boolean;
    handler(page: Page): Promise<any>;
  }
>;
