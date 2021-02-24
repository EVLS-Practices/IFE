import { assign, initial, last } from "../util.js";
import DefaultRulesGenerator from "./DefaultRulesGenerator.js"

/**
 * 把规则生成器转成带错误信息的验证器
 * @param langRef {Object} 当前语言
 * @param defaultMsgSet {Object} 生成错误信息的函数集合
 * @param rule {Function} 规则生成器
 */
const curryMessage = (langRef, defaultMsgSet, rule) => (...rulesConfigAndMsg) => {
  /**
   * 验证器
   * @param args 需要校验的输入
   * @return {null|string} 如果有错误则是字符串，否则是 null
   */
  async function validator(...args) {
    let rulesConfig = rulesConfigAndMsg
    let msgFn = defaultMsgSet[rule.name]

    /**
     * 传入了自定义错误信息（最后一个参数）
     */
    if (rulesConfigAndMsg.length > rule.length) {
      rulesConfig = initial(rulesConfigAndMsg);
      /**
       * 自定义错误信息，可以是字符串或者是返回字符串的函数
       */
      const msgOrMsgFn = last(rulesConfigAndMsg)

      switch (typeof msgOrMsgFn) {
        case "string":
          msgFn = () => msgOrMsgFn
          break
        case "function":
          msgFn = msgOrMsgFn
      }
    }

    /**
     * 输出验证结果
     */
    const result = await rule(...rulesConfig)(...args)

    if (typeof result === "boolean") {
      /**
       * 不需要读配置的规则
       */
      return result ? null : await msgFn(...rulesConfig, ...args, langRef.current)
    } else {
      /**
       * 需要读配置的规则
       * 第二个值如果是函数，则是验证器，布尔值则表示服务端返回错误提示信息
       */
      const [, comparatorOrIsServerSideMessage] = result
      const actualValue = await result[0]

      if (typeof comparatorOrIsServerSideMessage === "function") {
        return await comparatorOrIsServerSideMessage(actualValue) ? null : await msgFn(...rulesConfig, actualValue, langRef.current)
      } else if (comparatorOrIsServerSideMessage) {
        return actualValue
      }
    }
  }

  Object.defineProperty(validator, "name", { value: rule.name })
  return validator
}

/**
 * 获取特定语言（错误提示集）
 */
async function fetchLang(lang) {
  try {
    const res = await import(ValidatorFactory.getLanguageAddr(lang))
    return res.default
  } catch {
    console.error(`Unable to get the error message set for language '${lang}'.`)
    return {}
  }
}

export async function ValidatorFactory({
  rules: initialUserRules,
  messageSet: initialUserMsgSet,
  lang: initialLang = "zh_CN",
} = {}) {
  /**
   * 存放已加载的语言
   */
  const loadedLang = { [initialLang]: await fetchLang(initialLang) }
  /**
   * 当前语言引用
   */
  const langRef = { current: initialLang }

  /**
   * 规则生成器
   */
  const rules = { ...DefaultRulesGenerator, ...initialUserRules }

  /**
   * 当前语言的错误提示信息集
   */
  const messageSet = { ...loadedLang[initialLang], ...initialUserMsgSet?.[initialLang] }
  /**
   * 用户传入的错误信息集拷贝
   */
  const userMsgSetCopy = { ...initialUserMsgSet }

  /**
   * 验证器
   */
  const validators = genValidators()

  /**
   * 把规则生成器包装成带错误信息的规则生成器（验证器）
   */
  function genValidators() {
    return Object.keys(rules).reduce((acc, k) => ({
      ...acc,
      [k]: curryMessage(langRef, messageSet, rules[k])
    }), {})
  }

  return {
    /**
     * 当前所有的验证器
     */
    validators,
    /**
     * 添加新规则生成器
     */
    extendsRules(newRules) {
      assign(newRules, rules)
      assign(genValidators(), validators)
    },
    /**
     * 添加新错误提示
     */
    extendsMessageSet(newMessageSet) {
      assign(newMessageSet, userMsgSetCopy)
      assign(newMessageSet[langRef.current], messageSet)
    },
    /**
     * 更改语言
     */
    async changeLanguage(newLang) {
      if (newLang === langRef.current) return

      if (!loadedLang[newLang]) {
        loadedLang[newLang] = await fetchLang(newLang)
      }

      /**
       * 删除已有错误提示信息
       */
      Object.keys(messageSet).forEach(k => delete messageSet[k])

      /**
       * 插入默认错误提示信息
       */
      assign(loadedLang[newLang], messageSet)
      /**
       * 插入用户指定错误提示信息
       */
      assign(userMsgSetCopy[newLang], messageSet)

      /**
       * 切换语言
       */
      langRef.current = newLang
    },
    /**
     * 当前的规则生成器
     */
    get rules() {
      return Object.freeze(rules)
    },
    /**
     * 当前的错误信息集
     */
    get messageSet() {
      return Object.freeze(messageSet)
    },
    /**
     * 当前语言
     */
    get lang() {
      return langRef.current
    }
  }
}

ValidatorFactory.getLanguageAddr = function getLanguageAddr(lang) {
  return `./lang/${lang}.js`
}
