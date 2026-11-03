import { settings } from "../data/settings.js";

const API_URL = "https://api.open-meteo.com/v1/forecast";

const weatherLabels = {
  0: "晴",
  1: "大致晴朗",
  2: "局部多云",
  3: "阴",
  45: "有雾",
  48: "雾凇",
  51: "毛毛雨",
  53: "中等毛毛雨",
  55: "较强毛毛雨",
  56: "冻毛毛雨",
  57: "较强冻毛毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  66: "冻雨",
  67: "强冻雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  77: "米雪",
  80: "阵雨",
  81: "较强阵雨",
  82: "强阵雨",
  85: "阵雪",
  86: "强阵雪",
  95: "雷雨",
  96: "雷雨伴小冰雹",
  99: "雷雨伴强冰雹",
};

export function getWeatherLabel(code) {
  return weatherLabels[code] ?? "天气情况";
}

export async function fetchWeather({ force = false } = {}) {
  const cacheKey = settings.weather.cacheKey;
  const cached = readCache(cacheKey);
  const isFresh = cached && Date.now() - cached.savedAt < settings.weather.refreshIntervalMs;

  if (!force && isFresh) return { data: cached.data, cached: true };

  const params = new URLSearchParams({
    latitude: String(settings.location.latitude),
    longitude: String(settings.location.longitude),
    timezone: settings.location.timezone,
    forecast_days: "7",
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
    ].join(","),
  });

  const response = await fetch(`${API_URL}?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`天气接口返回 ${response.status}`);

  const data = await response.json();
  if (data.error) throw new Error(data.reason || "天气接口返回错误");

  try {
    localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // 浏览器禁用本地存储时，天气仍可正常展示。
  }

  return { data, cached: false };
}

export function getCachedWeather() {
  const cached = readCache(settings.weather.cacheKey);
  return cached ? { data: cached.data, cached: true, savedAt: cached.savedAt } : null;
}

function readCache(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
