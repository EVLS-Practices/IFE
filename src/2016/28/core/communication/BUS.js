import { Mediator } from "./Mediator.js"
import { Console } from "../console.js";

export class BUS extends Mediator {
  constructor() {
    super(.1, 300, "bus")
  }

  async broadcast(msg) {
    const succ = await super.broadcast(msg);
    if (!succ) {
      Console.warn("Retrying...")
      return await this.broadcast(msg)
    }
    return succ
  }
}
