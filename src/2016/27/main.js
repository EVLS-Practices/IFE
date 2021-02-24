import { $ } from "./util.js"
import { BUS, Conductor, OrbitManager, SpacecraftManager } from "./core/index.js"


function run() {
  const mediator = new BUS()
  const orbitManager = new OrbitManager($("monitor"))
  const $controlsGroup = $("controlsGroup");
  SpacecraftManager.init($controlsGroup, mediator, orbitManager)
  new Conductor($controlsGroup, mediator)
}

run()

