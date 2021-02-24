import { $ } from "./util.js"
import { ValidatorFactory } from "./Validator/ValidatorFactory.js";


import { FormGroup } from "./FormGroup.js";
import { FormControl } from "./FormControl.js";


(async () => {
  /**
   * 生成验证器
   */
  const { validators } = await ValidatorFactory({
    rules: {
      /**
       * 添加一个验证是否数字的验证器
       */
      number: () => str => str.split("").every(it => !isNaN(parseFloat(it))),
    },
    messageSet: {
      zh_CN: {
        number: () => "只能输入数字",
      }
    }
  })

  const form = new FormGroup($("form"), {
    nickname: new FormControl("", [
        validators.required(),
        validators.minlength(4),
        validators.maxlength(16)],
      { initialMessage: "4 到 16 个字符之间", successMessage: "验证通过", validateOn: "blur" }),

    city: new FormControl("上海", [validators.required()], { successMessage: "验证通过", validateOn: "change" }),

    gender: new FormControl("female", [validators.required()], { successMessage: "验证通过" }),

    age: new FormControl("", [
        validators.required(),
        validators.number(),
        validators.min(18, "不招童工"),
        validators.max(35, "不招大叔")],
      { initialMessage: "18 到 35 岁之间" }),

    hobby: new FormControl("music", [validators.required()], { successMessage: "验证通过" })
  })


  form.onSubmit(async ev => {
    ev.preventDefault()
    await form.validate()
    alert(`提交${form.isValid ? "成功" : "失败"}`)
  })

  /**
   * 用于查看当前表单状态
   */
  const state = $("formState")
  form.onChange(val => {
    state.innerHTML = JSON.stringify({ value: val, errors: form.errors, isValid: form.isValid }, null, 2)
  })
})()

