import { $ } from "./util.js"
import {
  BUS,
  Conductor,
  ConductorRadioBinaryTranslator,
  DataCenter,
  OrbitManager,
  RadioFactory,
  SpacecraftManager,
  SpacecraftRadioBinaryTranslator
} from "./core/index.js"

function run() {
  const mediator = new BUS()
  const ConductorRadio = RadioFactory(mediator, ConductorRadioBinaryTranslator)
  const SpacecraftRadio = RadioFactory(mediator, SpacecraftRadioBinaryTranslator)

  const DC = new DataCenter($("monitor"), SpacecraftRadio.getReceiver)

  const orbitManager = new OrbitManager($("spaceGraph"))

  const $controlsGroup = $("controlsGroup");

  SpacecraftManager.init($controlsGroup, mediator, orbitManager, DC, ConductorRadio.getReceiver, SpacecraftRadio.getTransmitter)

  new Conductor($controlsGroup, ConductorRadio.getTransmitter)
}

run()

