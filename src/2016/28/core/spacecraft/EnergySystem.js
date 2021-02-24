import { newRegistry, Timer } from "../../util.js"
import { DEFAULT_SETTINGS } from "../defaultSettings.js"

export class EnergySystem {
  charge() {
    if (this.remainEnergies < this.maximumEnergies) {
      this.remainEnergies += this.maximumEnergies * this.energyChargingRate

      if (this.remainEnergies > this.maximumEnergies) {
        this.remainEnergies = this.maximumEnergies
      }

      this.onChargeRegistry.notify(this)
    } else {
      this.timer.stop()
      this.onFullyChargedRegistry.notify(this)
    }
  }

  consume(energies) {
    this.remainEnergies -= energies
    if (this.remainEnergies < 0) {
      this.remainEnergies = 0
    }
    if (this.remainEnergies > 0) {
      this.onConsumeRegistry.notify(this)
    } else {
      this.onExhaustedRegistry.notify(this)
    }
    if (this.remainEnergies <= this.maximumEnergies && !this.timer.isRunning) {
      this.timer.start()
    }
  }

  close() {
    this.onClose.forEach(it => it())
    this.timer.stop()
  }

  onCharge(fn) {
    this.onClose.push(this.onChargeRegistry.add(fn))
  }

  onConsume(fn) {
    this.onClose.push(this.onConsumeRegistry.add(fn))
  }

  onFullyCharged(fn) {
    this.onClose.push(this.onFullyChargedRegistry.add(fn))
  }

  onExhausted(fn) {
    this.onClose.push(this.onExhaustedRegistry.add(fn))
  }

  constructor(initialEnergies, energyChargingRate, maximumEnergies) {
    this.energyChargingRate = energyChargingRate || DEFAULT_SETTINGS.Spacecraft.energyChargingRate
    this.remainEnergies = initialEnergies || DEFAULT_SETTINGS.Spacecraft.initialEnergies
    this.maximumEnergies = maximumEnergies || DEFAULT_SETTINGS.Spacecraft.maximumEnergies
    this.onChargeRegistry = newRegistry()
    this.onConsumeRegistry = newRegistry()
    this.onFullyChargedRegistry = newRegistry()
    this.onExhaustedRegistry = newRegistry()
    this.timer = new Timer(() => this.charge())
    this.onClose = []
  }

  timer
  remainEnergies
  maximumEnergies
  energyChargingRate
  onChargeRegistry
  onConsumeRegistry
  onFullyChargedRegistry
  onExhaustedRegistry
  onClose

  get energyChargingRate() {
    return this.energyChargingRate
  }

  get remainEnergies() {
    return this.remainEnergies
  }

  get maximumEnergies() {
    return this.maximumEnergies
  }

  get energyPercentage() {
    return this.remainEnergies / this.maximumEnergies
  }
}
