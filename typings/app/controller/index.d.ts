// This file is created by egg-ts-helper@1.25.5
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportShop from '../../../app/controller/shop';

declare module 'egg' {
  interface IController {
    shop: ExportShop;
  }
}
