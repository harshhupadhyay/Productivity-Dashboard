function escapeHTML(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[&<>'"]/g,
    tag => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[tag] || tag)
  );
}

function getWeatherIconClass(code) {
  if (code >= 95) return "fa-cloud-bolt";
  if (code >= 80) return "fa-cloud-rain";
  if (code >= 71) return "fa-snowflake";
  if (code >= 51) return "fa-cloud-showers-heavy";
  if (code >= 45) return "fa-smog";
  if (code >= 1) return "fa-cloud-sun";
  return "fa-sun";
}

function getWeatherHeroClass(code) {
  if (code >= 95) return "storm";
  if (code >= 80) return "rain";
  if (code >= 71) return "snow";
  if (code >= 51) return "rain";
  if (code >= 45) return "fog";
  if (code >= 1) return "cloudy";
  return "clear";
}

function getShortCondition(code) {
  if (code >= 95) return "Stormy";
  if (code >= 80) return "Rain showers";
  if (code >= 71) return "Snowy";
  if (code >= 61) return "Rainy";
  if (code >= 51) return "Drizzle";
  if (code >= 45) return "Foggy";
  if (code === 3) return "Overcast";
  if (code === 2) return "Partly cloudy";
  if (code === 1) return "Mainly clear";
  return "Clear";
}

function getWindDirection(degrees) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(degrees / 22.5) % 16];
}

function isDangerousWeather(code, windSpeed) {
  return code >= 95 || code === 65 || code === 82 || code === 75 || code === 99 || windSpeed >= 50;
}

function getWeatherConditionString(code) {
  const weatherMap = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail"
  };

  return weatherMap[code] || "Unknown";
}
