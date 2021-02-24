export default {
  SUCCESS_MESSAGE: "验证通过",
  FAILURE_MESSAGE: "验证不通过",
  maxlength: (expectNum, actualNum) => `最多 ${expectNum} 个字符，当前共 ${actualNum} 个字符`,
  minlength: (expectNum, actualNum) => `最少 ${expectNum} 个字符，当前共 ${actualNum} 个字符`,
  min: expectNum => `不得小于 ${expectNum}`,
  max: expectNum => `不得大于 ${expectNum}`,
  less: expectNum => `必须小于 ${expectNum}`,
  greater: expectNum => `必须大于 ${expectNum}`,
  required: () => "此项为必填项",
  regex: msg => msg ?? this.FAILURE_MESSAGE
}
