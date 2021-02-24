export function $(str) {
  return document.getElementById(str)
}

export function createElement(type, props, ...children) {
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

export function removeAllChild(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild)
  }
}

export function applyPropsToElement(el, props) {
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

export function findAscent(child, parentOrMatchFn, onlyParent) {
  let _matchFn = typeof parentOrMatchFn === "function" ? parentOrMatchFn: it => it === parentOrMatchFn
  let node = onlyParent ? child.parentElement: child
  while (node !== null) {
    if (_matchFn(node)) {
      return node
    }
    node = node.parentElement
  }
  return null
}

export function readImage(file, width, height) {
  return new Promise(resolve => {
    const src = URL.createObjectURL(file)
    const img = createElement("img", {
      src, onload() {
        URL.revokeObjectURL(src)

        const canvas = createElement("canvas").getContext("2d")
        canvas.drawImage(img, 0, 0, width, height)
        const data = []

        for (let y = 0; y < height; y += 1) {
          data.push([])
          for (let x = 0; x < width; x += 1) {
            const [r, g, b] = canvas.getImageData(x, y, 1, 1).data
            data[y].push(`rgba(${r},${g},${b},1)`)
          }
        }

        resolve(data)
      },
    })
  })
}

export function capitalize(str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase()
}

export function sleep(t) {
  return new Promise(r => setTimeout(r, t))
}

export function range(start, end, mapFn = it => it) {
  return Array.from({length: end - start}).map((_, i) => mapFn(i + start, i))
}

export function initial(arr) {
  return arr ? arr.slice(0, arr.length - 1): null
}

export function last(arr) {
  return arr ? arr[arr.length - 1]: null
}

export function forEachRight(arr, fn, _this) {
  let __this = Object(_this || this)
  for (let i = (arr.length >>> 0) - 1; i >= 0; i -= 1) {
    const it = arr[i]
    const res = fn.call(__this, it, i, arr)
    if (res === false) {
      break
    }
  }
}

export function removeFromArr(arr, matchItemOrFn, once) {
  let res = []
  let _matchFn = typeof matchItemOrFn === "function" ? matchItemOrFn: it => it === matchItemOrFn
  forEachRight(arr, (it, i) => {
    if (_matchFn(it)) {
      res.push(...arr.splice(i, 1))
      if (once) return false
    }
  })
  return once ? res[0]: res
}

export function isNil(any) {
  return typeof any === "undefined" || any === null
}

export function createUuid() {
  const s = []
  const hexDigits = "0123456789abcdef"
  for (let i = 0; i < 36; i += 1) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = "4"
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = "-"
  return s.join("")
}

export function rand(min, max) {
  return Math.random() * (max - min) + min
}

/**
 * 欧几里德距离
 */
export function eDist(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

/**
 * 曼哈顿距离
 */
export function mDist(x1, y1, x2, y2) {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1)
}

export function getFromStorage(key) {
  return JSON.parse(localStorage.getItem(key))
}

export function saveToStorage(key, val) {
  const valType = typeof val
  if (valType !== "undefined" && valType !== "function") {
    localStorage.setItem(key, JSON.stringify(val))
  }
}
