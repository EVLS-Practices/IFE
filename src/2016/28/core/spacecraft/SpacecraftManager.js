import { generateId, createElement } from "../../util.js"
import { Spacecraft } from "./Spacecraft.js"
import { Conductor } from "../Conductor.js"
import { DynamicalSystem } from "./DynamicalSystem.js";
import { EnergySystem } from "./EnergySystem.js";

let isInit = false
const spacecraftList = []
let availableIds = []

const DYNAMICAL_SYSTEM = {
  前进号: () => new DynamicalSystem(20, .05),
  奔腾号: () => new DynamicalSystem(30, .08),
  超越号: () => new DynamicalSystem(40, .11)
}

const ENERGY_SYSTEM = {
  劲量型: () => new EnergySystem(100, .03, 100),
  光能型: () => new EnergySystem(90, .04, 90),
  永久型: () => new EnergySystem(80, .045, 80)
}

export const SpacecraftManager = {
  id: generateId(),
  init(container, mediator, orbitManager, dc, radioReceiverFactory, radioTransmitterFactory) {
    if (isInit) return
    isInit = true


    const dynamicalSystemSelect = createElement(null, "select")
    dynamicalSystemSelect.append(
      ...Object.keys(DYNAMICAL_SYSTEM)
        .map(it => createElement({ textContent: it }, "option")))

    const energySystemSelect = createElement(null, "select")
    energySystemSelect.append(
      ...Object.keys(ENERGY_SYSTEM)
        .map(it => createElement({ textContent: it }, "option")))

    container.append(
      dynamicalSystemSelect,
      energySystemSelect
    )

    radioReceiverFactory(SpacecraftManager.id).onReceive(({ receiverId, content }) => {
      if (receiverId !== this.id) return
      let spacecraft
      switch (content) {
        case Conductor.COMMANDS.LAUNCH_NEW_SPACECRAFT:
          spacecraft = new Spacecraft(
            orbitManager.getEmptyOrbit(),
            DYNAMICAL_SYSTEM[dynamicalSystemSelect.value](),
            ENERGY_SYSTEM[energySystemSelect.value](),
            dc.id,
            radioReceiverFactory,
            radioTransmitterFactory,
          )

          spacecraft.onDestroy(s => {
            orbitManager.giveBack(s.orbit)

            const idx = spacecraftList.findIndex(it => it === s)
            if (idx !== -1) {
              spacecraftList.splice(idx, 1)
              availableIds = spacecraftList.map(it => it.id)
            }
          })

          spacecraftList.push(spacecraft)
          availableIds = spacecraftList.map(it => it.id)
          break
      }
    })
  },
  getAvailableIds() {
    return availableIds.slice()
  }
}
