const $ = str => document.getElementById(str)
const $$ = str => document.querySelector(str)

const $graTime = $("form-gra-time")
const $citySelect = $("city-select")
const $chartWrap = $$(".aqi-chart-wrap")

/* 数据格式演示
var aqiSourceData = {
  "北京": {
    "2016-01-01": 10,
    "2016-01-02": 10,
    "2016-01-03": 10,
    "2016-01-04": 10
  }
};
*/

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
  var y = dat.getFullYear();
  var m = dat.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = dat.getDate();
  d = d < 10 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
  var returnData = {};
  var dat = new Date("2016-01-01");
  var datStr = ''
  for (var i = 1; i < 92; i++) {
    datStr = getDateStr(dat);
    returnData[datStr] = Math.ceil(Math.random() * seed);
    dat.setDate(dat.getDate() + 1);
  }
  return returnData;
}

var aqiSourceData = {
  "北京": randomBuildData(500),
  "上海": randomBuildData(300),
  "广州": randomBuildData(200),
  "深圳": randomBuildData(100),
  "成都": randomBuildData(300),
  "西安": randomBuildData(500),
  "福州": randomBuildData(100),
  "厦门": randomBuildData(100),
  "沈阳": randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
  nowSelectCity: "北京",
  nowGraTime: "day"
}

function getColor(q, loQ, hiQ) {
  const c = Math.floor((1 - (q - loQ) / (hiQ - loQ)) * 220)
  return `rgb(${c}, ${c}, ${c})`
}

/**
 * 渲染图表
 */
function renderChart() {
  const { nowSelectCity: city, nowGraTime: time } = pageState
  const data = chartData[city][time]
  
  const sortByQ = data.slice().sort((a, b) => a[1] - b[1])
  const loQ = sortByQ[0][1]
  const hiQ = sortByQ[sortByQ.length - 1][1]

  $chartWrap.innerHTML = data
    .map(([t, q], i) => `<div title="AQI:${q}, Time:${t} ${time}" class="${time}" style="background-color:${getColor(q, loQ, hiQ)};height:${q / hiQ * 100}%"></div>`)
    .join("")
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange(ev) {
  // 确定是否选项发生了变化 
  // 设置对应数据
  pageState.nowGraTime = ev.target.value
  // 调用图表渲染函数
  renderChart()
}

/**
 * select发生变化时的处理函数
 */
function citySelectChange(ev) {
  // 确定是否选项发生了变化 
  // 设置对应数据
  pageState.nowSelectCity = ev.target.value
  // 调用图表渲染函数
  renderChart()
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
  $graTime.querySelectorAll("[name=gra-time]").forEach(it => it.addEventListener("change", graTimeChange))
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
  // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
  $citySelect.innerHTML = Object.keys(aqiSourceData).map(it => `<option>${it}</option>`).join("")
  // 给select设置事件，当选项发生变化时调用函数citySelectChange
  $citySelect.addEventListener("change", citySelectChange)
}

/**
 * 自然月天数
 */
function daysInMonth (month, year) {
  return new Date(year, month, 0).getDate();
}

function calcMonthData(dt) {
  return Object.entries(dt.reduce((acc, [k, q]) => {
    const [year, month] = k.split("-")
    /**
     * key: month
     * value: [year, qualitySum]
     */
    return {...acc, [month]: [year, (acc[month]?.[1] || 0) + q]}
  }, {}))
    .sort((a, b) => a[0] - b[0])
    .reduce((acc, [m, [y, qs]]) => [...acc, [m, qs / daysInMonth(m, y)]], [])
}

function calcWeekData(dt) {
  let counter = 1   // 第几周
  let prevDate = 0  // 上一次记录的日期
  return Object.entries(dt.reduce((acc, [k, q]) => {
    const weekCounter = counter
    const date = new Date(k)
    if (prevDate) {
      const prevDatePlusAWeek = new Date(prevDate)
      prevDatePlusAWeek.setDate(prevDate.getDate() + 6 - prevDate.getDay())
      // 上个日期加六天如果小于当前日期 也就是记录超过了一周，算下一周的记录
      if (prevDatePlusAWeek < date) {
        counter += 1
      }
    }
    prevDate = date
    // [第几周]: 每天的质量[]
    return {...acc, [weekCounter]: [...(acc[weekCounter] || []), q]}
  }, {}))
    .sort((a, b) => a[0] - b[0])
    .reduce((acc, [w, qs]) => 
      [...acc, [w, qs.reduce((acc, q) => acc + q, 0) / (7 - qs.length || 7)]], []) // 如果数据中缺少一个自然周的几天，则按剩余天进行计算
}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
  // 将原始的源数据处理成图表需要的数据格式
  // 处理好的数据存到 chartData 中
  Object.keys(aqiSourceData).forEach(k => {
    const dayData = Object
      .entries(aqiSourceData[k])
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    chartData[k] = {
      day: dayData,
      month: calcMonthData(dayData),
      week: calcWeekData(dayData)
    }
  })
  renderChart()
}

/**
 * 初始化函数
 */
function init() {
  initGraTimeForm()
  initCitySelector();
  initAqiChartData();
}

init()
