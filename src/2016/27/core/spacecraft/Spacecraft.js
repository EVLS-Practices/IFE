import { applyPropsToElement, createElement, generateId } from "../../util.js"
import { Conductor } from "../Conductor.js"
import { SelfDestructSystem } from "./SelfDestructSystem.js"
import { RadioReceiver } from "../communication/index.js"

class Spacecraft {
  init() {
    this.radioReceiverSystem.onReceive(({ content }) => {
      switch (content) {
        case Conductor.COMMANDS.START_SPACECRAFT:
          this.dynamicalSystem.start()
          break
        case Conductor.COMMANDS.STOP_SPACECRAFT:
          this.isExhaustedPause = false
          this.dynamicalSystem.stop()
          break
        case Conductor.COMMANDS.DESTROY_SPACECRAFT:
          this.selfDestructSystem.active()
          break
      }
    })

    this.dynamicalSystem.connect(this.energySystem)
    this.energySystem.onExhausted(() => {
      this.isExhaustedPause = true
      this.dynamicalSystem.stop()
    })
    this.energySystem.onFullyCharged(() => {
      if (this.isExhaustedPause) {
        this.dynamicalSystem.start()
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

  constructor(mediator, orbit, dynamicalSystem, energySystem) {
    this.id = generateId()
    this.selfDestructSystem = new SelfDestructSystem()
    this.radioReceiverSystem = new RadioReceiver(this.id, mediator)
    this.energySystem = energySystem
    this.dynamicalSystem = dynamicalSystem
    this.orbit = orbit

    this.init()
  }

  id
  isExhaustedPause
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

    this.energyBar = createElement()
    this.updateEnergyBar()

    const rocketImg = createElement({ src: "./assets/min-iconfont-rocket-active.png" }, "img")

    const element = createElement({ className: "spacecraft" })
    element.append(this.energyBar, rocketImg)

    this.container.appendChild(element)
    this.orbit.element.appendChild(this.container)
  }

  constructor(mediator, orbit, dynamicalSystem, energySystem) {
    super(mediator, orbit, dynamicalSystem, energySystem)
    this.initGUI()
  }

  container
  energyBar
  speedAngle
  currentAngle
  animationId
}

export { SpacecraftUI as Spacecraft }
