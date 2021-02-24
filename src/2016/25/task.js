class Tree {
  static buildBinaryTreeUtil(arr, ITree = Tree) {
    function buildTree(start = 0, end = arr.length - 1) {
      if (start > end) return null
      const mid = Math.floor((start + end) / 2)
      const tree = new ITree(arr[mid])
      const subtrees = [buildTree(start, mid - 1), buildTree(mid + 1, end)]
      subtrees.forEach(n => n ? tree.addChild(n) : void 0)
      return tree
    }
    return buildTree()
  }

  static get TRAVERSAL_ORDER() {
    return {PRE: "0", POST: "1"}
  }

  id
  data
  parent
  subtrees

  constructor(data) {
    this.id = createUuid()
    this.data = data
    this.parent = null
    this.subtrees = []
  }

  isValidTree(t) {
    return t instanceof Tree
  }

  addChild(node) {
    if (!this.isValidTree(node)) {
      throw new TypeError("Invalid node ", node)
    }
    this.subtrees.push(node)
    node.setParent(this)
  }

  removeChild(id) {
    const node = removeFromArr(this.subtrees, it => it.id === id, true)
    if (node) {
      node.setParent(null)
    }
    return node
  }

  setParent(node) {
    if (node !== null && !this.isValidTree(node)) {
      throw new TypeError("Invalid node ", node)
    }
    this.parent = node
  }

  getLevel() {
    return this.parent ? this.parent.getLevel() + 1 : 0
  }

  findNode(id) {
    if (this.id === id) return this
    for (const t of this.subtrees) {
      const res = t.findNode(id)
      if (res) return res
    }
    return null
  }

  traverse(order, onVisit) {
    switch(order) {
      case Tree.TRAVERSAL_ORDER.PRE:
        return this.preorderTraverse(onVisit)
      case Tree.TRAVERSAL_ORDER.POST:
        return this.postorderTraverse(onVisit)
      default:
        throw new TypeError("traversal order not found: " + order)
    }
  }

  async preorderTraverse(onVisit) {
    if (onVisit) {
      const res = await onVisit(this)
      if (res === false) return false
    }
    for (const it of this.subtrees) {
      const res = await it.preorderTraverse(onVisit)
      if (res === false) return false
    }
  }

  async postorderTraverse(onVisit) {
    for (const it of this.subtrees) {
      const res = await it.postorderTraverse(onVisit)
      if (res === false) return false
    }
    if (onVisit) {
      const res = await onVisit(this)
      if (res === false) return false
    }
  }

  getData() {
    return this.data
  }

  getSubtrees() {
    return this.subtrees.slice()
  }
}

class TreeUI extends Tree {
  static get className() {
    return {
      Fold: "fold",
      Highlight: "hi",
      Identify: "tree"
    }
  }

  static createNode(id, data) {
    const res = createElement("div", {
      "data-id": id,
      title: data,
      className: TreeUI.className.Identify
    }, createElement("span", null, data))
    return res
  }

  el
  highlightedNode

  constructor(data) {
    super(data)
    this.el = TreeUI.createNode(this.id, this.getData())
    this.highlightedNode = null
    this.updatePadding()
  }

  isValidTree(t) {
    return t instanceof TreeUI
  }

  addChild(node) {
    super.addChild(node)
    this.el.appendChild(node.el)
  }

  removeChild(id) {
    const node = super.removeChild(id)
    if (node) {
      if (this.highlightedNode === node) {
        this.highlightedNode = null
      }
      node.el.remove()
    }
  }

  remove() {
    if (this.parent) {
      this.parent.removeChild(this.id)
    } else {
      this.el.remove()
    }
  }

  setParent(node) {
    super.setParent(node)
    this.updatePadding()
  }

  updatePadding() {
    applyPropsToElement(this.el, {style: {"--pd": `${(this.getLevel() + 1) * 18}px`}})
    this.subtrees.forEach(it => it.updatePadding())
  }

  async traversal(order = Tree.TRAVERSAL_ORDER.PRE) {
    await this.traverse(order)
    this.highlight()
  }

  async traverse(order, onVisit) {
    await super.traverse(order, async t => {
      t.unfold(true)
      t.el.scrollIntoView({block: "start"})
      this.highlight(t)
      await sleep(300)
      return onVisit ? onVisit(t) : void 0
    })
  }

  async search(v, order) {
    let founded = false
    await this.traverse(order, t => {
      t.unfold()
      if (t.getData() === v) {
        founded = true
      }
      return !founded
    })
    if (!founded) {
      this.highlight()
      alert("没找到: " + v)
    }
  }

  /**
   * node 为当前节点或子节点, 为空则去掉高亮
   */
  highlight(node, walkdown) {
    if (this.highlightedNode) {
      this.highlightedNode.dehighlight()
      this.highlightedNode = null
    }
    if (!node) return

    node.el.classList.add(TreeUI.className.Highlight)
    this.highlightedNode = node
    if (walkdown) {
      this.subtrees.forEach(it => it.highlight(node, walkdown))
    }
  }

  /**
   * 去掉当前节点的高亮
   */
  dehighlight(el) {
    this.el.classList.remove(TreeUI.className.Highlight)
  }

  isFolded() {
    return this.el.classList.contains(TreeUI.className.Fold)
  }

  fold() {
    if (this.subtrees.length > 0) {
      this.el.classList.add(TreeUI.className.Fold)
    }
  }

  unfold(walkup) {
    this.el.classList.remove(TreeUI.className.Fold)
    if (walkup && this.parent) {
      this.parent.unfold(true)
    }
  }

  toggleFold() {
    this.el.classList.contains(TreeUI.className.Fold) ? this.unfold() : this.fold()
  }
}

function btnGroup(title, ...children) {
  return createElement("fieldset", {className: "btnGroup"}, createElement("legend", null, title), ...children)
}

/**
 * 可视化遍历按钮组件
 */
function initTraversalVisualizationControls(treeUi) {
  return btnGroup(
    "可视化遍历",
    ...Object.keys(Tree.TRAVERSAL_ORDER).map(k =>
      createElement("button", {onclick: () => treeUi.traversal(Tree.TRAVERSAL_ORDER[k])}, `${capitalize(k)}order`))
  )
}

/**
 * 搜索按钮组件
 */
function initSearchVisualizationControls(treeUi) {
  const $searchOrderOptions = createElement("select", {value: Tree.TRAVERSAL_ORDER.PRE},
    ...Object.keys(Tree.TRAVERSAL_ORDER).map(k => 
      createElement("option", {value: Tree.TRAVERSAL_ORDER[k]}, `${capitalize(k)}order`)))

  const $searchInput = createElement("input", {
    type: "search",
    placeholder: "输入你想搜索的值",
    onkeyup(ev) {
      $searchBtn.disabled = $searchInput.value.trim().length === 0
      if (ev.key === "Enter") {
        search()
      }
    }
  })

  const $searchBtn = createElement("button", {disabled: true, onclick: search}, "Search")

  function search() {
    const v = $searchInput.value.trim()
    if (v.length > 0) {
      $searchInput.value = ""
      $searchBtn.disabled = true
      treeUi.search(v, $searchOrderOptions.value)
    }
  }

  return btnGroup("搜索", $searchOrderOptions, $searchInput, $searchBtn)
}

/**
 * 增加删除节点按钮组件
 */
function initMutationControls(treeUi, appState) {
  let canAdd = false

  const $removeBtn = createElement("button", {disabled: true, onclick: removeNode}, "Remove")
  const $addBtn = createElement("button", {disabled: true, onclick: addNode}, "Add")
  const $addInput = createElement("input", {
    placeholder: "Add a new item",
    onkeyup(ev) {
      revalidateCanAdd()
      if (ev.key === "Enter") {
        if (!canAdd && !appState.selectedNode) {
          alert("请选择一个节点")
          return
        }
        addNode()
      }
    }
  })

  appState.$on("selectdNodeChange", node => {
    $removeBtn.disabled = !node
    revalidateCanAdd()
  })

  return btnGroup("增删", $removeBtn, $addInput, $addBtn)

  function revalidateCanAdd() {
    const v = $addInput.value.trim()
    const isValid = appState.selectedNode !== null && v.length > 0
    $addBtn.disabled = !isValid
    canAdd = isValid
  }

  function addNode() {
    if (canAdd) {
      appState.selectedNode.addChild(new TreeUI($addInput.value.trim()))
      $addInput.value = ""
      $addBtn.disabled = true
    }
  }

  function removeNode() {
    if (appState.selectedNode) {
      appState.selectedNode.remove()
      appState.selectedNode = null
      $removeBtn.disabled = true
    }
  }
}

/**
 * 点击选中功能
 */
function initSelectFunctionality(treeUi, appState) {
  treeUi.el.addEventListener("click", ev => {
    const el = findParent(ev.target, it => it && it.classList && it.classList.contains(TreeUI.className.Identify))
    const id = el && el.dataset.id
    if (el && id) {
      appState.selectedNode = treeUi.findNode(id)
      treeUi.highlight(appState.selectedNode, true)
      appState.$emit("selectdNodeChange", appState.selectedNode)
    }
  })
}

/**
 * 点击折叠/展开功能
 */
function initToggleFunctionality(appState) {
  appState.$on("selectdNodeChange", node => {
    if (node) node.toggleFold()
  })
}

function run() {
  const $root = $("root")
  const $controlsGroup = $("controlsGroup")
  const listeners = {
    selectdNodeChange: []
  }
  const appState = {
    selectedNode: null,
    $on(eventName, callback) {
      listeners[eventName].push(callback)
    },
    $emit(eventName, payload) {
      listeners[eventName].forEach(listener => listener(payload))
    }
  }

  const treeUi = Tree.buildBinaryTreeUtil(strRange(0, 15), TreeUI)
  treeUi.addChild(Tree.buildBinaryTreeUtil(strRange(3, 5), TreeUI))
  treeUi.addChild(Tree.buildBinaryTreeUtil(strRange(8, 13), TreeUI))

  $root.appendChild(treeUi.el)
  $controlsGroup.append(
    initMutationControls(treeUi, appState),
    initTraversalVisualizationControls(treeUi),
    initSearchVisualizationControls(treeUi),
  )

  initSelectFunctionality(treeUi, appState)
  initToggleFunctionality(appState)


  function strRange (start, end) {
    return range(start, end, it => it.toString())
  }
}

run()


/********************************
 *
 *          uilities
 *
 ********************************
 */
function $(str) {
  return document.getElementById(str)
}

function createElement (type, props, ...children) {
  const res = document.createElement(type)
  if (props) applyPropsToElement(res, props)
  for (const child of children) {
    if (typeof child !== "string") res.appendChild(child)
    else res.appendChild(document.createTextNode(child))
  }
  return res
}

function applyPropsToElement(el, props) {
  Object.keys(props).forEach(k => {
    const value = props[k]
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
      return;
    }
    el[k] = props[k]
  })
}

function findParent(child, parentOrMatchFn) {
  let node = child.parentNode
  let _matchFn = typeof parentOrMatchFn === "function" ? parentOrMatchFn : it => it === parentOrMatchFn
  while (node !== null) {
    if (_matchFn(node)) {
      return node
    }
    node = node.parentNode
  }
  return null
}

function capitalize(str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase()
}

function sleep(t) {
  return new Promise(r => setTimeout(r, t))
}

function range(start, end, mapFn = it => it) {
  return Array.from({length: end - start}).map((_, i) => mapFn(i + start, i))
}

function removeFromArr(arr, matchFn, once) {
  let res = []
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    if (matchFn(arr[i])) {
      res.push(...arr.splice(i, 1))
      if (once) return res[0]
    }
  }
}

function createUuid() {
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

