import { BinaryEncoder } from "../communication/BinaryEncoder.js"

export const SpacecraftRadioBinaryTranslator = {
  commandToBinary: ({ status, energyPercentage }) => {
    let bStatus
    switch(status) {
      case "start":
        bStatus = "0001"
        break
      case "stop":
        bStatus = "0010"
        break
      case "destroy":
        bStatus = "1100"
        break
    }
    return `${bStatus}${BinaryEncoder._toBstring(energyPercentage * 100, 8)}`
  },
  binaryToCommand: binary => {
    let status
    switch(binary.slice(0, 4)) {
      case "0001":
        status = "start"
        break
      case "0010":
        status = "stop"
        break
      case "1100":
        status = "destroy"
        break
    }
    return { status, energyPercentage: parseInt(binary.slice(4), 2) }
  }
}
