const $ = str => document.getElementById(str)
const isNil = any => typeof any === "undefined" || any === null

function createElement(type, props, ...children) {
  const isFrag = type === "frag"
  const res = isFrag ? document.createDocumentFragment(): document.createElement(type)
  if (!isFrag && props) applyPropsToElement(res, props)
  for (const child of children) {
    if (isNil(child)) continue
    switch (typeof child) {
      case "string":
      case "number":
      case "boolean":
        res.appendChild(document.createTextNode(child))
        break
      default:
        res.appendChild(child)
    }
  }
  return res
}

function applyPropsToElement(el, props) {
  Object.keys(props).forEach(k => {
    const value = props[k]
    if (isNil(value)) return
    if (k === "style" && typeof value === "object") {
      return Object.keys(value).forEach(k => {
        if (k.startsWith("--")) {
          el.style.setProperty(k, value[k])
        } else {
          el.style[k] = value[k]
        }
      })
    }
    if (k.startsWith("data-")) {
      const key = k.replace("data-", "")
      el.dataset[key] = value
      return
    }
    el[k] = props[k]
  })
}

function swapElements(obj1, obj2) {
  const parent2 = obj2.parentNode;
  const next2 = obj2.nextSibling;
  if (next2 === obj1) {
    parent2.insertBefore(obj1, obj2);
  } else {
    obj1.parentNode.insertBefore(obj2, obj1);

    if (next2) {
      parent2.insertBefore(obj1, next2);
    } else {
      parent2.appendChild(obj1);
    }
  }
}


const sleep = t => new Promise(r => setTimeout(r, t))

const generateRandomNums = (min, max, size) => {
  const res = []
  for (let i = 0; i < size; i += 1) {
    res.push(Math.floor(Math.random() * (max - min + 1) + min))
  }
  return res
}


class Queue {
  static get color() {
    return {
      sorted: "orange",
      pivot: "yellow",
      scanned: "darkorchid",
      current: "crimson",
      store: "mediumseagreen"
    }
  }

  _LIMIT = 20
  _MIN = 10
  _MAX = 100

  $dom
  _items
  _duration

  _locked

  constructor(duration) {
    this._items = []
    this._locked = false
    this._createDom()
    this._duration = duration || 250
  }

  _createDom() {
    this.$dom = createElement("div", {
      className: "queue"
    })
  }

  _createItem(num) {
    if (this._locked) return null
    if (!this._validate(num)) return null
    if (this._items.length >= this._LIMIT) {
      alert(`超出限制个数(${this._LIMIT})`)
      return null;
    }

    const color = ((1 - num / 100) * 200).toFixed(2)
    const item = {
      value: num,
      $dom: createElement("div", {
        title: num,
        className: "item",
        style: {
          height: `calc(${num}% - 20px)`,
          '--color': `rgb(${color}, ${color}, ${color})`
        },
        onclick: () => {
          const idx = this._items.findIndex(it => it.$dom === item.$dom)
          if (idx > -1) {
            alert(this._items[idx].value)
            this._destroyItem(idx)
          }
        }
      })
    }
    return item
  }

  _destroyItem(idx) {
    if (this._locked) return
    const item = this._items.splice(idx, 1)[0]
    if (item) {
      item.$dom.remove()
    }
  }

  _validate(any) {
    if (typeof any !== "number" || Number.isNaN(any)) {
      alert("请输入数字")
      return false
    }
    if (any < this._MIN) {
      alert(`数字太小，至少是${this._MIN}`)
      return false
    }
    if (any > this._MAX) {
      alert(`数字太大，至多是${this._MAX}`)
      return false
    }
    return true
  }

  _swap(arr, i, j) {
    let tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
    

    tmp = this._items[i]
    this._items[i] = this._items[j]
    this._items[j] = tmp

    swapElements(this._items[i].$dom, this._items[j].$dom)
    return sleep(this._duration)
  }

  _setPivot(i) {
    this._items[i].$dom.classList.add("pivot")
    return this._items[i].value
  }

  _setSorted(i) {
    this._items[i].$dom.classList.add("sorted")
  }

  async _qsort(low, high) {
    if (low >= high) return
    const arr = this.raw()

    const pivot = this._setPivot(high)
    let i = low

    for (let j = low; j < high; j += 1) {
      this._items[j].$dom.classList.add("current")
      await sleep(this._duration)
      if (arr[j] < pivot) {
        await this._swap(arr, i, j)
        this._items[i].$dom.classList.add("store")
        this._items[i].$dom.classList.remove("current")
        i += 1
      } else {
        this._items[j].$dom.classList.add("scanned")
        await sleep(this._duration)
        this._items[j].$dom.classList.remove("current")
      }
    }

    await this._swap(arr, i, high)
    this._setSorted(i)

    for (let j = low; j <= high; j += 1) {
      this._items[j].$dom.classList.remove("pivot")
      this._items[j].$dom.classList.remove("store")
      this._items[j].$dom.classList.remove("scanned")
    }

    await this._qsort(low, i - 1)
    this._setSorted(low)
    await this._qsort(i + 1, high)
    this._setSorted(high)
    await sleep(this._duration)
  }

  async sort() {
    if (this._locked) return
    this._locked = true
    await this._qsort(0, this._items.length - 1)
    this._items.forEach(it => it.$dom.classList.remove("sorted"))
    this._locked = false
  }

  push(num) {
    const item = this._createItem(num)
    if (item) {
      this.$dom.appendChild(item.$dom)
      this._items.push(item)
    }
  }

  pop() {
    this._destroyItem(this.items.length - 1)
  }

  unshift(num) {
    const item = this._createItem(num)
    if (item) {
      this.$dom.prepend(item.$dom)
      this._items.unshift(item)
    }
  }

  shift() {
    this._destroyItem(0)
  }

  empty() {
    if (this._locked) return
    this.$dom.innerHTML = ""
    this._items = []
  }

  random() {
    if (this._locked) return
    this.empty()
    this._items = generateRandomNums(this._MIN, this._MAX, this._LIMIT)
      .map(num => this._createItem(num))
    this._items.forEach(({$dom}) => {
      this.$dom.appendChild($dom)
    })
  }

  setDuration(d) {
    d = +d
    if (typeof d !== "number" || Number.isNaN(d)) {
      throw new TypeError("Invalid duration: " + d)
    }
    this._duration = d
  }

  setLimit(limit) {
    limit = +limit
    if (typeof limit !== "number" || Number.isNaN(limit)) {
      throw new TypeError("Invalid limit: " + limit)
    }
    this._LIMIT = limit
  }

  raw() {
    return this._items.map(it => it.value)
  }

  serialize() {
    return this.raw().join(",")
  }
}

const queue = new Queue()

$("root").appendChild(queue.$dom)
const $input = $("input")
const $leftInBtn = $("leftIn")
const $rightInBtn = $("rightIn")
const $leftOutBtn = $("leftOut")
const $rightOutBtn = $("rightOut")
const $sortBtn = $("sort")
const $emtBtn = $("empty")
const $randomBtn = $("random")
const $speed = $("speed")
const $limit = $("limit")

$input.addEventListener("keydown", ev => {
  if (ev.key === "Enter") {
    queue.push(ev.target.valueAsNumber)
  }
})
$leftInBtn.addEventListener("click", () => {
  queue.unshift($input.valueAsNumber)
})
$rightInBtn.addEventListener("click", () => {
  queue.push($input.valueAsNumber)
}) 
$leftOutBtn.addEventListener("click", () => {
  queue.shift()
})
$rightOutBtn.addEventListener("click", () => {
  queue.pop()
})
$sortBtn.addEventListener("click", () => {
  queue.sort()
})
$emtBtn.addEventListener("click", () => {
  queue.empty()
})
$randomBtn.addEventListener("click", () => {
  queue.random()
})
$speed.addEventListener("change", () => {
  queue.setDuration($speed.value)
})
$limit.addEventListener("change", () => {
  queue.setLimit($limit.value)
})

queue.setDuration($speed.value)
queue.setLimit($limit.value)
queue.random()
