import { newRegistry, Timer } from "../../util.js"
import { DEFAULT_SETTINGS } from "../defaultSettings.js"

export class DynamicalSystem {
  start() {
    if (!this.isRunning) {
      this.isRunning = true
      this.timer.start()
      this.onStartRegistry.notify(this)
    }
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false
      this.timer.stop()
      this.onStopRegistry.notify(this)
    }
  }

  close() {
    this.onClose.forEach(it => it())
    this.stop()
  }

  onStart(fn) {
    this.onClose.push(this.onStartRegistry.add(fn))
  }

  onStop(fn) {
    this.onClose.push(this.onStopRegistry.add(fn))
  }

  onClose(fn) {
    this.onClose.push(fn)
  }

  constructor(energySystem, speed) {
    this.speed = speed || DEFAULT_SETTINGS.Spacecraft.speed
    this.energySystem = energySystem
    this.onStartRegistry = newRegistry()
    this.onStopRegistry = newRegistry()
    this.isRunning = false
    this.timer = new Timer(() => this.energySystem.consume())
    this.onClose = []

    this.energySystem.onExhausted(() => {
      this.isExhaustedPause = true
      this.stop()
    })
    this.energySystem.onFullyCharged(() => {
      if (this.isExhaustedPause) {
        this.start()
      }
    })
  }

  speed
  energySystem
  isRunning
  isExhaustedPause
  onStartRegistry
  onStopRegistry
  onClose
  timer

  get speed() {
    return this.speed
  }

  get isRunning() {
    return this.isRunning
  }
}
