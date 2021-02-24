import { getInputLength } from "../util.js";

/**
 * expected => actual => [transformActual, Comparator]
 * expected => actual => [serverMsg, useServerMsg]
 * expected => actual => bool
 */
export default {
  minlength: num => str => [getInputLength(str.trim()), v => v >= num],
  maxlength: num => str => [getInputLength(str.trim()), v => v <= num],
  min: num => str => [parseFloat(str.trim()), v => isNaN(v) || v >= num],
  max: num => str => [parseFloat(str.trim()), v => isNaN(v) || v <= num],
  less: num => str => [parseFloat(str.trim()), v => isNaN(v) || v < num],
  greater: num => str => [parseFloat(str.trim()), v => isNaN(v) || v > num],
  required: () => value => typeof value === "string" ? value.trim().length > 0 : value.some(it => it.trim().length > 0),
  regex: pattern => str => pattern.test(str.trim())
}
