import { newRegistry } from "../../util.js"

export class RadioReceiver {
  receive(telegram) {
    if (telegram.receiverId === this.id) {
      this.onReceiveRegistry.notify(telegram)
    }
  }

  onReceive(fn) { this.onStop.push(this.onReceiveRegistry.add(fn)) }

  stop() { this.onStop.forEach(it => it()) }

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
