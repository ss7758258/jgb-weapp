import { IEventBus, IEventFunction } from '../types/eventbus';
import { bus } from './EventBus';
import nextTick from './utils/nextTick';

export const event = '$events$';
export const evtBusCollection = '$evtBus$';
export const setTimeoutCollection = '$setTimeout$';
export const setIntervalCollection = '$setInterval$';

export default class JBase {
  /* 当前绑定事件集合 */
  private [event]: Array<number | number[]>;
  private [evtBusCollection]: Array<[IEventBus, number | number[]]>;

  private [setTimeoutCollection]: Set<number>;
  private [setIntervalCollection]: Set<number>;

  constructor() {
    if (this) {
      this[event] = [];
      this[evtBusCollection] = [];
      this[setTimeoutCollection] = new Set();
      this[setIntervalCollection] = new Set();
    }
  }

  $on(evtName: string, fn: IEventFunction) {
    const ids = bus.on(evtName, fn);
    this[event].push(ids);
  }

  $once(evtName: string, fn: IEventFunction) {
    const ids = bus.once(evtName, fn);
    this[event].push(ids);
  }

  $emit(evtName: string, ...data: any[]) {
    bus.emit(evtName, ...data);
  }

  async $emitAsync(evtName: string, ...data: any[]) {
    await bus.emitAsync(evtName, ...data);
  }

  $off(evtName?: string, fn?: IEventFunction) {
    bus.off(evtName, fn);
  }

  $setTimeout(fn: IEventFunction, timeout = 0) {
    const id: number = setTimeout(fn, timeout) as any;
    this[setTimeoutCollection].add(id);
    return id;
  }

  $setInterval(fn: IEventFunction, timeout = 0) {
    const id: number = setInterval(fn, timeout) as any;
    this[setIntervalCollection].add(id);
    return id;
  }

  /**
   * 增加 eventBusId
   */
  $addBusId(ids: number | number[], busInstance?: IEventBus) {
    if (busInstance) {
      this[evtBusCollection].push([busInstance, ids]);
      return;
    }
    this[event].push(ids);
  }

  /* 清除所有当前绑定的事件 */
  $destory() {
    const events = this[event];
    // 下一帧执行, 避免事件被提前销毁
    nextTick(() => {
      while (events.length) {
        const ids = events.pop();
        bus.off(ids);
      }

      const collects = this[evtBusCollection];
      while (collects.length) {
        const [instance, ids] = collects.pop();
        instance.off(ids);
      }
    });
    this[event] = [];
    this[setTimeoutCollection].forEach(id => clearTimeout(id));
    this[setIntervalCollection].forEach(id => clearInterval(id));
  }
}
