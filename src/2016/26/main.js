import { $ } from "./util.js"
import { Mediator, Conductor, SpacecraftManager, OrbitManager } from "./core/index.js"


function run() {
  const mediator = new Mediator()
  const orbitManager = new OrbitManager($("monitor"))
  SpacecraftManager.init(mediator, orbitManager)
  new Conductor($("controlsGroup"), mediator)
}

run()

