import { generateId, isNil } from "../../util.js"

export class Telegram {
  toString() {
    return `\ncontent: ${
      isNil(this.content) ? "" :
        this.encodeType === "binary" ?
          this.content.toString(2) :
          this.content.toString()}`
  }

  constructor(content, encodeType = "json") {
    this.id = generateId()
    this.content = content
    this.encodeType = encodeType
  }

  id
  content
  encodeType
}
