import { generateId } from "../../util.js"
import { Spacecraft } from "./Spacecraft.js"
import { Conductor } from "../Conductor.js"

let isInit = false
const spacecraftList = []
let availableIds = []

export const SpacecraftManager = {
  id: generateId(),
  init(mediator, orbitManager) {
    if (isInit) return
    isInit = true
    mediator.listen(({ receiverId, content }) => {
      if (receiverId !== this.id) return
      let spacecraft
      switch (content) {
        case Conductor.COMMANDS.LAUNCH_NEW_SPACECRAFT:
          spacecraft = new Spacecraft(mediator, orbitManager.getEmptyOrbit())
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

