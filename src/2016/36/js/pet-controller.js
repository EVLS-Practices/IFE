import {WallComp as Wall} from "./wall.js"
import {eDist, mDist, removeFromArr} from "./utils.js"
import Console from "./console.js"

export class PetController {
  static get dir() {
    return {
      north: [0, -1],
      south: [0, 1],
      west: [-1, 0],
      east: [1, 0],
    }
  }

  get isLocked() {
    return this._isLocked
  }

  _face
  _grid
  _pos
  _isLocked

  constructor(grid, face, pos) {
    this._grid = grid
    this._face = face
    this._isLocked = false
    this._pos = pos
  }

  setPos(x, y) {
    this._pos = {x, y}
  }

  go = step => {
    if (this.isLocked) return
    let _step = this._getStep(step)
    return this._translate(_step)
  }

  turnLeft = async () => {
    if (this.isLocked) return
    this._lock()
    await this._face.turnLeft()
    this._unlock()
  }

  turnRight = async () => {
    if (this.isLocked) return
    this._lock()
    await this._face.turnRight()
    this._unlock()
  }

  turnBackward = async () => {
    if (this.isLocked) return
    this._lock()
    await this._face.turnBackward()
    this._unlock()
  }

  turnWest = async () => {
    if (this.isLocked) return
    this._lock()
    await this._face.turnWest()
    this._unlock()
  }

  turnEast = async () => {
    if (this.isLocked) return
    this._lock()
    await this._face.turnEast()
    this._unlock()
  }

  turnSouth = async () => {
    if (this.isLocked) return
    this._lock()
    await this._face.turnSouth()
    this._unlock()
  }

  turnNorth = async () => {
    if (this.isLocked) return
    this._lock()
    await this._face.turnNorth()
    this._unlock()
  }

  /**
   * 向西平移
   */
  translateWest = step => {
    if (this.isLocked) return
    let _step = this._getStep(step)
    return this._translate(_step, PetController.dir.west)
  }

  /**
   * 向东平移
   */
  translateEast = step => {
    if (this.isLocked) return
    let _step = this._getStep(step)
    return this._translate(_step, PetController.dir.east)
  }

  /**
   * 向北平移
   */
  translateNorth = step => {
    if (this.isLocked) return
    let _step = this._getStep(step)
    return this._translate(_step, PetController.dir.north)
  }

  /**
   * 向南平移
   */
  translateSouth = step => {
    if (this.isLocked) return
    let _step = this._getStep(step)
    return this._translate(_step, PetController.dir.south)
  }

  /**
   * 向西移动
   */
  moveWest = async step => {
    if (this.isLocked) return
    await this.turnWest()
    return this.go(step)
  }

  /**
   * 向东移动
   */
  moveEast = async step => {
    if (this.isLocked) return
    await this.turnEast()
    return this.go(step)
  }

  /**
   * 向北移动
   */
  moveNorth = async step => {
    if (this.isLocked) return
    await this.turnNorth()
    return this.go(step)
  }

  /**
   * 向南移动
   */
  moveSouth = async step => {
    if (this.isLocked) return
    await this.turnSouth()
    return this.go(step)
  }

  /**
   * 建一面墙
   */
  build = () => {
    if (this.isLocked) return
    this._lock()
    if (this._canMove()) {
      const [dx, dy] = this._getDirPos()
      this._grid.addItem(dx, dy, new Wall())
    } else {
      Console.error("建墙失败")
    }
    this._unlock()
  }

  /**
   * 拆一面墙
   */
  demolish = () => {
    if (this.isLocked) return
    this._lock()
    if (this._canMove()) {
      Console.error("拆墙失败")
    } else {
      this._grid.removeItem(...this._getDirPos())
    }
    this._unlock()
  }

  buildOrDemolish = () => {
    return this._canMove() ? this.build() : this.demolish()
  }

  /**
   * 刷一面墙
   */
  brushWall = color => {
    if (this.isLocked) return
    this._lock()
    const [x, y] = this._getDirPos()
    const item = this._grid.getItem(x, y)
    if (typeof color === "string" && item && item.data instanceof Wall) {
      item.data.brushColor(color)
    } else {
      Console.error("刷墙失败")
    }
    this._unlock()
  }

  /**
   * 移动到 dx, dy 的位置
   */
  moveTo = async (dx, dy) => {
    if (this.isLocked) return
    this._lock()
    dx = +dx
    dy = +dy
    if (!this._grid.isValidPos(dx, dy)) {
      Console.error(`非法坐标 {x: ${dx}, y: ${dy}}`)
      this._unlock()
      return
    }

    const dirs = Object.entries(PetController.dir)
    const sx = this._pos.x
    const sy = this._pos.y

    const openSet = [
      {
        x: sx, y: sy,
        f: 0, g: 0, h: 0,
        vh: eDist(sx, sy, dx, dy),
      },
    ]
    const closedSet = []

    let lastCheckedNode
    let founded = false
    while (openSet.length > 0) {
      let idxLowF = 0
      openSet.forEach(({f, g, vh}, i) => {
        /**
         * 找到最小F 也就是离终点最近的点
         */
        if (f < openSet[idxLowF].f) {
          idxLowF = i
        }

        /**
         * 获取看起来比较近的路线（实际上一样）但是偏向 y 轴移动
         */
        const compare = openSet[idxLowF]
        if (f === compare.f) {
          if (g > compare.g || (g === compare.g && vh < compare.vh)) {
            idxLowF = i
          }
        }
      })

      const current = openSet[idxLowF]
      lastCheckedNode = current

      if (current.x === dx && current.y === dy) {
        Console.log(`找到去往 {x: ${dx}, y: ${dy}} 的路啦！`)
        founded = true
        break
      }

      /**
       * 最优路径存起来
       */
      removeFromArr(openSet, current)
      closedSet.push(current)

      /**
       * 把周围的格子放到队列里
       */
      dirs.forEach(([name, dir]) => {
        const x = current.x + dir[0]
        const y = current.y + dir[1]
        if (!this._grid.isValidPos(x, y)) return
        const itemAtDir = this._grid.getItem(x, y)

        /**
         * 已经在最优路径里或是墙 返回
         */
        const isWall = (itemAtDir && itemAtDir.data instanceof Wall)
        if (isWall || closedSet.find(it => it.x === x && it.y === y)) {
          return
        }

        /**
         * 当前点到该点的距离
         */
        const tmpG = current.g + mDist(current.x, current.y, x, y)

        const neighbor = {dir: name, x, y, g: tmpG, previous: current}
        neighbor.h = mDist(x, y, dx, dy)
        neighbor.vh = eDist(x, y, dx, dy)
        neighbor.f = neighbor.g + neighbor.h

        const neighborInQueue = openSet.find(it => it.x === x && it.y === y)
        if (!neighborInQueue) {
          openSet.push(neighbor)
        } else if (tmpG < neighborInQueue.g) {
          /**
           * 路径比上次找到的要近
           */
          Object.assign(neighborInQueue, neighbor)
        }
      })
    }

    if (founded) {
      const path = [lastCheckedNode]
      let tmp = lastCheckedNode
      while (tmp.previous) {
        if (tmp.previous.x === sx && tmp.previous.y === sy) break
        path.unshift(tmp.previous)
        tmp = tmp.previous
      }
      this._unlock()
      for (const {dir} of path) {
        switch (dir) {
          case "east":
            await this.moveEast()
            break
          case "north":
            await this.moveNorth()
            break
          case "south":
            await this.moveSouth()
            break
          case "west":
            await this.moveWest()
            break
        }
      }
    } else {
      Console.error(`找不到去往 {x: ${dx}, y: ${dy}} 的路径`)
      this._unlock()
    }
  }

  /**
   * @param step 移动的步数
   * @param dir [x, y] 每次的步进方向
   */
  async _translate(step, dir) {
    if (this.isLocked) return
    this._lock()
    const canNotMove = !this._canMove(dir)
    if (step < 1 || canNotMove) {
      if (step > 0) {
        Console.error(`前方有障碍，无法朝该方向移动`)
      }
      this._unlock()
      return
    }

    const [dx, dy] = this._getDirPos(dir)
    this._pos = await this._grid.moveItem(this._pos.x, this._pos.y, dx, dy)
    this._unlock()
    await this._translate(step - 1, dir)
  }

  /**
   * 返回合法步数
   */
  _getStep(step) {
    step = +step
    return step && step > 0 ? step: 1
  }

  /**
   * 是否可以向某个方向移动
   */
  _canMove(dir) {
    const [x, y] = this._getDirPos(dir)
    return !this._grid.hasItem(x, y)
  }

  /**
   * 根据当前坐标返回方向（dir）格子的坐标
   */
  _getDirPos(dir) {
    let _dir = dir || PetController.dir[this._face.orientation.toLowerCase()]
    return [
      this._pos.x + _dir[0],
      this._pos.y + _dir[1],
    ]
  }

  _lock() {
    this._isLocked = true
  }

  _unlock() {
    this._isLocked = false
  }
}
