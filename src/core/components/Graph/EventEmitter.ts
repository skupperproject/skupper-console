interface EventType {
  readonly callback: Function;
  readonly once: boolean;
}

const WILDCARD = '*';

class EventEmitter {
  private _events: Record<string, EventType[]> = {};

  on(evt: string, callback: Function, once?: boolean) {
    if (!this._events[evt]) {
      this._events[evt] = [];
    }
    this._events[evt].push({
      callback,
      once: !!once
    });

    return this;
  }

  once(evt: string, callback: Function) {
    return this.on(evt, callback, true);
  }

  emit(evt: string, ...params: unknown[]) {
    const _this = this as EventEmitter;

    const args = params || [];
    for (let _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }
    const events = this._events[evt] || [];
    const wildcardEvents = this._events[WILDCARD] || [];
    const doEmit = function (es: EventType[]) {
      let length = es.length;
      for (let i = 0; i < length; i++) {
        if (!es[i]) {
          continue;
        }
        const _a = es[i],
          callback = _a.callback,
          once = _a.once;
        if (once) {
          es.splice(i, 1);
          if (es.length === 0) {
            delete _this._events[evt];
          }
          length--;
          i--;
        }
        callback.apply(_this, ...args);
      }
    };
    doEmit(events);
    doEmit(wildcardEvents);
  }

  off(evt?: string, callback?: Function) {
    if (!evt) {
      this._events = {};
    } else {
      if (!callback) {
        delete this._events[evt];
      } else {
        const events = this._events[evt] || [];
        let length_1 = events.length;
        for (let i = 0; i < length_1; i++) {
          if (events[i].callback === callback) {
            events.splice(i, 1);
            length_1--;
            i--;
          }
        }
        if (events.length === 0) {
          delete this._events[evt];
        }
      }
    }

    return this;
  }

  getEvents(): Record<string, EventType[]> {
    return this._events;
  }
}

export default EventEmitter;
