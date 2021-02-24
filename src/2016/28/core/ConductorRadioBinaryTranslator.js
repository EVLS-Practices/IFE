import { Conductor } from "./Conductor.js"
import { BinaryEncoder } from "./communication/BinaryEncoder.js"

export const ConductorRadioBinaryTranslator = {
  commandToBinary: command => {
    const _commands = Object.keys(Conductor.COMMANDS)
    const idx = _commands.findIndex(it => it === command)
    if (idx > -1) {
      return BinaryEncoder._toBstring(idx, 4)
    }
    return ""
  },
  binaryToCommand: binary => {
    const _commands = Object.keys(Conductor.COMMANDS)
    const command = _commands[parseInt(binary, 2)]
    return command || ""
  }
}
