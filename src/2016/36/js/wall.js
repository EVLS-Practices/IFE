import {createElement, applyPropsToElement} from "./utils.js"

export class WallComp {
  $dom
  _color

  constructor(color) {
    this._color = color || "#777"
    this._createDom()
  }

  _createDom() {
    this.$dom = createElement("div", {className: "wall", style: {backgroundColor: this._color}})
  }

  brushColor(color) {
    this._color = color
    applyPropsToElement(this.$dom, {style: {backgroundColor: color}})
  }

  get color() {
    return this._color
  }
}
