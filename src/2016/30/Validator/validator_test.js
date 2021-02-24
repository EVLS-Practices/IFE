import { sleep } from "../util.js";
import { ValidatorFactory } from "./ValidatorFactory.js";

async function genNumApi(str) {
  await sleep(3000)
  return { actualNum: parseInt(str) + 2 }
}

async function verify(str) {
  await sleep(3000)
  return { isExists: str !== "foo" }
}

async function fetchRemote(str) {
  await sleep(3000)
  return { serverMsg: `So long, ${str}! ` }
}

(async () => {
  const validator = await ValidatorFactory({
    lang: "en_US",
  })

  validator.extendsRules({
    number: () => str => str.split("").every(it => !isNaN(parseFloat(it))),
    guessNum: expectedNum => str => [genNumApi(str).then(r => r.actualNum), v => v === expectedNum],
    isNameExists: () => async str => {
      const { isExists } = await verify(str)
      return isExists
    },
    serverMsg: () => async str => {
      const { serverMsg } = await fetchRemote(str)
      return [serverMsg, true]
    }
  })

  validator.extendsMessageSet({
    zh_CN: {
      number: () => "只能输入数字",
      guessNum: (expectedNum, actualNum) => `生成的数字是 ${actualNum}, 中奖号码是 ${expectedNum}`,
      isNameExists: expected => `${expected} 已经被占用`
    },
    en_US: {
      number: () => "Only digits can be entered",
      guessNum: (expectedNum, actualNum) => `generated number is ${actualNum}, winning number is ${expectedNum}`,
      isNameExists: expected => `name '${expected}' already exists`
    }
  })

  const numV = validator.validators.guessNum(15, (e, a) => `custom msg haha ${e} ${a}`)
  console.log(await numV("12"))
  console.log(await numV("11"))

  const nameV = validator.validators.isNameExists()
  console.log("nameV('bob'):", await nameV('bob'));
  console.log("nameV('foo'):", await nameV('foo'));

  const serverV = validator.validators.serverMsg()
  console.log("serverV('bob'):", await serverV('bob'));
  console.log("serverV('foo'):", await serverV('foo'));

  console.log("change language to zh_CN")
  await validator.changeLanguage("zh_CN")
  console.log(await numV("14"))
  console.log(await numV("13") === null ? "中奖啦！" : "This world is going crazy, give my money back!")
  console.log("nameV('bob'):", await nameV('bob'));
  console.log("nameV('foo'):", await nameV('foo'));
  console.log("serverV('bob'):", await serverV('bob'));
  console.log("serverV('foo'):", await serverV('foo'));
})()
