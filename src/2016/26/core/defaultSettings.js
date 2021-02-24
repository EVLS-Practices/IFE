export const DEFAULT_SETTINGS = {
  Spacecraft: {
    speed: 20,                  // 每秒中移动px
    initialEnergies: 100,       // 初始化能量
    maximumEnergies: 100,       // 能量最大值
    energyConsumptionRate: .05, // 能耗比
    energyChargingRate: .03,    // 每秒补充能量百分比
  },
  Mediator: {
    packetLossRate: .3,         // 丢包率
    delay: 1000                 // 传播延迟
  },
  Conductor: {
    maximumSpacecraftNum: 4     // 限制飞船数目
  }
}
