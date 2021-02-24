const $ = str => document.getElementById(str)
const $c = (c, t = "div") => {
  const res = document.createElement(t)
  res.title = c
  res.className = "item"
  res.textContent = c
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
  leftIn(num) {
    if (typeof num === "string") {
      this.items.unshift(num)
    } else {
      num.forEach(it => this.items.unshift(it))
    }
    this.render()
  },
  rightIn(num) {
    if (typeof num === "string") {
      this.items.push(num)
    } else {
      num.forEach(it => this.items.push(it))
    }
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
  search(v) {
    this.render(this.items, 0, it => {
      it.innerHTML = this._match(v, it.textContent)
      return it
    })
  },
  _match(kwd, toMatch, html = "") {
    if (!kwd || !toMatch) return html + toMatch
    
    const firstIdx = toMatch.search(kwd[0])
    if (firstIdx === -1) return this._match(kwd.slice(1), toMatch, html)

    html += `${toMatch.slice(0, firstIdx)}<b>${kwd[0]}`

    kwd = kwd.slice(1)
    toMatch = toMatch.slice(firstIdx + 1)

    while (kwd.length > 0 && toMatch.length > 0 && toMatch[0] === kwd[0]) {
      html += kwd[0]
      kwd = kwd.slice(1)
      toMatch = toMatch.slice(1)
    }

    html += "</b>"
    return this._match(kwd, toMatch, html)
  }
}

Queue.random()

const $input = $("input")
const $leftInBtn = $("leftIn")
const $rightInBtn = $("rightIn")
const $leftOutBtn = $("leftOut")
const $rightOutBtn = $("rightOut")
const $emtBtn = $("empty")
const $randomBtn = $("random")
const $search = $("search")

const SEPARATOR_REGEX = /[\n,，、\s\u3000\t]/g
const getInputValue = v => v.split(SEPARATOR_REGEX).filter(it => it.length > 0)

$leftInBtn.addEventListener("click", () => {
  const v = $input.value.trim()
  if (v) {
    Queue.leftIn(getInputValue(v))
  }
})
$rightInBtn.addEventListener("click", () => {
  const v = $input.value.trim()
  if (v) {
    Queue.rightIn(getInputValue(v))
  }
}) 
$leftOutBtn.addEventListener("click", () => {
  Queue.leftOut()
})
$rightOutBtn.addEventListener("click", () => {
  Queue.rightOut()
})
$emtBtn.addEventListener("click", () => {
  Queue.empty()
})
$randomBtn.addEventListener("click", () => {
  Queue.random()
})
$search.addEventListener("keyup", () => {
  const v = $search.value.trim()
  if (v) {
    Queue.search(v)
  } else {
    Queue.render()
  }
})
