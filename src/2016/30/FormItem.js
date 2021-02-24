import { newRegistry } from "./util.js";

export class FormItem {
  static CLASSNAME = {
    touched: "touched",
    dirty: "dirty",
  }

  reset() {
    this.isTouched = false
    this.isDirty = false
    this.element.classList.remove(FormItem.CLASSNAME.touched)
    this.element.classList.remove(FormItem.CLASSNAME.dirty)
    this.element.addEventListener("focusin", this.touch)
    this.element.addEventListener("change", this.dirty)
  }

  onTouch(fn) {
    return this.onTouchRegistry.add(fn)
  }

  onDirty(fn) {
    return this.onDirtyRegistry.add(fn)
  }

  onChange(fn) {
    return this.onChangeRegistry.add(fn)
  }

  dispatchChanges = () => {
    this.onChangeRegistry.notify()
  }

  touch = () => {
    this.element.classList.add(FormItem.CLASSNAME.touched)
    this.element.removeEventListener("focusin", this.touch)
    this.onTouchRegistry.notify()
  }

  dirty = () => {
    this.element.classList.add(FormItem.CLASSNAME.dirty)
    this.element.removeEventListener("change", this.dirty)
    this.onDirtyRegistry.notify()
  }

  init() {
    this.initType()
    this.reset()
    switch (this.type) {
      case "checkbox":
      case "radio":
        this.element.addEventListener("change", this.dispatchChanges)
        break
      default:
        this.element.addEventListener("keyup", this.dispatchChanges)
    }
  }

  initType() {
    const nodeName = this.element.nodeName.toLowerCase()
    switch (nodeName) {
      case "input":
        switch (this.element.type) {
          case "email":
          case "number":
          case "password":
          case "search":
          case "tel":
          case "url":
          case "datetime":
            this.type = "text"
            break
          default:
            this.type = this.element.type
        }
        break
      case "textarea":
        this.type = "text"
        break
      default:
        this.type = nodeName
    }
  }

  constructor(el) {
    this.el = el
    this.onChangeRegistry = newRegistry()
    this.onTouchRegistry = newRegistry()
    this.onDirtyRegistry = newRegistry()
    this.init()
  }

  el
  type
  isTouched
  isDirty
  onChangeRegistry
  onTouchRegistry
  onDirtyRegistry

  get isTouched() {
    return this.isTouched
  }

  get isDirty() {
    return this.isDirty
  }

  get type() {
    return this.type
  }

  get element() {
    return this.el
  }

  get value() {
    switch (this.type) {
      case "checkbox":
      case "radio":
        return this.element.checked ? this.element.value : ""
      default:
        return this.element.value
    }
  }

  set value(v) {
    switch (this.type) {
      case "checkbox":
      case "radio":
        this.element.checked = v instanceof Array ? v.includes(this.element.value) : this.element.value === v
        break
      default:
        this.element.value = v
    }
  }
}
