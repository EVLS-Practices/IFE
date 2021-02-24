import { FormItem } from "./FormItem.js";
import { findAncestorElement, newRegistry, createElement } from "./util.js";

export class FormControl {
  onChange(fn) {
    return this.onChangeRegistry.add(fn)
  }

  dispatchChanges = () => {
    /**
     * 因为所有的验证都是异步的，把回调放到宏队列避免 debug 出现验证信息是上一次的情况
     */
    window.setTimeout(() => {
      this.onChangeRegistry.notify()
    }, 0)
  }

  /**
   * 获取所有当前字段的输入元素，包装成 FormItem
   */
  attachFormItems() {
    const name = this.name
    const items = Array.from(this.formGroup.element.querySelectorAll(`[name=${name}]`))
    if (items.length === 0) {
      throw new Error(`Cannot find formControl with name '${name}', make sure you have set the 'name' attribute on the corresponding element`)
    }

    this.items = items.map(it => {
      const result = new FormItem(it)
      /**
       * 注册回调
       */
      result.onChange(this.dispatchChanges)
      result.onTouch(() => this.el.classList.add("touched"))
      result.onDirty(() => this.el.classList.add("dirty"))
      return result
    })

    const nodeName = items[0].nodeName
    const nodeType = this.items[0].type

    /**
     * name 相同但是输入元素类型不同，可能是出错了，提示用户
     */
    const notIdenticalNodeName = items.find(it => it.nodeName !== nodeName)
    const notIdenticalNodeType = this.items.find(it => it.type !== nodeType)
    if (notIdenticalNodeName) {
      console.error(`Found non-identical node`, notIdenticalNodeName)
    }
    if (notIdenticalNodeType) {
      console.error(`Found non-identical node`, notIdenticalNodeType)
    }

    if (!notIdenticalNodeName && !notIdenticalNodeType) {
      this.type = nodeType
    }
  }

  /**
   * 获取 formControl 元素，初始化提示信息容器
   */
  initFormControl() {
    const element = findAncestorElement(this.items[0].element, el => el.classList.contains("formControl"))
    if (!element) {
      throw new Error("If you can't find an element with class=formControl, wrap the element with the same name attribute with an element with class=formControl")
    }
    let msgContainer = element.querySelector(".validationMsg")
    if (!msgContainer) {
      msgContainer = createElement({ className: "validationMsg", textContent: this.initMsg })
      element.appendChild(msgContainer)
    }
    this.el = element
    this.msgContainer = msgContainer
  }

  /**
   * 和 DOM 元素对接
   */
  attachForm(formGroup, name) {
    this.name = name
    this.formGroup = formGroup
    this.attachFormItems()
    this.initFormControl()

    this.value = this.initialValue
    const defaultValidateOn = ((this.type === "radio" || this.type === "checkbox") ? "change" : "keyup")
    this.validateOn(this._validateOn || defaultValidateOn)
  }

  /**
   * 设置验证时机
   */
  validateOn(eventName) {
    /**
     * 删掉上次验证回调
     */
    if (this._validateOn) {
      this.items.forEach(it => it.element.removeEventListener(this._validateOn, this.validate))
    }

    this.items.forEach(it => it.element.addEventListener(eventName, this.validate))
    this._validateOn = eventName
  }

  /**
   * 校验并设置信息到提示容器
   */
  validate = async () => {
    const result = await Promise.all(this.validators.map(validator => validator(this.value)))
    /**
     * 过滤掉成功的消息（null）
     */
    this._errors = result.filter(it => it !== null)

    if (this.isValid) {
      this.msgContainer.innerHTML = this.successMsg
      this.el.classList.remove("invalid")
      this.el.classList.add("valid")
    } else {
      this.msgContainer.innerHTML = this._errors.map(it => `<div>${it}</div>`).join("")
      this.el.classList.add("invalid")
      this.el.classList.remove("valid")
    }

    return this._errors
  }

  constructor(val, validators, { validateOn, successMessage, initialMessage } = {}) {
    this.initialValue = val
    this.validators = validators || []
    this._validateOn = validateOn
    this.successMsg = successMessage || ""
    this.initMsg = initialMessage || ""
    this.onChangeRegistry = newRegistry()
    this._errors = []
  }

  el                 // 类名为 formControl 的元素 通常包裹 name=this.name 的元素
  msgContainer       // 验证消息容器
  name               // 表单字段
  type               // 输入类型
  validators         // 验证器
  initialValue       // 初始值
  _errors            // 错误信息
  formGroup          // 父级（隶属表单）
  items              // 控制元素（ type=text 只有一个，checkbox、radio 有多个
  _validateOn        // 什么时候校验 blur change keyup...
  onChangeRegistry   // 当值发生变化时的回调
  successMsg         // 校验成功消息
  initMsg            // 初始消息

  /**
   * 是否触碰过
   */
  get isTouched() {
    return this.items.some(it => it.isTouched)
  }

  /**
   * 值是否变过
   */
  get isDirty() {
    return this.items.some(it => it.isDirty)
  }

  /**
   * 类型
   */
  get type() {
    return this.type
  }

  get isValid() {
    return this._errors.length === 0
  }

  get isInvalid() {
    return !this.isValid
  }

  get name() {
    return this.name
  }

  get value() {
    switch (this.type) {
      case "radio":
        return this.items.find(it => it.value.trim().length > 0).value
      case "checkbox":
        return this.items.map(it => it.value)
      default:
        return this.items[0].value
    }
  }

  set value(v) {
    this.items.forEach(it => it.value = v)
  }

  get errors() {
    return this._errors
  }
}
