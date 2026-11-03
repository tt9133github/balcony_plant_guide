import { plants, careActions } from "./data/plants.js";
import { settings } from "./data/settings.js";
import { fetchWeather, getCachedWeather, getWeatherLabel } from "./services/weather.js";
import { getLogs, addLog, exportLogs, importLogs } from "./services/storage.js";
import "./styles/main.css";

const app = document.querySelector("#app");
let activeFilter = "全部";
let selectedPlantId = null;
let logs = getLogs();
let weatherData = null;

const actionLabel = Object.fromEntries(careActions.map((item) => [item.value, item.label]));
const dateFmt = new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", weekday: "short", timeZone: settings.location.timezone });
const dateTimeFmt = new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: settings.location.timezone });

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function latestLog(plantId) {
  return logs.find((item) => item.plantId === plantId);
}

function plantCard(plant) {
  const last = latestLog(plant.id);
  const flowering = plant.flowering ? "开花植物" : "观叶/香草";
  return `
    <article class="plant-card">
      <button class="plant-photo-button" data-detail="${plant.id}" aria-label="查看${plant.name}详情">
        <img class="plant-photo" src="${import.meta.env.BASE_URL}${plant.image.replace(/^\//, "")}" alt="${escapeHtml(plant.name)}" loading="lazy">
        <span class="photo-tag">${flowering}</span>
      </button>
      <div class="plant-card-body">
        <div class="plant-card-heading">
          <div>
            <h3>${escapeHtml(plant.name)}</h3>
            <p class="latin">${escapeHtml(plant.latin)}</p>
          </div>
          <span class="light-pill">光照 ${escapeHtml(plant.lightNeed)}</span>
        </div>
        <p class="plant-summary">${escapeHtml(plant.balconyFit)}</p>
        <div class="plant-meta">
          <span>☀️ ${escapeHtml(plant.lightNeed)}光照</span>
          <span>💧 ${plant.id === "hydrangea" ? "喜湿润" : plant.id === "rosemary" || plant.id === "kalanchoe" ? "偏耐旱" : "见干见湿"}</span>
        </div>
        <div class="last-log">${last ? `最近：${escapeHtml(actionLabel[last.action] || "记录")} · ${dateTimeFmt.format(new Date(last.createdAt))}` : "还没有养护记录"}</div>
        <div class="card-actions">
          <button class="button button-secondary" data-detail="${plant.id}">养护详情</button>
          <button class="button button-primary" data-log="${plant.id}">记一笔</button>
        </div>
      </div>
    </article>`;
}

function render() {
  const categories = ["全部", "开花植物", "观叶植物", "香草植物"];
  const filtered = activeFilter === "全部" ? plants : plants.filter((p) => p.category === activeFilter);
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#" aria-label="我的阳台花园首页"><span class="brand-mark">✿</span><span>阳台花园<span class="brand-sub">BALCONY GARDEN</span></span></a>
      <nav><a href="#weather">天气</a><a href="#plants">植物图鉴</a><a href="#records">养护记录</a></nav>
      <button class="icon-button" id="backup-button" title="导出养护记录">⇩ <span>备份</span></button>
    </header>

    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">MY LITTLE GREEN SPACE</p>
          <h1>把日常，过成<br><em>有花有叶的日子。</em></h1>
          <p class="hero-description">八种植物，一座北向阳台。这里记录天气、光照与每一次认真养护。</p>
          <div class="hero-facts">
            <span>📍 ${escapeHtml(settings.location.name)}</span>
            <span>☁️ ${escapeHtml(settings.balcony.direction)} · ${escapeHtml(settings.balcony.lightCondition)}</span>
            <span>🪴 ${plants.length} 种植物</span>
          </div>
          <a class="text-link" href="#plants">认识我的植物 <span>↘</span></a>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="sun-disc"></div>
          <div class="hero-leaf leaf-one"></div>
          <div class="hero-leaf leaf-two"></div>
          <div class="hero-leaf leaf-three"></div>
          <div class="hero-caption">GROW SLOW<br>GROW WELL</div>
        </div>
      </section>

      <section class="weather-section section" id="weather">
        <div class="section-heading">
          <div><p class="eyebrow">WEATHER WATCH</p><h2>今天的养护环境</h2></div>
          <button class="button button-outline" id="refresh-weather">↻ 刷新天气</button>
        </div>
        <div id="weather-panel" class="weather-panel">
          <div class="weather-loading"><span class="spinner"></span> 正在获取成都天气…</div>
        </div>
        <p class="weather-note">天气用于辅助判断环境，不代替检查每盆植物的实际土壤湿度。天气数据由 <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> 提供。</p>
      </section>

      <section class="section" id="plants">
        <div class="section-heading">
          <div><p class="eyebrow">PLANT COLLECTION</p><h2>我的植物图鉴</h2><p class="section-description">每种植物有自己的习性，不必采用同一套浇水节奏。</p></div>
          <span class="count-badge">${plants.length} PLANTS</span>
        </div>
        <div class="filter-row">${categories.map((c) => `<button class="filter-chip ${activeFilter === c ? "active" : ""}" data-filter="${c}">${c}</button>`).join("")}</div>
        <div class="plant-grid">${filtered.map(plantCard).join("")}</div>
      </section>

      <section class="section records-section" id="records">
        <div class="section-heading">
          <div><p class="eyebrow">CARE JOURNAL</p><h2>最近的养护记录</h2><p class="section-description">记录保存在当前浏览器中；更换设备前请导出备份。</p></div>
          <div class="record-tools">
            <button class="button button-outline" id="import-button">导入备份</button>
            <input type="file" id="import-file" accept="application/json" hidden>
            <button class="button button-primary" id="backup-button-secondary">导出备份</button>
          </div>
        </div>
        <div class="records-list">${renderLogs()}</div>
      </section>
    </main>

    <footer class="footer">
      <span>🌿 慢慢养，慢慢看。</span>
      <span>天气：Open-Meteo · 植物资料：可在 src/data/plants.js 中维护</span>
    </footer>
    <dialog id="plant-dialog" class="dialog"></dialog>
    <dialog id="log-dialog" class="dialog log-dialog"></dialog>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `;

  bindEvents();
  if (weatherData) renderWeather(weatherData.data, weatherData.cached, weatherData.savedAt);
}

function renderLogs() {
  if (!logs.length) return `<div class="empty-state"><span>📝</span><strong>还没有养护记录</strong><p>给植物浇水、修剪或观察后，点击植物卡片上的「记一笔」。</p></div>`;
  return logs.slice(0, 8).map((log) => {
    const plant = plants.find((item) => item.id === log.plantId);
    const action = careActions.find((item) => item.value === log.action);
    return `<article class="record-row">
      <span class="record-icon">${action?.icon || "🌿"}</span>
      <div class="record-main"><strong>${escapeHtml(plant?.name || "植物")} · ${escapeHtml(action?.label || "记录")}</strong><p>${escapeHtml(log.note || "未添加备注")}</p></div>
      <time>${dateTimeFmt.format(new Date(log.createdAt))}</time>
    </article>`;
  }).join("");
}

function renderWeather(data, cached = false, savedAt = null) {
  const current = data.current;
  const daily = data.daily;
  const updated = current.time ? dateTimeFmt.format(new Date(current.time)) : "";
  const forecast = daily.time.map((day, index) => ({
    day,
    code: daily.weather_code[index],
    max: daily.temperature_2m_max[index],
    min: daily.temperature_2m_min[index],
    rain: daily.precipitation_probability_max?.[index],
    mm: daily.precipitation_sum?.[index],
  }));

  const note = weatherAdvice(current, forecast);
  const panel = document.querySelector("#weather-panel");
  if (!panel) return;
  panel.innerHTML = `
    <div class="weather-current">
      <div class="weather-main">
        <div class="weather-icon">${weatherIcon(current.weather_code)}</div>
        <div><p class="weather-place">${escapeHtml(settings.location.name)} · 当前天气</p><div class="temperature">${Math.round(current.temperature_2m)}<small>°C</small></div><p class="weather-desc">${getWeatherLabel(current.weather_code)} · 体感 ${Math.round(current.apparent_temperature)}°C</p></div>
      </div>
      <div class="weather-stats">
        <div><span>相对湿度</span><strong>${current.relative_humidity_2m}%</strong></div>
        <div><span>风速</span><strong>${current.wind_speed_10m} <small>km/h</small></strong></div>
        <div><span>当前降水</span><strong>${current.precipitation} <small>mm</small></strong></div>
      </div>
      <div class="weather-updated">${cached ? "缓存数据" : "实时接口数据"} · ${updated || (savedAt ? dateTimeFmt.format(new Date(savedAt)) : "")}</div>
    </div>
    <div class="forecast"><h3>未来 7 天</h3><div class="forecast-grid">${forecast.map((item, index) => `
      <div class="forecast-day"><span>${index === 0 ? "今天" : dateFmt.format(new Date(`${item.day}T04:00:00Z`))}</span><b>${weatherIcon(item.code)}</b><small>${getWeatherLabel(item.code)}</small><strong>${Math.round(item.max)}° <i>${Math.round(item.min)}°</i></strong><em>雨 ${item.rain ?? "--"}%</em></div>
    `).join("")}</div></div>
    <div class="weather-advice"><span class="advice-icon">🌱</span><div><strong>今日养护提示</strong><p>${note}</p></div></div>
  `;
}

function weatherIcon(code) {
  if ([0, 1].includes(code)) return "☀️";
  if ([2, 3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌤️";
}

function weatherAdvice(current, forecast) {
  const nextThree = forecast.slice(0, 3);
  const rainLikely = nextThree.some((day) => (day.rain ?? 0) >= 60 || (day.mm ?? 0) >= 3);
  const highTemp = Math.max(...nextThree.map((day) => day.max ?? 0));
  const lowTemp = Math.min(...nextThree.map((day) => day.min ?? 99));
  const notes = [];
  if (rainLikely) notes.push("未来几天有降雨可能，室内/阳台盆栽不会自动淋到雨，仍需逐盆检查盆土；同时留意通风和托盘积水。");
  if (highTemp >= 30) notes.push("未来有偏热天气，重点观察绣球是否在午后萎蔫，并避免花盆被地面或玻璃反射热量持续烘烤。");
  if (lowTemp <= 8) notes.push("未来夜间偏冷，留意长寿花、三角梅等植物的低温反应，避免冷风直吹和湿土过夜。");
  if (current.relative_humidity_2m >= 85) notes.push("当前空气湿度较高，迷迭香和三角梅要特别注意通风，避免盆土长期潮湿。");
  if (!notes.length) notes.push("目前没有明显的极端天气信号。继续按植物种类分别检查盆土：绣球偏湿润，迷迭香、三角梅和长寿花更忌长期湿土。");
  return notes.join(" ");
}

function showPlantDetail(plantId) {
  const plant = plants.find((item) => item.id === plantId);
  if (!plant) return;
  selectedPlantId = plantId;
  const dialog = document.querySelector("#plant-dialog");
  const plantLogs = logs.filter((item) => item.plantId === plantId).slice(0, 5);
  dialog.innerHTML = `
    <div class="dialog-head"><div><p class="eyebrow">PLANT PROFILE</p><h2>${escapeHtml(plant.name)}</h2><p class="latin">${escapeHtml(plant.latin)}</p></div><button class="close-button" data-close="plant-dialog" aria-label="关闭">×</button></div>
    <img class="dialog-photo" src="${import.meta.env.BASE_URL}${plant.image.replace(/^\//, "")}" alt="${escapeHtml(plant.name)}">
    <div class="detail-grid">
      <div><span>光照需求</span><strong>${escapeHtml(plant.light)}</strong></div>
      <div><span>浇水原则</span><strong>${escapeHtml(plant.water)}</strong></div>
      <div><span>温度偏好</span><strong>${escapeHtml(plant.temperature)}</strong></div>
      <div><span>阳台适配</span><strong>${escapeHtml(plant.balconyFit)}</strong></div>
    </div>
    <div class="detail-section"><h3>日常养护要点</h3><ul>${plant.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}</ul></div>
    <div class="caution"><strong>特别留意</strong><p>${escapeHtml(plant.watch)}</p></div>
    <div class="detail-section"><h3>最近记录</h3>${plantLogs.length ? plantLogs.map((log) => `<p class="mini-log">${escapeHtml(actionLabel[log.action] || "记录")} · ${dateTimeFmt.format(new Date(log.createdAt))}　${escapeHtml(log.note || "")}</p>`).join("") : `<p class="muted">暂无记录</p>`}</div>
    <button class="button button-primary button-wide" data-log="${plant.id}">记录一次养护</button>
  `;
  dialog.querySelector("[data-close]")?.addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-log]")?.addEventListener("click", () => {
    dialog.close();
    showLogForm(plant.id);
  });
  dialog.showModal();
}

function showLogForm(plantId) {
  selectedPlantId = plantId;
  const plant = plants.find((item) => item.id === plantId);
  const dialog = document.querySelector("#log-dialog");
  dialog.innerHTML = `
    <div class="dialog-head"><div><p class="eyebrow">CARE JOURNAL</p><h2>记录养护</h2><p class="muted">${escapeHtml(plant?.name || "")}</p></div><button class="close-button" data-close="log-dialog" aria-label="关闭">×</button></div>
    <form id="care-form">
      <label>养护事项<select name="action" required>${careActions.map((item) => `<option value="${item.value}">${item.icon} ${item.label}</option>`).join("")}</select></label>
      <label>备注<textarea name="note" rows="4" placeholder="例如：表层土干、浇透一次；或记录叶片状态……"></textarea></label>
      <p class="form-hint">记录会保存在当前浏览器，不会自动上传到服务器。</p>
      <button class="button button-primary button-wide" type="submit">保存记录</button>
    </form>
  `;
  dialog.querySelector("[data-close]")?.addEventListener("click", () => dialog.close());
  dialog.showModal();
}

function bindEvents() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      render();
    });
  });

  document.querySelectorAll("[data-detail]").forEach((button) => {
    button.addEventListener("click", () => showPlantDetail(button.dataset.detail));
  });

  document.querySelectorAll("[data-log]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#plant-dialog")?.close();
      showLogForm(button.dataset.log);
    });
  });

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => document.querySelector(`#${button.dataset.close}`)?.close());
  });

  document.querySelector("#care-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    logs = addLog({
      plantId: selectedPlantId,
      action: String(form.get("action")),
      note: String(form.get("note") || "").trim(),
    });
    document.querySelector("#log-dialog").close();
    render();
    showToast("养护记录已保存");
  });

  document.querySelector("#refresh-weather")?.addEventListener("click", () => loadWeather(true));
  document.querySelectorAll("#backup-button, #backup-button-secondary").forEach((button) => button.addEventListener("click", exportLogs));
  document.querySelector("#import-button")?.addEventListener("click", () => document.querySelector("#import-file").click());
  document.querySelector("#import-file")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      logs = await importLogs(file);
      render();
      showToast("备份导入成功");
    } catch (error) {
      showToast(error.message || "导入失败");
    }
    event.target.value = "";
  });
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

async function loadWeather(force = false) {
  const button = document.querySelector("#refresh-weather");
  if (button) button.disabled = true;
  try {
    weatherData = await fetchWeather({ force });
    renderWeather(weatherData.data, weatherData.cached);
  } catch (error) {
    const cached = getCachedWeather();
    if (cached) {
      weatherData = cached;
      renderWeather(cached.data, true, cached.savedAt);
      showToast("天气接口暂不可用，已显示缓存数据");
    } else {
      const panel = document.querySelector("#weather-panel");
      if (panel) panel.innerHTML = `<div class="weather-error"><strong>暂时无法获取天气</strong><p>${escapeHtml(error.message)}。检查网络后可点击刷新重试。</p></div>`;
    }
  } finally {
    if (button) button.disabled = false;
  }
}

render();
loadWeather();
window.setInterval(() => loadWeather(true), settings.weather.refreshIntervalMs);
