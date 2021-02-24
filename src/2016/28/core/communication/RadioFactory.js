import { RadioReceiver } from "./RadioReceiver.js";
import { RadioTransmitter } from "./RadioTransmitter.js";

export function RadioFactory(mediator, translator) {
  return {
    getTransmitter(id) {
      return new RadioTransmitter(id, mediator, translator.commandToBinary)
    },
    getReceiver(id) {
      return new RadioReceiver(id, mediator, translator.binaryToCommand)
    }
  }
}
