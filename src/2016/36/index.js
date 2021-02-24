import {App} from "./js/app.js"

function start() {
  const app = new App()
  document.body.prepend(app.$dom)
}

start()
