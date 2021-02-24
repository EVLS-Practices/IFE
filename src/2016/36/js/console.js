import {createElement} from "./utils.js"

class Console {
  $dom
  _$container

  constructor() {
    this._$container = createElement("div")

    this.$dom = createElement("div", {id: "console"},
      createElement("span", null, "日志："),
      this._$container,
    )
  }

  __print(str, level) {
    this._$container.prepend(createElement("p", level ? {className: level}: null, str))
  }

  log(...args) {
    this.__print(args.join(", "))
    console.log(...args)
  }

  error(...args) {
    this.__print(args.join(", "), "err")
    console.error(...args)
  }
}

export default new Console()
