import {rand, sleep, forEachRight, findAscent, range, createElement, applyPropsToElement} from "./utils.js"

class Grid {
  get size() {
    return [this._rowNum, this._colNum]
  }

  _rowNum  // 行数
  _colNum  // 列数
  _map

  constructor(rowNum, colNum) {
    this._rowNum = rowNum
    this._colNum = colNum || rowNum
    this._map = this._createMap()
  }

  resize(rowNum, colNum) {
    this._rowNum = rowNum
    this._colNum = colNum || rowNum
    this._map = this._createMap()
  }

  /**
   * 返回一个随机空坐标
   */
  getRandomEmptyPos() {
    if (this.isFull) return null

    const _rand = n => Math.floor(rand(0, n))

    let x = _rand(this._colNum)
    let y = _rand(this._rowNum)
    while (this.getItem(x, y) !== null) {
      x = _rand(this._colNum)
      y = _rand(this._rowNum)
    }
    return [x, y]
  }

  /**
   * 是否是合法坐标
   */
  isValidPos(x, y) {
    if (Number.isNaN(x) || Number.isNaN(y)) return false
    return x > -1 && y > -1 && x < this._colNum && y < this._rowNum
  }

  /**
   * 添加一个占位格
   */
  addItem(x, y, data) {
    if (!this.isValidPos(x, y) || this.hasItem(x, y)) return null
    const item = {x, y, data}
    this._map[y][x] = {...item}
    return item
  }

  /**
   * 删除一个占位格
   */
  removeItem(x, y) {
    if (!this.isValidPos(x, y)) return null
    const item = this._map[y][x]
    this._map[y][x] = null
    return item
  }

  /**
   * 移动一个占位格
   */
  moveItem(sx, sy, dx, dy) {
    if (!this.isValidPos(sx, sy) || !this.isValidPos(dx, dy) ||
        !this.hasItem(sx, sy) || this.hasItem(dx, dy)) {
      return null
    }
    const item = this.getItem(sx, sy)

    this._map[sy][sx] = null

    const itemCopy = {...item, x: dx, y: dy}
    this._map[dy][dx] = {...itemCopy}

    return itemCopy
  }

  hasItem(x, y) {
    if (!this.isValidPos(x, y)) return true
    return this._map[y][x] !== null
  }

  /**
   * 根据获取占位格
   */
  getItem(x, y) {
    if (!this.isValidPos(x, y)) return null
    const item = this._map[y][x]
    return item ? {...item}: null
  }

  _createMap() {
    return range(0, this._rowNum, () => range(0, this._colNum, () => null))
  }

  get isFull() {
    return !this._map.some((r, y) => r.some((_, x) => this.hasItem(x, y)))
  }
}

export class GridComp extends Grid {
  static get className() {
    return {
      wrapper: "gridWrapper",
      grid: "grid",
      row: "row",
      axis: "axis",
      cell: "cell",
      item: "item",
    }
  }

  $dom
  _cellSize          // 格子大小
  _animationDuration // 动画时间
  _domMap            // 占位格地图
  _listeners         // 点击事件监听器

  constructor(rowNum, colNum) {
    super(rowNum, colNum)
    this._domMap = this._createMap()
    this._setCellSize()
    this._listeners = []
    this.$dom = this._createDom()
    this.setDuration(200)
  }

  _setCellSize() {
    this._cellSize = this._rowNum * this._colNum > 400 ? 25: 30
  }

  resize(rowNum, colNum) {
    super.resize(rowNum, colNum)
    this._domMap = this._createMap()
    this._setCellSize()
    const $newDom = this._createDom()
    this.$dom.replaceWith($newDom)
    this.$dom = $newDom
  }

  /**
   * @param callback: function <T>(x: number, y: number, data: T): any
   */
  onClick(callback) {
    this._listeners.push(callback)
  }

  /**
   * @param d number
   */
  setDuration(d) {
    if (typeof d !== "number" || d < 0 || Number.isNaN(d)) throw new TypeError("invalid duration: " + d)
    this._animationDuration = d
  }

  addItem(x, y, data) {
    const item = super.addItem(x, y, data)
    if (item) {
      const [xDom, yDom] = this._calcDomOffset(x, y)

      const $item = createElement("div", {
        className: GridComp.className.item,
        style: {
          transform: `translate(${xDom}px,${yDom}px)`,
        },
      }, data.$dom)

      this._domMap[y][x] = $item
      this.$dom.appendChild($item)
    }
    return item
  }

  removeItem(x, y) {
    const item = super.removeItem(x, y)
    const $item = this._domMap[y][x]
    if ($item) {
      $item.remove()
      this._domMap[y][x] = null
    }
    return item
  }

  async moveItem(sx, sy, dx, dy) {
    const item = super.moveItem(sx, sy, dx, dy)
    const $item = this._domMap[sy][sx]

    if (item && $item) {
      this._domMap[sy][sx] = null
      this._domMap[dy][dx] = $item

      const [xDom, yDom] = this._calcDomOffset(dx, dy)
      const d = this._animationDuration
      applyPropsToElement($item, {
        style: {
          transform: `translate(${xDom}px,${yDom}px)`,
          transition: `transform ${d}ms`,
        },
      })

      /**
       * 过渡动画
       */
      if (this._animationDuration) {
        await sleep(this._animationDuration + 50) // prevent firefox dancing
      }

      applyPropsToElement($item, {style: {transition: "none"}})
    }

    return item
  }

  _calcDomOffset(x, y) {
    const cellSize = this._cellSize
    return [cellSize * x + cellSize, cellSize * y + cellSize]
  }

  _createDom() {
    const rows = range(0, this._rowNum + 1, rowNum => {
      const xAxis = rowNum === 0
      const row = createElement("div", {className: GridComp.className.row})

      const cols = range(0, this._colNum + 1, colNum => {
        const yAxis = colNum === 0
        const isAxis = xAxis || yAxis
        const isEmpty = xAxis && yAxis // top left corner

        let textContent

        if (xAxis) {
          if (!yAxis) {
            textContent = colNum - 1
          }
        } else if (yAxis) {
          textContent = rowNum - 1
        }

        const isCell = !(isAxis || isEmpty)
        return createElement("div", isEmpty ? null: {
          className: isAxis ? GridComp.className.axis: GridComp.className.cell,
          tabIndex: isCell ? -1: null,
          "data-pos": isCell ? `${colNum - 1}-${rowNum - 1}`: null,
        }, textContent)
      })

      row.append(...cols)
      return row
    })

    return createElement("div", {
        className: GridComp.className.wrapper,
        style: {"--cellSize": this._cellSize + "px"},
      },
      createElement("div", {
          className: GridComp.className.grid,
          onclick: ({target}) => {
            const $el = findAscent(target, it => it.classList.contains(GridComp.className.cell))
            if ($el && $el.dataset.pos) {
              const [x, y] = $el.dataset.pos.split("-").map(it => +it)
              const item = this.getItem(x, y)
              forEachRight(this._listeners, listener => {
                listener(x, y, item)
              })
            }
          },
        },
        ...rows))
  }
}

