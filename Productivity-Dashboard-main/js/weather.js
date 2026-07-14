// ==========================================
// WEATHER SERVICE
// ==========================================
function initWeather() {
  updateWxPageDate();
  renderRecentSearches();
  initWeatherPageUI();

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      AppState.weather.lat = coords.latitude;
      AppState.weather.lon = coords.longitude;
      loadCityNameFromCoordinates(coords.latitude, coords.longitude);
    },
    () => {
      console.log("Geolocation permission denied, defaulting location to New Delhi, India.");
      fetchWeatherReport();
    }
  );

  elements.weatherSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = elements.weatherSearchInput.value.trim();
    if (query) searchCityWeather(query);
  });
}

function initWeatherPageUI() {
  if (elements.wxSearchToggle && elements.weatherSearchForm) {
    elements.wxSearchToggle.addEventListener("click", () => {
      elements.weatherSearchForm.classList.toggle("open");
      if (elements.weatherSearchForm.classList.contains("open")) {
        elements.weatherSearchInput.focus();
      }
    });
  }

  if (elements.wxRefreshBtn) {
    elements.wxRefreshBtn.addEventListener("click", () => {
      elements.wxRefreshBtn.querySelector("i").classList.add("fa-spin");
      fetchWeatherReport().finally(() => {
        setTimeout(() => {
          elements.wxRefreshBtn.querySelector("i").classList.remove("fa-spin");
        }, 600);
      });
    });
  }

  if (elements.wxClearRecent) {
    elements.wxClearRecent.addEventListener("click", (e) => {
      e.preventDefault();
      AppState.weather.recentSearches = [];
      localStorage.setItem("weatherRecent", JSON.stringify([]));
      renderRecentSearches();
    });
  }
}

function updateWxPageDate() {
  if (!elements.wxPageDate) return;
  const now = new Date();
  elements.wxPageDate.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

async function loadCityNameFromCoordinates(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, { headers: { "User-Agent": "ProductivityHubAgent" } });
    if (!res.ok) throw new Error("Reverse geocode failed");
    const data = await res.json();

    const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "Unknown City";
    const region = data.address.country || data.address.state || "";
    AppState.weather.cityName = region ? `${city}, ${region}` : city;

    fetchWeatherReport();
  } catch (err) {
    console.error(err);
    AppState.weather.cityName = "Current Location";
    fetchWeatherReport();
  }
}

async function searchCityWeather(cityQuery) {
  try {
    elements.pageWeatherCondition.textContent = "Searching coordinates...";
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(cityQuery)}&limit=1`;
    const res = await fetch(geocodeUrl, { headers: { "User-Agent": "ProductivityHubAgent" } });
    if (!res.ok) throw new Error("Geocoding failed");
    const data = await res.json();

    if (data.length === 0) {
      alert("City not found. Try searching for a larger city.");
      elements.pageWeatherCondition.textContent = "Search failed.";
      return;
    }

    const firstResult = data[0];
    AppState.weather.lat = parseFloat(firstResult.lat);
    AppState.weather.lon = parseFloat(firstResult.lon);

    const nameParts = firstResult.display_name.split(",");
    const cityShortName = nameParts.slice(0, 2).join(",").trim();
    AppState.weather.cityName = cityShortName;

    addToRecentSearches({
      name: cityShortName,
      lat: AppState.weather.lat,
      lon: AppState.weather.lon
    });

    elements.weatherSearchInput.value = "";
    if (elements.weatherSearchForm) elements.weatherSearchForm.classList.remove("open");
    fetchWeatherReport();
  } catch (err) {
    console.error(err);
    alert("Error searching city coordinates.");
  }
}

async function fetchWeatherReport() {
  const { lat, lon, cityName } = AppState.weather;
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,apparent_temperature,wind_direction_10m,surface_pressure&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
    const res = await fetch(weatherUrl);
    if (!res.ok) throw new Error("Weather API fetch failed");
    const data = await res.json();

    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;
    const humidity = data.current.relative_humidity_2m;
    const wind = Math.round(data.current.wind_speed_10m);
    const feelsLike = Math.round(data.current.apparent_temperature);
    const windDir = data.current.wind_direction_10m;
    const pressure = Math.round(data.current.surface_pressure);
    const condition = getWeatherConditionString(code);
    const shortCondition = getShortCondition(code);
    const iconClass = getWeatherIconClass(code);
    const heroClass = getWeatherHeroClass(code);
    const todayHigh = Math.round(data.daily.temperature_2m_max[0]);
    const todayLow = Math.round(data.daily.temperature_2m_min[0]);

    if (elements.dashboardWeatherIcon) elements.dashboardWeatherIcon.className = `fa-solid ${iconClass}`;
    if (elements.pageWeatherIcon) elements.pageWeatherIcon.className = `fa-solid ${iconClass}`;

    if (elements.weatherTemp) elements.weatherTemp.textContent = `${temp}°C`;
    if (elements.weatherCondition) elements.weatherCondition.textContent = condition;
    if (elements.weatherCity) elements.weatherCity.textContent = cityName;
    if (elements.weatherCompactHumidity) elements.weatherCompactHumidity.textContent = `${humidity}%`;
    if (elements.weatherCompactWind) elements.weatherCompactWind.textContent = `${wind} km/h`;
    if (elements.weatherApparent) elements.weatherApparent.textContent = `${feelsLike}°C`;
    if (elements.weatherHumidityVal) elements.weatherHumidityVal.textContent = `${humidity}%`;
    if (elements.weatherWindSpeed) elements.weatherWindSpeed.textContent = `${wind} km/h`;

    if (elements.pageWeatherCity) elements.pageWeatherCity.textContent = cityName;
    if (elements.pageWeatherCondition) elements.pageWeatherCondition.textContent = shortCondition;
    if (elements.pageWeatherTemp) elements.pageWeatherTemp.textContent = `${temp}°`;
    if (elements.pageWeatherApparent) elements.pageWeatherApparent.textContent = `${feelsLike}°C`;
    if (elements.pageWeatherHumidity) elements.pageWeatherHumidity.textContent = `${humidity}%`;
    if (elements.pageWeatherWind) elements.pageWeatherWind.textContent = `${wind} km/h`;

    if (elements.wxHero) {
      elements.wxHero.className = `wx-hero wx-glass ${heroClass}`;
    }
    if (elements.wxHeroSub) {
      elements.wxHeroSub.textContent = `Feels like ${feelsLike}° · ${condition.toLowerCase()}`;
    }
    if (elements.wxHigh) elements.wxHigh.textContent = `H ${todayHigh}°`;
    if (elements.wxLow) elements.wxLow.textContent = `L ${todayLow}°`;
    if (elements.wxPressure) elements.wxPressure.textContent = `${pressure} hPa`;
    if (elements.wxWindSpeedLabel) elements.wxWindSpeedLabel.textContent = `${wind} km/h`;
    if (elements.wxWindDirLabel) elements.wxWindDirLabel.textContent = `${getWindDirection(windDir)} · ${Math.round(windDir)}°`;
    if (elements.wxWindArrow) elements.wxWindArrow.style.transform = `rotate(${windDir}deg)`;
    if (elements.wxDangerBadge) {
      elements.wxDangerBadge.classList.toggle("visible", isDangerousWeather(code, wind));
    }
    if (elements.wxLastUpdated) elements.wxLastUpdated.textContent = "Updated just now";

    addToRecentSearches({ name: cityName, lat, lon, temp, code });
    renderHourlyForecast(data.hourly);
    renderWeeklyForecast(data.daily);
    renderTempChart(data.hourly);
    updateWxPageDate();
  } catch (err) {
    console.error("Failed to load weather report details: ", err);
    if (elements.pageWeatherCondition) elements.pageWeatherCondition.textContent = "Unable to load forecast";
  }
}

function renderHourlyForecast(hourlyData) {
  if (!elements.wxHourlyGrid) return;
  elements.wxHourlyGrid.innerHTML = "";

  const now = new Date();
  const currentHour = now.getHours();
  let startIdx = hourlyData.time.findIndex((t) => new Date(t).getHours() === currentHour);
  if (startIdx === -1) startIdx = 0;

  for (let i = startIdx; i < startIdx + 9 && i < hourlyData.time.length; i++) {
    const date = new Date(hourlyData.time[i]);
    const hourLabel = i === startIdx ? "Now" : date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
    const temp = Math.round(hourlyData.temperature_2m[i]);
    const code = hourlyData.weather_code[i];
    const precip = hourlyData.precipitation_probability[i];
    const iconClass = getWeatherIconClass(code);

    const item = document.createElement("div");
    item.className = "wx-hourly-item";
    item.innerHTML = `
      <div class="hour">${hourLabel}</div>
      <div class="precip">${precip > 0 ? precip + "%" : ""}</div>
      <i class="fa-solid ${iconClass}"></i>
      <div class="temp">${temp}°</div>
    `;
    elements.wxHourlyGrid.appendChild(item);
  }
}

function renderWeeklyForecast(dailyData) {
  if (!elements.forecastGrid) return;
  elements.forecastGrid.innerHTML = "";

  const todayStr = new Date().toDateString();

  for (let i = 0; i < 7 && i < dailyData.time.length; i++) {
    const date = new Date(dailyData.time[i]);
    const dayName = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
    const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
    const minTemp = Math.round(dailyData.temperature_2m_min[i]);
    const code = dailyData.weather_code[i];
    const iconClass = getWeatherIconClass(code);
    const isToday = date.toDateString() === todayStr;

    const card = document.createElement("div");
    card.className = `wx-day-card wx-glass${isToday ? " today" : ""}`;
    card.innerHTML = `
      <span class="day-name">${dayName}</span>
      <i class="fa-solid ${iconClass}"></i>
      <span class="hi">${maxTemp}°</span>
      <span class="lo">${minTemp}°</span>
    `;
    elements.forecastGrid.appendChild(card);
  }
}

function renderTempChart(hourlyData) {
  if (!elements.wxTempChart) return;

  const now = new Date();
  const currentHour = now.getHours();
  let startIdx = hourlyData.time.findIndex((t) => new Date(t).getHours() === currentHour);
  if (startIdx === -1) startIdx = 0;

  const temps = [];
  for (let i = startIdx; i < startIdx + 12 && i < hourlyData.temperature_2m.length; i++) {
    temps.push(hourlyData.temperature_2m[i]);
  }
  if (temps.length < 2) return;

  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;
  const w = 280;
  const h = 70;
  const pad = 8;

  const points = temps.map((t, i) => {
    const x = pad + (i / (temps.length - 1)) * (w - pad * 2);
    const y = h - pad - ((t - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const lastX = pad + ((temps.length - 1) / (temps.length - 1)) * (w - pad * 2);
  const lastY = h - pad - ((temps[temps.length - 1] - min) / range) * (h - pad * 2);

  elements.wxTempChart.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="wxChartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(255,255,255,0.12)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </linearGradient>
      </defs>
      <polygon points="${points.join(" ")} ${lastX},${h} ${pad},${h}" fill="url(#wxChartGrad)"/>
      <polyline points="${points.join(" ")}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${lastX}" cy="${lastY}" r="3.5" fill="#fafafa"/>
    </svg>
  `;
}

function addToRecentSearches(entry) {
  let recent = AppState.weather.recentSearches.filter(
    (r) => !(Math.abs(r.lat - entry.lat) < 0.01 && Math.abs(r.lon - entry.lon) < 0.01)
  );
  recent.unshift({
    name: entry.name,
    lat: entry.lat,
    lon: entry.lon,
    temp: entry.temp ?? null,
    code: entry.code ?? null
  });
  recent = recent.slice(0, 5);
  AppState.weather.recentSearches = recent;
  localStorage.setItem("weatherRecent", JSON.stringify(recent));
  renderRecentSearches();
}

function renderRecentSearches() {
  if (!elements.wxRecentList) return;
  const recent = AppState.weather.recentSearches;

  if (recent.length === 0) {
    elements.wxRecentList.innerHTML = `<li class="wx-empty-recent">No recent searches</li>`;
    return;
  }

  elements.wxRecentList.innerHTML = "";
  recent.forEach((item) => {
    const iconClass = item.code != null ? getWeatherIconClass(item.code) : "fa-cloud-sun";
    const tempLabel = item.temp != null ? `${item.temp}°` : "—";
    const li = document.createElement("li");
    li.className = "wx-recent-item";
    li.innerHTML = `
      <div class="wx-recent-left">
        <i class="fa-solid ${iconClass}"></i>
        <span>${escapeHTML(item.name)}</span>
      </div>
      <span class="wx-recent-temp">${tempLabel}</span>
    `;
    li.addEventListener("click", () => {
      AppState.weather.lat = item.lat;
      AppState.weather.lon = item.lon;
      AppState.weather.cityName = item.name;
      fetchWeatherReport();
    });
    elements.wxRecentList.appendChild(li);
  });
}