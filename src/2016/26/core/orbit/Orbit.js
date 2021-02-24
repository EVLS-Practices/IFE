import { createElement } from "../../util.js"

export class Orbit {
  constructor(radius) {
    this.radius = radius
  }

  radius

  get radius() {
    return this.radius
  }
}

export class OrbitUI {
  constructor(orbit) {
    this.radius = orbit.radius

    this.element = createElement({
      className: "orbit",
      style: {
        width: `${orbit.radius * 2}px`,
        height: `${orbit.radius * 2}px`
      }
    })
  }

  radius
  element

  get radius() {
    return this.radius
  }

  get element() {
    return this.element
  }
}
