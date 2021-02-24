import { $, createElement } from "../util.js"

export const Console = {
  el: $("console"),
  append(args, type) {
    this.el.prepend(createElement({
      textContent: args.join(", "),
      className: type
    }))
  },
  log(...args) {
    console.log(...args)
    this.append(args, "log")
  },
  warn(...args) {
    console.warn(...args)
    this.append(args, "warn")
  },
  error(...args) {
    console.error(...args)
    this.append(args, "error")
  }
}

