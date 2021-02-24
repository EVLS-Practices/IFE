export default {
  SUCCESS_MESSAGE: "Validation passed",
  FAILURE_MESSAGE: "This field is invalid",
  maxlength: (expectNum, actualNum) => `At most ${expectNum} characters，${actualNum} 个字符`,
  minlength: (expectNum, actualNum) => `At least ${expectNum} characters，当前共 ${actualNum} 个字符`,
  min: expectNum => `Cannot smaller than ${expectNum}`,
  max: expectNum => `Cannot exceed ${expectNum}`,
  less: expectNum => `Must less than ${expectNum}`,
  greater: expectNum => `Must greater than ${expectNum}`,
  required: () => "This field is required",
  regex: msg => msg ?? this.FAILURE_MESSAGE
}
