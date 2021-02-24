import {createElement, findAscent, getFromStorage, removeAllChild, saveToStorage} from "./utils.js"
import {commands} from "./commands.js"
import {EventEmitter} from "./event-emitter.js"
import {ToggleComp} from "./toggle.js"
import {NAMESPACE} from "./namespace.js"

// import Console from "./console.js"

class CommandLine extends EventEmitter {
  /**
   * 解析指令及参数
   */
  static parse(str) {
    const cmds = Object.keys(CommandLine.commands)
    for (const cmd of cmds) {
      const matches = str.match(CommandLine.commands[cmd].pattern)
      if (matches) {
        /**
         * [命令，参数]
         */
        return [cmd, matches.slice(1)]
      }
    }
    return []
  }

  /**
   * 返回可用命令
   */
  static get commands() {
    return commands
  }

  get isLocked() {
    return this._isLocked
  }

  _currentLineNum // 当前行号
  _errorLineNums  // 错误的行号
  _isLocked       // 执行锁

  constructor() {
    super(Object.keys(CommandLine.commands))
    this._isLocked = false
    this._removeErrorLineNums()
  }

  /**
   * 执行输入框中的命令
   */
  async runCommands() {
    if (this.isLocked) return
    this._lock()
    this._currentLineNum = 0
    this._removeErrorLineNums()

    const inputs = this.getInputs()
    let hasErr = false
    let currentLineNum = this._currentLineNum

    while (inputs.length > 0) {
      currentLineNum += 1
      if (!hasErr) {
        // await sleep(300)
        // 没有语法错误 渲染行号
        this._currentLineNum = currentLineNum
      }
      this._onBeforeParseLine()

      let input = inputs.shift()
      if (input) {
        const [cmd, payload] = CommandLine.parse(input)
        if (cmd) {
          if (!hasErr) {
            // Console.log(`执行指令: ${input}`)
            await this.$emit(cmd, ...payload)
          }
        } else {
          this._errorLineNums.push(currentLineNum)
          hasErr = true
          /**
           * 有错误继续循环 把错误都找出来 但不执行指令
           */
        }
      }
      this._onAfterParseLine()
    }

    this._unlock()
  }

  /**
   * 运行当前行命令
   */
  async runCurrentCommand() {
    if (this.isLocked || this._currentLineNum < 1) return
    this._lock()
    const inputs = this.getInputs()

    this._onBeforeParseLine()
    const input = inputs[this._currentLineNum - 1]
    if (input) {
      const [cmd, payload] = CommandLine.parse(input)
      if (cmd) {
        await this.$emit(cmd, ...payload)
      } else {
        this._errorLineNums.push(this._currentLineNum)
      }
    }
    this._onAfterParseLine()
    this._unlock()
  }

  getInputs() {
    throw new Error("unimplemented")
  }

  _onBeforeParseLine() {
    throw new Error("unimplemented")
  }

  _onAfterParseLine() {
    throw new Error("unimplemented")
  }

  _removeErrorLineNums() {
    this._errorLineNums = []
  }

  _lock() {
    this._isLocked = true
  }

  _unlock() {
    this._isLocked = false
  }
}

export class CommandLineComp extends CommandLine {
  static get storageKey() {
    return `${NAMESPACE}.cli.input`
  }

  static get className() {
    return {
      wrapper: "cliWrapper",
      lineNum: "cliLineNum",
      editorWrapper: "cliEditorWrapper",
      editor: "cliEditor",
      input: "cliInput",
      helpWrapper: "cliHelpWrapper",
      help: "cliHelp",
      currentLine: "curr",
      errorLine: "err",
      showHelp: "show",
    }
  }

  $dom         // 外层元素
  _$input      // 输入框
  _$lineNum    // 行号
  _$helpInfo   // 帮助信息
  _$keybinding // 键位信息

  constructor() {
    super()
    this._createDom()
    this._restoreInputs()
    this._renderLineNum()
  }

  /**
   * 获取输入的命令
   * @return string[]
   */
  getInputs() {
    return this._$input.value.split("\n").map(it => it.trim())
  }

  setInputs(inputs) {
    this._$input.value = inputs.join("\n")
    this._currentLineNum = 0
    this._removeErrorLineNums()
    this._renderLineNum()
    this._saveInputs()
  }

  /**
   * 渲染当前行号
   */
  _onBeforeParseLine() {
    this._renderLineNum()
  }

  /**
   * 渲染执行结果（可能有语法错误）
   */
  _onAfterParseLine() {
    this._renderLineNum()
  }

  _saveInputs() {
    saveToStorage(CommandLineComp.storageKey, this._$input.value)
  }

  _restoreInputs() {
    this._$input.value = getFromStorage(CommandLineComp.storageKey) || ""
  }

  /**
   * 创建视图元素
   */
  _createDom() {
    this._$lineNum = createElement("div", {className: CommandLineComp.className.lineNum}, this._createLineNum())
    this._$input = this._createInput()
    this._$helpInfo = this._createHelpInfo()
    this.$dom =
      createElement("div", {className: CommandLineComp.className.wrapper},
        createElement("div", {className: CommandLineComp.className.editorWrapper},
          this._$helpInfo,
          this._$keybinding,
          createElement("div", {className: CommandLineComp.className.editor},
            this._$lineNum,
            this._$input)),
        new ToggleComp("命令行键位", ["? 显示可用命令", "Alt + Enter 运行输入的命令", "Ctrl + Enter 运行当前行命令"]).$dom)
  }

  /**
   * 创建输入框
   */
  _createInput() {
    return createElement("textarea", {
      wrap: "off",
      className: CommandLineComp.className.input,
      onclick: ev => {
        this._updateCurrentLineNum()
      },
      oninput: ev => {
        switch (ev.inputType) {
          case "insertText": // wtf chrome
          case "insertLineBreak":
          case "insertFromPaste":
          case "deleteWordBackward":
          case "deleteContentBackward":
            this._removeErrorLineNums()
            this._renderLineNum()
        }
        this._saveInputs()
      },
      onkeydown: ev => {
        ev.stopPropagation()
        switch (ev.key) {
          case "Enter":
            if (ev.altKey) {
              ev.preventDefault()
              return this.runCommands()
            } else if (ev.ctrlKey) {
              ev.preventDefault()
              return this.runCurrentCommand()
            } else {
              return this._updateCurrentLineNum()
            }
          case "Backspace":
          case "ArrowUp":
          case "ArrowDown":
          case "ArrowLeft":
          case "ArrowRight":
            return this._updateCurrentLineNum()
          case "?":
            ev.preventDefault()
            return this._showHelpInfo()
        }
      },
    })
  }

  /**
   * 显示帮助信息
   */
  _showHelpInfo() {
    this._$helpInfo.classList.add(CommandLineComp.className.showHelp)
    document.addEventListener("click", this._hideHelpInfo)
    document.addEventListener("keydown", this._hideHelpInfo)
  }

  /**
   * 隐藏帮助信息
   */
  _hideHelpInfo = (ev) => {
    const isKeydown = ev.type === "keydown"
    if ((isKeydown && ev.key === "Escape") ||
        (!isKeydown && !findAscent(ev.target, this._$helpInfo))) {
      this._$helpInfo.classList.remove(CommandLineComp.className.showHelp)
      document.removeEventListener("keydown", this._hideHelpInfo)
      document.removeEventListener("click", this._hideHelpInfo)
    }
  }

  /**
   * 创建帮助信息
   */
  _createHelpInfo() {
    /**
     * 左边指令 右边描述
     */
    const [left, right] = Object.values(CommandLine.commands)
      .reduce((a, {id, desc}) => [[...a[0], id], [...a[1], desc]], [[], []])

    left.unshift("Command")
    right.unshift("Description")

    const maxLen = left.slice().sort((a, b) => b.length - a.length)[0].length

    return createElement("div", {className: CommandLineComp.className.helpWrapper},
      createElement("pre", {className: CommandLineComp.className.help}, ...createRow()))

    function createRow() {
      return left.map((v, i) => createElement("code", null, `${v.padEnd(maxLen, " ")} --- ${right[i]}`))
    }
  }

  /**
   * 创建一个行号
   */
  _createLineNum(num = 1, type) {
    return createElement("span", type ? {className: type}: null, num)
  }

  _updateCurrentLineNum() {
    requestAnimationFrame(() => {
      this._currentLineNum = this._$input.value.substr(0, this._$input.selectionStart).split("\n").length
      this._renderLineNum()
    })
  }

  /**
   * 渲染行号
   */
  _renderLineNum() {
    /**
     * 高亮当前和错误的行号
     */
    const applyClassName = lineNum => {
      let className
      if (lineNum === this._currentLineNum) {
        className = CommandLineComp.className.currentLine
      }
      if (this._errorLineNums.includes(lineNum)) {
        className = CommandLineComp.className.errorLine
      }
      return className
    }

    /**
     * 删掉所有已有行号
     */
    removeAllChild(this._$lineNum)
    /**
     * 插入所有行号
     */
    this._$lineNum.append(...this.getInputs().map((_, i) =>
      this._createLineNum(i + 1, applyClassName(i + 1))))

    const $currentLine = this._$lineNum.querySelector(`.${CommandLineComp.className.currentLine}`)
    if ($currentLine) {
      $currentLine.scrollIntoView({block: "nearest"})
    }
  }
}

