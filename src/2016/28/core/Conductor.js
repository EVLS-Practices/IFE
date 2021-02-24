import { generateId, createElement } from "../util.js"
import { DEFAULT_SETTINGS } from "./defaultSettings.js"
import { Console } from "./console.js"
import { SpacecraftManager } from "./spacecraft/SpacecraftManager.js"

class Conductor {
  static COMMANDS = {
    LAUNCH_NEW_SPACECRAFT: "LAUNCH_NEW_SPACECRAFT",
    DESTROY_SPACECRAFT: "DESTROY_SPACECRAFT",
    START_SPACECRAFT: "START_SPACECRAFT",
    STOP_SPACECRAFT: "STOP_SPACECRAFT"
  }

  async launchNewSpacecraft() {
    /**
     * 指挥官下达销毁飞船指令后，默认在指挥官那里就已经默认这个飞船已经被销毁，
     * 但由于有信息传递丢失的可能性，所以存在实际上飞船未收到销毁指令，而指挥官又创建了新的飞船，
     * 造成宇宙中的飞船数量多于创建的4个上限。
     */
    if (this.spacecraftNums >= this.maximumSpacecraftNum) {
      Console.error(`Launch failed: Reached maximum account of spacecrafts(${this.maximumSpacecraftNum})`)
      return
    }
    const succ = await this.send(SpacecraftManager.id, Conductor.COMMANDS.LAUNCH_NEW_SPACECRAFT)
    if (succ) {
      this.spacecraftNums += 1
    }
    return succ
  }

  startSpacecraft(id) {
    return this.send(id, Conductor.COMMANDS.START_SPACECRAFT)
  }

  stopSpacecraft(id) {
    return this.send(id, Conductor.COMMANDS.STOP_SPACECRAFT)
  }

  destroySpacecraft(id) {
    return this.send(id, Conductor.COMMANDS.DESTROY_SPACECRAFT)
  }

  send(receiverId, msg) {
    return this.transmitter.send(receiverId, msg)
  }

  constructor(transmitterFactory, maximumSpacecraftNum) {
    this.id = generateId()
    this.transmitter = transmitterFactory(this.id)
    this.maximumSpacecraftNum = maximumSpacecraftNum || DEFAULT_SETTINGS.Conductor.maximumSpacecraftNum
    this.spacecraftNums = 0
  }

  id
  transmitter
  spacecraftNums
  maximumSpacecraftNum
}

class ConductorUI extends Conductor {
  initGUI() {
    this.selectedIdControl = createElement(null, "select")

    this.controls = [
      createElement({
        disabled: true,
        textContent: "Start",
        onclick: () => this.startSpacecraft(this.selectedIdControl.value)
      }, "button"),
      createElement({
        disabled: true,
        textContent: "Stop",
        onclick: () => this.stopSpacecraft(this.selectedIdControl.value)
      }, "button"),
      createElement({
        disabled: true,
        textContent: "Destroy",
        onclick: () => this.destroySpacecraft(this.selectedIdControl.value)
      }, "button")
    ]

    this.container.append(
      createElement({
        textContent: "Launch new rocket",
        onclick: () => this.launchNewSpacecraft()
      }, "button"),
      this.selectedIdControl,
      ...this.controls
    )
  }

  syncSelectIdControl() {
    const ids = SpacecraftManager.getAvailableIds()
    if (ids.length > 0) {
      // 当前选择的 id
      const selectedValue = this.selectedIdControl.value
      // 清空选项
      this.selectedIdControl.innerHTML = ""
      // 插入可选 id
      for (let i = 0; i < ids.length; i += 1) {
        this.selectedIdControl.appendChild(createElement({ textContent: ids[i] }, "option"))
      }
      // 恢复当前选择的 id
      if (ids.find(it => it === selectedValue)) {
        this.selectedIdControl.value = selectedValue
      }

      this.controls.forEach(it => it.disabled = false)
    } else {
      this.controls.forEach(it => it.disabled = true)
    }
  }

  async launchNewSpacecraft() {
    const succ = await super.launchNewSpacecraft()
    if (succ) {
      this.syncSelectIdControl()
    }
    return succ
  }

  async destroySpacecraft(id) {
    const succ = await super.destroySpacecraft(id)
    if (succ) {
      this.syncSelectIdControl()
    }
    return succ
  }

  constructor(container, transmitterFactory, maximumSpacecraftNum) {
    super(transmitterFactory, maximumSpacecraftNum)
    this.container = container
    this.initGUI()
  }

  container
  selectedIdControl
  controls
}

export { ConductorUI as Conductor }
