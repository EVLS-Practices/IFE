import { newRegistry } from "../../util.js"
import { Console } from "../console.js"
import { Telegram } from "./Telegram.js"
import { BinaryEncoder } from "./BinaryEncoder.js"

export class RadioTransmitter {
  async send(receiverId, content) {
    const telegram = this.buildTelegram(this.id, receiverId, content)
    const succ = await this.mediator.broadcast(telegram)
    this.onSendRegistry.notify(succ, telegram)
    return succ
  }

  onSend(fn) {
    return this.onSendRegistry.add(fn)
  }

  buildTelegram(senderId, receiverId, content) {
    // Console.log(`Composing telegram: senderId: ${senderId}, receiverId: ${receiverId}, content: ${JSON.stringify(content)}`)
    let encodeType
    switch (this.mediator.type) {
      case "mediator":
        encodeType = "json"
        content = JSON.stringify({ senderId, receiverId, content })
        break
      case "bus":
        encodeType = "binary"
        try {
          content = BinaryEncoder.stringify({ senderId, receiverId, content }, this.binaryMapping)
        } catch (e) {
          Console.error(e)
        }
        break
    }

    return new Telegram(content, encodeType)
  }

  constructor(id, mediator, binaryMapping) {
    this.id = id
    this.mediator = mediator
    this.onSendRegistry = newRegistry()
    this.binaryMapping = binaryMapping
  }

  id
  mediator
  onSendRegistry
  binaryMapping
}
