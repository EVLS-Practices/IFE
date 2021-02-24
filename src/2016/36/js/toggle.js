import {createElement} from "./utils.js"

export class ToggleComp {
  $dom

  constructor(summary, list) {
    this.$dom = createElement("details", {open: true},
      createElement("summary", null, summary),
      createElement("ul", null,
        ...list.map(it => createElement("li", null, it))))
  }
}
