const $ = str => document.getElementById(str)
const $c = (c, t = "div") => {
  const res = document.createElement(t)
  res.title = c
  res.className = "item"
  res.style.height = `calc(${c}% - 20px)`
  const cc = (1 - c / 100) * 200
  res.style.backgroundColor = `rgb(${cc}, ${cc}, ${cc})`
  return res
}

const sleep = t => new Promise(r => setTimeout(r, t))

const generateRandomItems = (min, max, size) => {
  const res = []
  for (let i = 0; i < size; i += 1) {
    res.push(Math.floor(Math.random() * (max - min + 1) + min))
  }
  return res
}

const LIMIT = 60
const MIN = 10
const MAX = 100

const Queue = {
  $container: $("queue"),
  items: [],
  async render(items = this.items, delay, transformer = it => it) {
    if (delay) {
      await sleep(delay)
    }
    this.$container.innerHTML = ""
    this.$container.append(...items.map((num, i) => transformer(this.create(num, i), i)))
  },
  create(num, i) {
    const $el = $c(num)
    $el.i = i
    $el.addEventListener("click", () => {
      this.remove($el)
    })
    return $el
  },
  remove($el) {
    if (!$el || !$el.i) return;
    alert($el.title)
    const i = parseInt($el.i)
    if (!isNaN(i)) {
      this.items.splice(i, 1)
      $el.remove()
    }
  },
  validate(num) {
    if (this.size >= LIMIT) {
      alert(`超出限制个数(${LIMIT})`)
      return false;
    }
    if (num < 10) {
      alert(`数字太小，至少是${MIN}`)
      return false
    }
    if (num > 100) {
      alert(`数字太大，至多是${MAX}`)
      return false
    }
    return true
  },
  leftIn(num) {
    if (!this.validate(num)) {
      return;
    }
    this.items.unshift(num)
    this.render()
  },
  rightIn(num) {
    if (!this.validate(num)) {
      return;
    }
    this.items.push(num)
    this.render()
  },
  leftOut() {
    const num = this.items.shift()
    alert(num)
    this.render()
  },
  rightOut() {
    const num = this.items.pop()
    alert(num)
    this.render()
  },
  random() {
    this.items = generateRandomItems(MIN, MAX, 30)
    this.render()
  },
  empty() {
    this.items = []
    this.render()
  },
  async sort() {
    await this._qsort(this.items, 0, this.items.length - 1)
    this.render()
  },
  async _qsort(arr, low, high) {
    const blue = "#4966b9"
    const yellow = "#c1c32d"

    const setColor = (i, j, c1, c2) => (it, idx) => {
      if (idx === i) it.style.backgroundColor = c1
      else if (idx === j) it.style.backgroundColor = c2
      return it
    }

    const swap = async (arr, i, j) => {
      const tmp = arr[i]
      arr[i] = arr[j]
      arr[j] = tmp
      await this.render(arr, 0, setColor(i, j, yellow, blue))
    }

    const partition = async (arr, low, high) => {
      let pivot = arr[high]
      let i = low - 1

      for (let j = low; j < high; j += 1) {
        if (arr[j] < pivot) {
          i += 1
          await swap(arr, i, j)
        }
        await this.render(arr, 200, setColor(i, j, blue, yellow))
      }
      await swap(arr, i + 1, high)
      return i + 1
    }

    if (low < high) {
      const pi = await partition(arr, low, high)
      await this._qsort(arr, low, pi - 1);
      await this._qsort(arr, pi + 1, high);
    }
  }
}

Queue.random()

const $input = $("input")
const $leftInBtn = $("leftIn")
const $rightInBtn = $("rightIn")
const $leftOutBtn = $("leftOut")
const $rightOutBtn = $("rightOut")
const $sortBtn = $("sort")
const $emtBtn = $("empty")
const $randomBtn = $("random")

$leftInBtn.addEventListener("click", () => {
  if ($input.value !== void 0) {
    Queue.leftIn($input.value)
  }
})
$rightInBtn.addEventListener("click", () => {
  if ($input.value !== void 0) {
    Queue.rightIn($input.value)
  }
}) 
$leftOutBtn.addEventListener("click", () => {
  Queue.leftOut()
})
$rightOutBtn.addEventListener("click", () => {
  Queue.rightOut()
})
$sortBtn.addEventListener("click", () => {
  Queue.sort()
})
$emtBtn.addEventListener("click", () => {
  Queue.empty()
})
$randomBtn.addEventListener("click", () => {
  Queue.random()
})

