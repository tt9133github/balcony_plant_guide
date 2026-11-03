// 可修改的阳台环境配置。不要在这里填写家庭精确地址。
export const settings = {
  location: {
    name: "成都",
    latitude: 30.5728,
    longitude: 104.0668,
    timezone: "Asia/Shanghai",
  },
  balcony: {
    direction: "北向",
    directSunlight: false,
    lightCondition: "明亮散射光",
    floor: null, // 楼层不是植物养护的必要参数，因此默认不记录。
  },
  weather: {
    refreshIntervalMs: 60 * 60 * 1000,
    cacheKey: "balcony-garden-weather-v1",
  },
};
