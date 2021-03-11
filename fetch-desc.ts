import readdirp, { EntryInfo } from "readdirp"
import Path from "path"
import fs from "fs"
import fetch from "node-fetch"
import cheerio from "cheerio"

function sleep (t: number) {
  return new Promise(r => setTimeout(r, t))
}

async function getDesc (year: number, taskId: number, outDir: string, retry = 3) {
  let url: string
  switch (year) {
    case 2016:
      url = `http://ife.baidu.com/${year}/task/detail?taskId=${taskId}`
      break
    default:
      console.log(`尚未实现年份：${year} 的描述获取`)
      return
  }
  try {
    const res = await (await fetch(url)).text()
    const $   = cheerio.load(res)

    let content = $(".task-detail > div:first-of-type").html()

    if (content) {
      const title = "# " + $(".nav-title").text().replace("【已经结束】", "") + "\n"
      content     = content.replace(/<a[\s\S]*?>/g, "").replace(/<\/a>/g, "")
      fs.writeFileSync(Path.join(outDir, "README.md"), [
        title,
        `## demo: [在线演示](https://evls-practices.github.io/IFE/src/${year}/${taskId}/index.html)`,
        `[IFE 链接](${url})\n`,
        content,
      ].join("\n"))
    }

  } catch (e) {
    console.error(e)
    if (retry > 0) {
      await sleep(3000)
      await getDesc(year, taskId, outDir, retry - 1)
    }
  }

}

(async function () {
  const exclude: Record<number, number[]> = {
    2016: [36],
  }

  for await (const entry of readdirp("./src", {
    type: "directories",
    directoryFilter: ({basename}: EntryInfo) => /^\d+$/.test(basename),
  })) {
    const {path, fullPath} = entry
    const year             = +Path.dirname(path)
    const taskId           = +Path.basename(path)
    if (exclude[ year ].includes(taskId)) {
      continue
    }
    await getDesc(year, taskId, fullPath)
  }
})()
