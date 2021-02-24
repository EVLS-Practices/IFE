import { createElement } from "../../util.js"
import { Orbit, OrbitUI } from "./Orbit.js"

class OrbitManager {
  getEmptyOrbit() {
    return this.emptyOrbit.splice(0, 1)[0] || this.newOrbit()
  }

  giveBack(orbit) {
    this.emptyOrbit.push(orbit)
  }

  newOrbit() {
    const res = new Orbit(this.nextRadius)
    this.nextRadius += this.orbitDistanceUnit
    return res
  }

  constructor() {
    this.emptyOrbit = []
    this.planetRadius = 40
    this.orbitDistanceUnit = 40
    this.nextRadius = this.planetRadius + this.orbitDistanceUnit
  }

  emptyOrbit
  planetRadius
  orbitDistanceUnit
  nextRadius
}

class OrbitManagerUI extends OrbitManager {
  init() {
    const planetImg = createElement({ src: "./assets/min-iconfont-planet.png" }, "img")
    const planetWrapper = createElement({
      style: {
        position: "absolute",
        width: `${this.planetRadius * 2}px`,
        height: `${this.planetRadius * 2}px`
      }
    })
    planetWrapper.appendChild(planetImg)

    const orbitContainer = createElement({ className: "orbitContainer" })
    orbitContainer.appendChild(planetWrapper)
    this.container.appendChild(orbitContainer)

    this.orbitContainer = orbitContainer
  }

  newOrbit() {
    const orbit = super.newOrbit()
    const orbitUI = new OrbitUI(orbit)
    this.orbitContainer.appendChild(orbitUI.element)
    return orbitUI
  }

  constructor(container) {
    super()
    this.container = container
    this.init()
  }

  container
  orbitContainer
}

export { OrbitManagerUI as OrbitManager }
