class Tree {
  static buildBinaryTreeUtil(arr, ITree = Tree) {
    function buildTree(start = 0, end = arr.length - 1) {
      if (start > end) return null
      const mid = Math.floor((start + end) / 2)
      const tree = new ITree(arr[mid])

      const leftTree = buildTree(start, mid - 1)
      const rightTree = buildTree(mid + 1, end)
      if (leftTree) tree.addChild(leftTree)
      if (rightTree) tree.addChild(rightTree)
      return tree
    }
    return buildTree()
  }

  static get TRAVERSAL_ORDER() {
    return {PRE: 0, POST: 1, IN: 2}
  }

  constructor(data, subtrees) {
    this.data = data
    this.subtrees = subtrees ? subtrees.filter(this.isValidTree) : []
  }

  isValidTree(t) {
    return t instanceof Tree
  }

  addChild(node) {
    if (!this.isValidTree(node)) {
      throw new TypeError("Invalid node ", node)
    }
    this.subtrees.push(node)
  }

  traverse(order, onVisit) {
    switch(order) {
      case Tree.TRAVERSAL_ORDER.IN:
        return this.inorderTraverse(onVisit)
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
      await onVisit(this)
    }
    for (const it of this.subtrees) {
      await it.preorderTraverse(onVisit)
    }
  }

  async postorderTraverse(onVisit) {
    for (const it of this.subtrees) {
      await it.postorderTraverse(onVisit)
    }
    if (onVisit) {
      await onVisit(this)
    }
  }

  async inorderTraverse(onVisit) {
    if (this.subtrees.length > 2) {
      throw new TypeError("This is not a valid binary tree!")
    }

    const [left, right] = this.subtrees

    if (left) {
      await left.inorderTraverse(onVisit)
    }

    if (onVisit) {
      await onVisit(this)
    }

    if (right) {
      await right.inorderTraverse(onVisit)
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
  static createNode(data, children = []) {
    const res = createElement("div", {
      title: data,
      className: "tree",
    }, data, ...children)
    return res
  }

  constructor(data, subtrees) {
    super(data, subtrees)
    this.el = TreeUI.createNode(this.getData(), this.getSubtrees())
    this.highlightedNode = null
  }

  isValidTree(t) {
    return t instanceof TreeUI
  }

  addChild(node) {
    super.addChild(node)
    this.el.appendChild(node.el)
  }

  el
  highlightedNode

  async traverse(order = Tree.TRAVERSAL_ORDER.IN) {
    await super.traverse(order, t => {
      this.highlight(t)
      return sleep(300)
    })
    this.highlight()
  }

  /**
   * node 为当前节点或子节点
   */
  highlight(node) {
    if (this.highlightedNode) {
      this.highlightedNode.dehighlight()
      this.highlightedNode = null
    }
    if (!node) return

    node.el.classList.add("hi")
    this.highlightedNode = node
  }

  /**
   * 去掉当前节点的高亮
   */
  dehighlight() {
    this.el.classList.remove("hi")
  }
}

function run() {
  const $root = $("root")
  const $preorderBtn = $("pre")
  const $postorderBtn = $("post")
  const $inorderBtn = $("in")

  const ui = Tree.buildBinaryTreeUtil(range(0, 15), TreeUI)
  $root.appendChild(ui.el)

  $preorderBtn.addEventListener("click", () => {
    ui.traverse(Tree.TRAVERSAL_ORDER.PRE)
  })
  $postorderBtn.addEventListener("click", () => {
    ui.traverse(Tree.TRAVERSAL_ORDER.POST)
  })
  $inorderBtn.addEventListener("click", () => {
    ui.traverse(Tree.TRAVERSAL_ORDER.IN)
  })
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
  if (props) Object.assign(res, props)
  for (const child of children) {
    if (typeof child !== "string") res.appendChild(child)
    else res.appendChild(document.createTextNode(child))
  }
  return res
}

function sleep(t) {
  return new Promise(r => setTimeout(r, t))
}

function range(start, end, mapFn = it => it) {
  return Array.from({length: end - start}).map((_, i) => mapFn(i + start, i))
}

