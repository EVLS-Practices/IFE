import { newRegistry, Timer } from "../../util.js"
import { DEFAULT_SETTINGS } from "../defaultSettings.js"

export class DynamicalSystem {
  start() {
    if (!this.energySystem) {
      throw new Error("EnergySystem not found, Use `connect(energySystem)` and retry!")
    }
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

  connect(energySystem) {
    this.energySystem = energySystem
  }

  constructor(speed, consumptionRate) {
    this.speed = speed || DEFAULT_SETTINGS.Spacecraft.speed
    this.onStartRegistry = newRegistry()
    this.onStopRegistry = newRegistry()
    this.isRunning = false
    this.timer = new Timer(() => this.energySystem.consume(consumptionRate * this.energySystem.maximumEnergies))
    this.onClose = []
  }

  speed
  energySystem
  isRunning
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

