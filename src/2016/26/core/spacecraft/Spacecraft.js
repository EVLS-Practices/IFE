import { generateId, createElement, applyPropsToElement } from "../../util.js"
import { Conductor } from "../Conductor.js"
import { SelfDestructSystem } from "./SelfDestructSystem.js"
import { EnergySystem } from "./EnergySystem.js"
import { DynamicalSystem } from "./DynamicalSystem.js"
import { RadioReceiver } from "../communication/index.js"

class Spacecraft {
  init() {
    this.radioReceiverSystem.onReceive(({ content }) => {
      switch (content) {
        case Conductor.COMMANDS.START_SPACECRAFT:
          this.dynamicalSystem.start()
          break
        case Conductor.COMMANDS.STOP_SPACECRAFT:
          this.dynamicalSystem.stop()
          break
        case Conductor.COMMANDS.DESTROY_SPACECRAFT:
          this.selfDestructSystem.active()
          break
      }
    })

    this.selfDestructSystem.onActive(() => {
      this.dynamicalSystem.close()
      this.energySystem.close()
      this.radioReceiverSystem.stop()
    })
  }

  onDestroy(fn) {
    this.selfDestructSystem.onActive(() => fn(this))
  }

  constructor(mediator, orbit) {
    this.id = generateId()
    this.selfDestructSystem = new SelfDestructSystem()
    this.energySystem = new EnergySystem()
    this.dynamicalSystem = new DynamicalSystem(this.energySystem)
    this.radioReceiverSystem = new RadioReceiver(this.id, mediator)
    this.orbit = orbit

    this.init()
  }

  id
  selfDestructSystem
  energySystem
  dynamicalSystem
  radioReceiverSystem
  orbit

  get id() {
    return this.id
  }
}

class SpacecraftUI extends Spacecraft {
  initGUI() {
    this.setupAngle()
    this.createElement()
    this.energySystem.onConsume(() => this.updateEnergyBar())
    this.energySystem.onCharge(() => this.updateEnergyBar())
    this.dynamicalSystem.onStart(() => this.runAnimation())
    this.dynamicalSystem.onStop(() => this.stopAnimation())
    this.selfDestructSystem.onActive(() => {
      this.stopAnimation()
      this.orbit.element.removeChild(this.container)
    })
  }

  runAnimation() {
    this.animationId = window.requestAnimationFrame(() => {
      this.currentAngle += this.speedAngle
      applyPropsToElement({
        style: {
          transform: `rotate(${this.currentAngle}deg)`
        }
      }, this.container)
      this.runAnimation()
    })
  }

  stopAnimation() {
    window.cancelAnimationFrame(this.animationId)
  }

  setupAngle() {
    this.currentAngle = 0
    this.speedAngle = this.dynamicalSystem.speed /
      (2 * Math.PI * this.orbit.radius) * 60
  }

  updateEnergyBar() {
    let energyBarClassName
    const percentage = this.energySystem.energyPercentage
    if (percentage > .85) {
      energyBarClassName = "green"
    } else if (percentage > .45) {
      energyBarClassName = "yellow"
    } else {
      energyBarClassName = "red"
    }
    applyPropsToElement({
      className: `energy ${energyBarClassName}`,
      style: {
        width: `${percentage * 100}%`
      }
    }, this.energyBar)
  }

  createElement() {
    this.container = createElement({ className: "spacecraftContainer", 'data-id': this.id })

    const element = createElement({ className: "spacecraft" })

    this.energyBar = createElement()
    this.updateEnergyBar()

    element.append(
      this.energyBar,
      createElement({
        src: "./assets/min-iconfont-rocket-active.png"
      }, "img")
    )

    this.container.appendChild(element)
    this.orbit.element.appendChild(this.container)
  }

  constructor(mediator, orbit) {
    super(mediator, orbit)
    this.initGUI()
  }

  container
  energyBar
  speedAngle
  currentAngle
  animationId
}

export { SpacecraftUI as Spacecraft }
