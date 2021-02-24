import {removeFromArr} from "./utils.js"

export class EventEmitter {
  listeners

  constructor(evNames) {
    if (!evNames) throw new TypeError("Event name list is required!")
    this.listeners = evNames.reduce((a, n) => ({...a, [n]: []}), {})
  }

  $on(evName, callback) {
    const listeners = this.listeners[evName]
    if (listeners) {
      listeners.push(callback)
    }
    return () => {
      this.$off(evName, callback)
    }
  }

  $off(evName, callback) {
    const listeners = this.listeners[evName]
    if (listeners) {
      removeFromArr(listeners, callback)
    }
  }

  async $emit(evName, ...payload) {
    const listeners = this.listeners[evName]
    if (listeners) {
      for (const listener of listeners) {
        if (listener) {
          await listener.apply(null, payload)
        }
      }
    }
  }
}
