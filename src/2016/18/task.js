const $ = str => document.getElementById(str)
const $c = (c, t = "div") => {
  const res = document.createElement(t)
  res.textContent = c
  res.className = "item"
  return res
}

const Queue = {
  $container: $("queue"),
  $ph: null,
  $pt: null,
  remove($el) {
    if (!$el) return;
    if ($el === this.$ph) {
      this.$ph = this.$ph.nextElementSibling
    } else if ($el === this.$pt) {
      this.$pt = this.$pt.previousElementSibling
    }
    alert($el.textContent)
    $el.remove()
  },
  create(num) {
    const $el = $c(num)
    $el.addEventListener("click", () => {
      this.remove($el)
    })
    return $el
  },
  leftIn(num) {
    const $el = this.create(num)
    this.$ph = $el
    this.$container.prepend($el)
  },
  rightIn(num) {
    const $el = this.create(num)
    this.$pt = $el
    this.$container.append($el)
  },
  leftOut() {
    this.remove(this.$ph)
  },
  rightOut() {
    this.remove(this.$pt)
  }
}

const $input = $("input")
const $leftInBtn = $("leftIn")
const $rightInBtn = $("rightIn")
const $leftOutBtn = $("leftOut")
const $rightOutBtn = $("rightOut")


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
