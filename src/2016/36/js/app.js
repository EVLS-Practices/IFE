import {createElement, findAscent, getFromStorage, initial, last, readImage, saveToStorage} from "./utils.js"
import {CommandLineComp} from "./cli.js"
import {GridComp} from "./grid.js"
import {PetController} from "./pet-controller.js"
import {PetFace} from "./pet-face.js"
import {NAMESPACE} from "./namespace.js"
import {WallComp} from "./wall.js"
import {ToggleComp} from "./toggle.js"
import Console from "./console.js"

export class App {
  static get storageKey() {
    return {
      gridSize: `${NAMESPACE}.grid.size`,
      gridAnimationDuration: `${NAMESPACE}.grid.animation.duration`,
    }
  }

  static get id() {
    return {
      root: "root",
      controlsGroup: "controlsGroup",
    }
  }

  $dom
  _cli
  _grid
  _petFace
  _petController

  constructor() {
    this._cli = new CommandLineComp()
    this._grid = new GridComp(15)
    this._petFace = new PetFace()
    this._petController = new PetController(this._grid, this._petFace, {x: 0, y: 0})
    this._createDom()
    this._bindEvents()
  }

  _bindEvents() {
    /**
     * 命令行事件
     */
    Object.keys(CommandLineComp.commands)
      .forEach(instruction => {
        this._cli.$on(instruction, this._petController[instruction])
      })

    /**
     * 点击移动到指定格子
     */
    this._grid.onClick(async (x, y) => {
      await this._petController.moveTo(x, y)
      return this._petController.turnSouth()
    })

    /**
     * 键盘控制
     */
    document.addEventListener("keydown", this._handleKeydown)
  }

  /**
   * 修改网格大小
   */
  _resizeGrid(size) {
    if (size && !this._petController.isLocked) {
      this._grid.resize(size)
      this._grid.addItem(0, 0, this._petFace)
      this._petController.setPos(0, 0)
      saveToStorage(App.storageKey.gridSize, size)
    }
  }

  /**
   * 重置网格
   */
  _reset = () => this._resizeGrid(this._grid.size[0])

  /**
   * 设置动画时间
   */
  _setDuration(d) {
    if (d) {
      this._grid.setDuration(d)
      this._petFace.setDuration(d)
      saveToStorage(App.storageKey.gridAnimationDuration, d)
    }
  }

  /**
   * 打印图像
   */
  _handlePrintGraph = async (ev) => {
    if (this._petController.isLocked) return
    const files = ev.target.files
    if (files && files.length > 0) {
      const data = await readImage(files[0], ...this._grid.size)
      this._reset()
      const inputs = ["MOV TO 0,1", "TUN BAC"]

      const everythingButLastRow = initial(data)

      everythingButLastRow.forEach((row, i) => {
        const ltr = i % 2 === 0
        const lastIdx = row.length - 1
        row.forEach((color, idx) => {
          inputs.push("BUILD", `BRU ${color}`)
          if (idx !== lastIdx) {
            inputs.push(`TRA ${ltr ? "RIG": "LEF"}`)
          }
        })
        if (i !== everythingButLastRow.length - 1) {
          inputs.push("TRA BOT")
        }
      })

      /**
       * 最后一行
       */
      const rtl = data.length % 2 === 0
      inputs.push(`TUN ${rtl ? "RIG": "LEF"}`)

      const lastRow = initial(last(data))
      ;(rtl ? lastRow.reverse(): lastRow).forEach(color => {
        inputs.push(`TRA ${rtl ? "LEF": "RIG"}`, "BUILD", `BRU ${color}`)
      })

      this._cli.setInputs(inputs)
    }
  }

  /**
   * 键位：上、下、左、右、建墙拆墙、转头
   */
  _handleKeydown = (ev) => {
    if (findAscent(ev.target, it => it.id === App.id.controlsGroup)) return

    switch (ev.key) {
      case "s":
      case "j":
      case "ArrowDown":
        ev.preventDefault()
        this._petController.moveSouth()
        break
      case "w":
      case "k":
      case "ArrowUp":
        ev.preventDefault()
        this._petController.moveNorth()
        break
      case "a":
      case "h":
      case "ArrowLeft":
        ev.preventDefault()
        this._petController.moveWest()
        break
      case "d":
      case "l":
      case "ArrowRight":
        ev.preventDefault()
        this._petController.moveEast()
        break
      case "z":
        ev.preventDefault()
        this._petController.turnBackward()
        break
      case "x":
        ev.preventDefault()
        this._petController.turnRight()
        break
      case "r":
      case "c":
        if (ev.ctrlKey || ev.altKey) break
        ev.preventDefault()
        this._petController.turnLeft()
        break
      case " ":
        ev.preventDefault()
        this._petController.buildOrDemolish()
        break
    }
  }

  _createDom() {
    this.$dom = createElement("div", {id: App.id.root},
      createElement("div", {id: App.id.controlsGroup},
        ...this._createControls(), this._cli.$dom),
      createElement("div", {id: "main"},
        this._grid.$dom,
        new ToggleComp("控制键位", ["W,S,A,D 或 K,J,H,L 或 方向键 上下左右", "空格 建墙/拆墙", "C 或 R 向左转", "X 向右转", "Z 向后转"]).$dom),
      Console.$dom,
    )
  }

  _createControls() {
    return [
      this._createSizeControl(),
      this._createAnimationDurationControl(),
      this._createResetControl(),
      this._createRunCommandsControl(),
      this._createRandomBuildWallsControl(),
      this._createPrintGraphControl(),
    ]
  }

  _createSizeControl() {
    const res = createElement("select", {
        onchange: (ev) => this._resizeGrid(+ev.target.value),
      },
      ...[15, 18, 20, 25].map(size =>
        createElement("option", {value: size}, `${size}x${size}`)))

    const initSize = getFromStorage(App.storageKey.gridSize) || 15
    res.value = initSize
    this._resizeGrid(initSize)
    return res
  }

  _createAnimationDurationControl() {
    const res = createElement("select", {
        onchange: (ev) => {this._setDuration(+ev.target.value)},
      },
      ...[
        [250, "常速"],
        [200, "快速"],
        [120, "疾速"],
        [80, "超音速"],
      ].map(([speed, name]) => createElement("option", {value: speed}, name)))

    const initDuration = getFromStorage(App.storageKey.gridAnimationDuration) || 250
    res.value = initDuration
    this._setDuration(initDuration)
    return res
  }

  _createResetControl() {
    return createElement("button", {
      onclick: this._reset,
    }, "重置")
  }

  _createRunCommandsControl() {
    return createElement("button", {
      onclick: () => this._cli.runCommands(),
    }, "运行")
  }

  _createRandomBuildWallsControl() {
    return createElement("button", {
      onclick: () => {
        if (this._petController.isLocked || this._grid.isFull) return
        const [rows, cols] = this._grid.size
        const walls = Math.floor(rows * cols * .3)
        for (let i = 0; i < walls; i += 1) {
          const [x, y] = this._grid.getRandomEmptyPos()
          this._grid.addItem(x, y, new WallComp())
        }
      },
    }, "随机建墙")
  }

  _createPrintGraphControl() {
    return createElement("frag", null,
      createElement("label", {
        htmlFor: "printGraphBtn",
        className: "btn",
      }, "打印图像"),

      createElement("input", {
        id: "printGraphBtn",
        type: "file",
        accept: "image/*",
        style: {display: "none"},
        onchange: this._handlePrintGraph,
      }))
  }
}
