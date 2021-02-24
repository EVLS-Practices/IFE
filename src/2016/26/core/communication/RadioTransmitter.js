import { newRegistry } from "../../util.js"

export class RadioTransmitter {
  async send(telegram) {
    const succ = await this.mediator.broadcast(telegram)
    this.onSendRegistry.notify(succ, telegram)
  }

  onSend(fn) { return this.onSendRegistry.add(fn) }

  constructor(id, mediator) {
    this.id = id
    this.mediator = mediator
    this.onSendRegistry = newRegistry()
  }

  id
  mediator
  onSendRegistry
}
