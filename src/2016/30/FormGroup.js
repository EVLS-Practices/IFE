import { newRegistry } from "./util.js";

export class FormGroup {
  /**
   * 根据字段名获取 FormControl
   */
  getControl(fieldName) {
    return this.controls[fieldName]
  }

  onChange(fn) {
    this.onChangeRegistry.add(fn)
  }

  dispatchChanges = () => {
    this.onChangeRegistry.notify(this.value)
  }

  /**
   * 验证所有字段
   */
  validate() {
    return Promise.all(this.fields.map(name => this.controls[name].validate()))
  }

  onSubmit(fn) {
    return this.onSubmitRegistry.add(fn)
  }

  handleSubmit = (ev) => {
    this.onSubmitRegistry.notify(ev)
  }

  init() {
    this.fields.forEach(fieldName => this.controls[fieldName].attachForm(this, fieldName))
    Object.values(this.controls).forEach(it => it.onChange(this.dispatchChanges))

    this.el.addEventListener("submit", this.handleSubmit)
  }

  constructor(el, controls) {
    this.el = el
    this.controls = controls
    this.fields = Object.keys(controls)
    this.onChangeRegistry = newRegistry()
    this.onSubmitRegistry = newRegistry()
    this.init()
  }

  el                 // 当前表单元素
  fields             // 所有字段名
  controls           // 所有 FormControl
  onChangeRegistry   // 值变化时的回调
  onSubmitRegistry   // 表单提交时的回调

  get element() {
    return this.el
  }

  get value() {
    return this.fields.reduce((acc, name) => ({ ...acc, [name]: this.controls[name].value }), {})
  }

  get errors() {
    return this.fields.reduce((acc, name) => ({ ...acc, [name]: this.controls[name].errors }), {})
  }

  get isInvalid() {
    return this.fields.some(name => this.controls[name].isInvalid)
  }

  get isValid() {
    return !this.isInvalid
  }
}
