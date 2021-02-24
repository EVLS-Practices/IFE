export const generateId = (() => {
  let __Id = 0
  return () => {
    __Id += 1
    return (__Id).toString()
  }
})()

export function getInputLength(str) {
  let len = 0
  for (let i = 0; i < str.length; i += 1) {
    len += str.charCodeAt(i) > 128 ? 2 : 1
  }
  return len
}

export class Timer {
  start() {
    this.stop()
    this.id = window.setInterval(this.onTick, 1000)
  }

  stop() {
    if (this.isRunning) {
      window.clearInterval(this.id)
      this.id = null
    }
  }

  constructor(onTick) {
    this.id = null
    this.onTick = onTick
  }

  id
  onTick

  get isRunning() {
    return this.id !== null
  }
}

export function $(str) {
  return document.getElementById(str)
}

export function createElement(props, type = "div") {
  const res = document.createElement(type)
  if (props) applyPropsToElement(props, res)
  return res
}

export function applyPropsToElement(props, $el) {
  if (!$el || !props) return
  Object.keys(props).forEach(k => {
    const value = props[k]
    if (k === "style" && typeof value === "object") {
      return Object.keys(value).forEach(k => {
        if (k.startsWith("--")) {
          $el.style.setProperty(k, value[k])
        } else {
          $el.style[k] = value[k]
        }
      })
    }
    if (k.startsWith("data-")) {
      const key = k.replace("data-", "")
      $el.dataset[key] = value
      return
    }
    $el[k] = props[k]
  })
}

export function findAncestorElement(el, fn) {
  let p = el
  while (p !== null && !fn(p)) {
    p = p.parentElement
  }
  return p
}

export function cloneDeep(obj) {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch {
    console.error("unexpected circular obj", obj)
    return {}
  }
}

export function assign(src, dest) {
  Object.keys(src).forEach(k => {
    if (typeof src[k] === "object") {
      if (!dest[k]) {
        dest[k] = {}
      } else if (typeof dest[k] !== "object") {
        dest[k] = src[k]
        return
      }
      assign(src[k], dest[k])
    } else {
      dest[k] = src[k]
    }
  })
}

export function pretty(any) {
  try {
    return JSON.stringify(any, null, 2)
  } catch {
    return Object.toString.call(any)
  }
}

export function isNil(any) {
  return any === null || typeof any === "undefined"
}

export function last(arr) {
  return arr?.[arr.length - 1]
}

export function initial(arr) {
  return arr?.slice(0, arr.length - 1)
}

export function identity(a) {
  return a
}

export function sleep(t) {
  return new Promise(r => setTimeout(r, t))
}

export function forEachRight(arr, fn) {
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    if (fn(arr[i], i) === false) {
      break
    }
  }
}

export function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase()
}

export function range(start, end, mapFn = it => it) {
  return Array.from({ length: end - start }).map((_, i) => mapFn(i + start, i))
}

export function random(min = 0, max = 1) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function generateRandomItems(min, max, size) {
  const res = []
  for (let i = 0; i < size; i += 1) {
    res.push(random(min, max))
  }
  return res
}

export function qsort(arr, low = 0, high = arr.length - 1) {
  if (high <= 0) return

  function swap(arr, i, j) {
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }

  function partition(arr, low, high) {
    let pivot = arr[high]
    let i = low - 1
    for (let j = low; j < high; j += 1) {
      if (arr[j] < pivot) {
        i += 1
        swap(arr, i, j)
      }
    }
    swap(arr, i + 1, high)
    return i + 1
  }

  if (low < high) {
    const pi = partition(arr, low, high)
    qsort(arr, low, pi - 1)
    qsort(arr, pi + 1, high)
  }
}

export function newRegistry() {
  const registry = []
  return {
    add(callback) {
      registry.unshift(callback)
      return function () {
        const idx = registry.findIndex(it => it === callback)
        if (idx !== -1) {
          registry.splice(idx, 1)
        }
      }
    },
    notify(...args) {
      forEachRight(registry, function (it) {
        it(...args)
      })
    },
    removeAll() {
      registry.splice(0, registry.length)
    }
  }
}

