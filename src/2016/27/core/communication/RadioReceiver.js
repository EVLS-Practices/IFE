import { newRegistry } from "../../util.js"
import { BinaryEncoder } from "./BinaryEncoder.js";
import { Console } from "../console.js";

export class RadioReceiver {
  receive(telegram) {
    telegram = this.parseTelegram(telegram)
    if (telegram.receiverId === this.id) {
      Console.log(`Received telegram: senderId: ${telegram.senderId}, receiverId: ${telegram.receiverId}, content: ${telegram.content}`)
      this.onReceiveRegistry.notify(telegram)
    }
  }

  onReceive(fn) {
    this.onStop.push(this.onReceiveRegistry.add(fn))
  }

  parseTelegram(telegram) {
    switch (telegram.encodeType) {
      case "json":
        return JSON.parse(telegram.content)
      case "binary":
        return BinaryEncoder.parse(telegram.content)
      default:
        throw new TypeError(`Invalid encoding: '${telegram.encodeType}'`)
    }
  }

  stop() {
    this.onStop.forEach(it => it())
  }

  constructor(id, mediator) {
    this.id = id
    this.mediator = mediator
    this.onReceiveRegistry = newRegistry()

    this.onStop = [mediator.listen((telegram) => this.receive(telegram))]
  }

  id
  mediator
  onReceiveRegistry
  onStop
}
