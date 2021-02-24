import {applyPropsToElement, createElement, sleep} from "./utils.js"

export class PetFace {
  static get orientation() {
    return {
      south: "SOUTH",
      north: "NORTH",
      west: "WEST",
      east: "EAST",
    }
  }

  _animationDuration
  _isLocked
  _orientation

  constructor() {
    this._animationDuration = 0
    this._isLocked = false
    this._orientation = PetFace.orientation.south
    this._createDom()
    this.setDuration(200)
  }

  /**
   * 逆时针旋转 90 deg
   */
  turnLeft() {
    return this._updateOrientation(-90)
  }

  /**
   * 顺时针旋转 90 deg
   */
  turnRight() {
    return this._updateOrientation(90)
  }

  /**
   * 旋转 180 deg
   */
  turnBackward(clockwise) {
    return this._updateOrientation(clockwise ? 180: -180)
  }

  /**
   * 朝西旋转
   */
  async turnWest() {
    switch (this.orientation) {
      case PetFace.orientation.east:
        return this.turnBackward(true)
      case PetFace.orientation.north:
        return this.turnLeft()
      case PetFace.orientation.south:
        return this.turnRight()
    }
  }

  /**
   * 朝东旋转
   */
  async turnEast() {
    switch (this.orientation) {
      case PetFace.orientation.west:
        return this.turnBackward()
      case PetFace.orientation.south:
        return this.turnLeft()
      case PetFace.orientation.north:
        return this.turnRight()
    }
  }

  /**
   * 朝南旋转
   */
  async turnSouth() {
    switch (this.orientation) {
      case PetFace.orientation.east:
        return this.turnRight()
      case PetFace.orientation.west:
        return this.turnLeft()
      case PetFace.orientation.north:
        return this.turnBackward()
    }
  }

  /**
   * 朝北旋转
   */
  async turnNorth() {
    switch (this.orientation) {
      case PetFace.orientation.east:
        return this.turnLeft()
      case PetFace.orientation.west:
        return this.turnRight()
      case PetFace.orientation.south:
        return this.turnBackward()
    }
  }

  setDuration(d) {
    if (typeof d !== "number" || Number.isNaN(d)) throw new TypeError("invalid duration: " + d)
    this._animationDuration = d
  }

  async _updateOrientation(rotateAngle) {
    if (this.isLocked) return
    this._lock()

    const angle = rotateAngle + this._getAngleViaOrientation()

    const d = this._animationDuration
    applyPropsToElement(this.$dom, {
      style: {
        transform: `rotate(${angle}deg)`,
        transition: `transform ${d}ms ease-in-out`,
      },
    })

    if (d) {
      await sleep(d)

      applyPropsToElement(this.$dom, {
        style: {
          transform: `rotate(${this._getSetOrientationViaAngle(angle)}deg)`,
          transition: "none",
        },
      })
    }

    this._unlock()
  }

  _getAngleViaOrientation() {
    switch (this.orientation) {
      case PetFace.orientation.south:
        return 0
      case PetFace.orientation.west:
        return 90
      case PetFace.orientation.north:
        return 180
      case PetFace.orientation.east:
        return 270
    }
  }

  _getSetOrientationViaAngle(angle) {
    const _angle = ((angle % 360) + 360) % 360

    switch (_angle) {
      case 0:
        this._orientation = PetFace.orientation.south
        break
      case 90:
        this._orientation = PetFace.orientation.west
        break
      case 180:
        this._orientation = PetFace.orientation.north
        break
      case 270:
        this._orientation = PetFace.orientation.east
        break
    }
    return _angle
  }

  _lock() {
    this._isLocked = true
  }

  _unlock() {
    this._isLocked = false
  }

  /**
   * 生成图片元素
   */
  _createDom() {
    this.$dom = createElement("img", {src: "./pet.png"})
  }

  get orientation() {
    return this._orientation
  }
}
