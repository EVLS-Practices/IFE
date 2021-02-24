import { generateId, isNil } from "../../util.js"

export class Telegram {
  toString() {
    return `\nfromId: ${this.senderId}, toId: ${this.receiverId}, content: ${isNil(this.content) ? "" : this.content.toString()}`
  }

  constructor(senderId, receiverId, content) {
    this.id = generateId()
    this.senderId = senderId
    this.receiverId = receiverId
    this.content = content
  }

  id
  senderId
  receiverId
  content

  get id() { return this.id }
  get senderId() { return this.senderId }
  get receiverId() { return this.receiverId }
  get content() { return this.content }
}
