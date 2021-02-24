import { Conductor } from "../Conductor.js";

// 00000000 00000000   0000
// senderId receiverId content
// 256 个 id 够用了 指令不超过 16 条
export const BinaryEncoder = {
  _toBstring(digit, pad) {
    return (digit >>> 0).toString(2).padStart(pad, "0")
  },
  stringify({ senderId, receiverId, content }, mapFn) {
    if (senderId > 255) {
      throw new Error("Expect senderId in range 0-255")
    }
    if (receiverId > 255) {
      throw new Error("Expect receiverId in range 0-255")
    }
    const meta = `${this._toBstring(senderId, 8)}${this._toBstring(receiverId, 8)}`
    return `${meta}${mapFn(content)}`
  },
  parse(str, mapFn) {
    const senderId = parseInt(str.slice(0, 8), 2).toString()
    const receiverId = parseInt(str.slice(8, 16), 2).toString()
    const content = str.slice(16)
    return { senderId, receiverId, content: mapFn(content) }
  }
}
