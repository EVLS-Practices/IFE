export const commands = {
  go: {
    id: "GO $NUM",
    pattern: /^GO\s?(\d+)?$/i,
    desc: "向前移动指定（$NUM）格数（默认 1 格）",
  },

  turnLeft: {
    id: "TUN LEF",
    pattern: /^TUN\sLEF$/i,
    desc: "逆时针旋转 90 deg",
  },

  turnRight: {
    id: "TUN RIG",
    pattern: /^TUN\sRIG$/i,
    desc: "顺时针旋转 90 deg",
  },

  turnBackward: {
    id: "TUN BAC",
    pattern: /^TUN\sBAC$/i,
    desc: "旋转 180 deg",
  },

  translateWest: {
    id: "TRA LEF $NUM",
    pattern: /^TRA\sLEF\s?(\d+)?$/i,
    desc: "向西移动指定（$NUM）格数（默认 1 格），方向不变",
  },

  translateEast: {
    id: "TRA RIG $NUM",
    pattern: /^TRA\sRIG\s?(\d+)?$/i,
    desc: "向东移动指定（$NUM）格数（默认 1 格），方向不变",
  },

  translateNorth: {
    id: "TRA TOP $NUM",
    pattern: /^TRA\sTOP\s?(\d+)?$/i,
    desc: "向北移动指定（$NUM）格数（默认 1 格），方向不变",
  },

  translateSouth: {
    id: "TRA BOT $NUM",
    pattern: /^TRA\sBOT\s?(\d+)?$/i,
    desc: "向南移动指定（$NUM）格数（默认 1 格），方向不变",
  },

  moveWest: {
    id: "MOV LEF $NUM",
    pattern: /^MOV\sLEF\s?(\d+)?$/i,
    desc: "向西移动指定（$NUM）格数（默认 1 格）",
  },

  moveEast: {
    id: "MOV RIG $NUM",
    pattern: /^MOV\sRIG\s?(\d+)?$/i,
    desc: "向东移动指定（$NUM）格数（默认 1 格）",
  },

  moveNorth: {
    id: "MOV TOP $NUM",
    pattern: /^MOV\sTOP\s?(\d+)?$/i,
    desc: "向北移动指定（$NUM）格数（默认 1 格）",
  },

  moveSouth: {
    id: "MOV BOT $NUM",
    pattern: /^MOV\sBOT\s?(\d+)?$/i,
    desc: "向南移动指定（$NUM）格数（默认 1 格）",
  },

  build: {
    id: "BUILD",
    pattern: /^BUILD$/i,
    desc: "朝面对的方向前修建一格墙壁",
  },

  brushWall: {
    id: "BRU $COLOR",
    pattern: /^BRU\s?(([a-zA-Z]+)|(#[0-9a-fA-F]{3})|(#[0-9a-fA-F]{6})|(rgba?\(((25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,\s*?){2}(25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,?\s*([01]\.?\d*?)?\)))$/i,
    desc: "如果面对方向有紧相邻的墙，给该墙上 $COLOR (hex) 颜色",
  },

  moveTo: {
    id: "MOV TO $X, $Y",
    pattern: /^MOV\sTO\s(\d+),\s?(\d+)$/i,
    desc: "从当前位置移动到坐标为 $X，$Y",
  }
}

