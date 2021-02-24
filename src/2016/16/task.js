const $ = str => document.getElementById(str)

const $inCity = $("aqi-city-input")
const $inVal = $("aqi-value-input")
const $btn = $("add-btn")
const $out = $("aqi-table")

/**
 * aqiData，存储用户输入的空气指数数据
 * 示例格式：
 * aqiData = {
 *    "北京": 90,
 *    "上海": 40
 * };
 */
var aqiData = {};

/**
 * 从用户输入中获取数据，向aqiData中增加一条数据
 * 然后渲染aqi-list列表，增加新增的数据
 */
function addAqiData() {
  const city = $inCity.value
  const value = $inVal.value
  aqiData[city] = value
}

/**
 * 渲染aqi-table表格
 */
function renderAqiList() {
  $out.innerHTML = Object
    .keys(aqiData)
    .map(k => `<tr><td>${k}</td><td>${aqiData[k]}</td><td><button id=${k}>删除</button></td></tr>`)
    .join("")
}

/**
 * 点击add-btn时的处理逻辑
 * 获取用户输入，更新数据，并进行页面呈现的更新
 */
function addBtnHandle() {
  addAqiData();
  renderAqiList();
}

/**
 * 点击各个删除按钮的时候的处理逻辑
 * 获取哪个城市数据被删，删除数据，更新表格显示
 */
function delBtnHandle(ev) {
  const target = ev.target.closest("button")
  if (!target || !target.id) return;

  delete aqiData[target.id]

  renderAqiList();
}

function init() {

  // 在这下面给add-btn绑定一个点击事件，点击时触发addBtnHandle函数
  $btn.addEventListener("click", addBtnHandle)

  // 想办法给aqi-table中的所有删除按钮绑定事件，触发delBtnHandle函数
  $out.addEventListener("click", delBtnHandle)
}

init();
