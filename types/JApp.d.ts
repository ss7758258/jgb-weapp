import { DefaultData } from './common';
import { IEventFunction, INewEventBus } from './eventbus';

interface IAppOptions<P extends JApp = JApp, Data = DefaultData<P>>
  extends App.AppInstance<Data> {}

export interface JApp extends Required<App.AppInstance>, INewEventBus {}

interface IJAppConstructor extends App.AppConstructor {
  mixin(obj: App.AppInstance & IAnyObject): void;
  intercept(event: string, fn: IEventFunction): void;
  intercept(fn: IEventFunction): void;
}

export var JApp: IJAppConstructor;
