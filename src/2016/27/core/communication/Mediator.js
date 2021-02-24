import { newRegistry, sleep } from "../../util.js"
import { DEFAULT_SETTINGS } from "../defaultSettings.js"
import { Console } from "../console.js"

export class Mediator {
  listen(fn) {
    return this.registry.add(fn)
  }

  async broadcast(msg) {
    await sleep(this.delay)
    if (Math.random() > this.packetLossRate) {
      Console.log(`Send success: ${msg}`)
      this.registry.notify(msg)
      return true
    }
    Console.warn(`Send failed: ${msg}`)
    return false
  }

  constructor(packetLossRate, delay, type = "mediator") {
    this.packetLossRate = packetLossRate || DEFAULT_SETTINGS.Mediator.packetLossRate
    this.delay = delay || DEFAULT_SETTINGS.Mediator.delay
    this.registry = newRegistry()
    this.type = type
  }

  registry
  packetLossRate
  delay
  type
}
