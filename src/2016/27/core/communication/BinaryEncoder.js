import { Conductor } from "../Conductor.js";

// 00000000 00000000   0000
// senderId receiverId content
// 256 个 id 够用了 指令不超过 16 条
export const BinaryEncoder = {
  _toBstring(digit, pad) {
    return (digit >>> 0).toString(2).padStart(pad, "0")
  },
  stringify({ senderId, receiverId, content }) {
    if (senderId > 255) {
      throw new Error("Expect senderId in range 0-255")
    }
    if (receiverId > 255) {
      throw new Error("Expect receiverId in range 0-255")
    }
    const meta = `${this._toBstring(senderId, 8)}${this._toBstring(receiverId, 8)}`
    // 这里写死了，有时间的话可以写个指令翻译传进来
    switch (content) {
      case Conductor.COMMANDS.LAUNCH_NEW_SPACECRAFT:
        return `${meta}0000`
      case Conductor.COMMANDS.DESTROY_SPACECRAFT:
        return `${meta}0001`
      case Conductor.COMMANDS.START_SPACECRAFT:
        return `${meta}0010`
      case Conductor.COMMANDS.STOP_SPACECRAFT:
        return `${meta}0100`
      default:
        throw new TypeError(`Unfound directive: '${content}'`)
    }
  },
  parse(str) {
    const senderId = parseInt(str.slice(0, 8), 2).toString()
    const receiverId = parseInt(str.slice(8, 16), 2).toString()
    const content = str.slice(16)
    let parsedContent
    switch (content) {
      case "0000":
        parsedContent = Conductor.COMMANDS.LAUNCH_NEW_SPACECRAFT
        break
      case "0001":
        parsedContent = Conductor.COMMANDS.DESTROY_SPACECRAFT
        break
      case "0010":
        parsedContent = Conductor.COMMANDS.START_SPACECRAFT
        break
      case "0100":
        parsedContent = Conductor.COMMANDS.STOP_SPACECRAFT
        break
      default:
        throw new TypeError(`Unfound directive '${content}'`)
    }
    return { senderId, receiverId, content: parsedContent }
  }
}
