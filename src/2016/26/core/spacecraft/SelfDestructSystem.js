import { newRegistry } from "../../util.js"

export class SelfDestructSystem {
  active() {
    this.onActiveRegistry.notify()
    this.onActiveRegistry.removeAll()
  }

  onActive(fn) { this.onActiveRegistry.add(fn) }

  constructor() {
    this.onActiveRegistry = newRegistry()
  }

  onActiveRegistry
}
