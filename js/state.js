// ==========================================
// CENTRAL APPLICATION STATE
// ==========================================
const AppState = {
  theme: localStorage.getItem("theme") || "dark",
  activeTab: localStorage.getItem("activeTab") || "dashboard",
  todos: JSON.parse(localStorage.getItem("todos")) || [],
  todoFilter: "all",
  planner: JSON.parse(localStorage.getItem("planner")) || {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  },
  goals: JSON.parse(localStorage.getItem("goals")) || [],
  pomodoro: {
    duration: 1500,
    timeLeft: 1500,
    timerId: null,
    currentMode: "focus",
    sessionsCompleted: parseInt(localStorage.getItem("pomodoroSessions")) || 0,
    customFocus: 25,
    customShort: 5,
    customLong: 15
  },
  favoriteQuotes: JSON.parse(localStorage.getItem("favQuotes")) || [],
  currentQuote: null,
  weather: {
    lat: 28.6139,
    lon: 77.2090,
    cityName: "New Delhi, India",
    recentSearches: JSON.parse(localStorage.getItem("weatherRecent")) || []
  }
};

// ==========================================
// DOM SELECTORS
// ==========================================
const elements = {
  themeBtn: document.querySelector("#them-btn"),
  themeIcon: document.querySelector("#icon"),
  themeLabel: document.querySelector("#theme-label"),
  themeOnOff: document.querySelector("#on-off"),
  navItems: document.querySelectorAll(".menu li"),
  sections: document.querySelectorAll(".page-section"),
  dashboardLinks: document.querySelectorAll("[data-link]"),
  globalSearch: document.querySelector("#global-search"),
  headerGreeting: document.querySelector("#greeting"),
  headerDate: document.querySelector("#date"),
  headerTime: document.querySelector(".time"),
  heroGreeting: document.querySelector("#hero-greeting"),
  heroDate: document.querySelector("#hero-date"),
  dashboardTime: document.querySelector("#time"),
  todoForm: document.querySelector(".todo-page .todo-form"),
  todoInput: document.querySelector("#todo-input"),
  todoList: document.querySelector(".todo-page .todo-list"),
  todoCountBadge: document.querySelector("#task-count"),
  todoRemainingSpan: document.querySelector("#remaining-task"),
  clearCompletedBtn: document.querySelector("#clear-completed"),
  todoFilterBtns: document.querySelectorAll(".todo-filter button"),
  widgetTodoList: document.querySelector("#widget-todo-list"),
  widgetTodoStats: document.querySelector("#todo-widget-stats"),
  widgetTodoProgress: document.querySelector("#todo-progress"),
  widgetTodoBadge: document.querySelector("#todo-badge"),
  widgetTodoForm: document.querySelector("#widget-todo-quick-add"),
  stickyNote: document.querySelector("#sticky-note"),
  plannerDayCards: document.querySelectorAll(".planner-day-card"),
  goalsForm: document.querySelector("#new-goal-form"),
  goalTitleInput: document.querySelector("#goal-title"),
  goalCategorySelect: document.querySelector("#goal-category"),
  goalTargetInput: document.querySelector("#goal-target"),
  goalsGrid: document.querySelector("#goals-grid"),
  widgetGoalContent: document.querySelector("#widget-goal-content"),
  timerCountdown: document.querySelector("#timer-countdown"),
  timerLabel: document.querySelector("#timer-label"),
  timerStartBtn: document.querySelector("#timer-start-btn"),
  timerPauseBtn: document.querySelector("#timer-pause-btn"),
  timerResetBtn: document.querySelector("#timer-reset-btn"),
  timerProgressCircle: document.querySelector("#timer-progress"),
  pomodoroModesBtns: document.querySelectorAll(".pomodoro-modes button"),
  pomodoroPresetBtns: document.querySelectorAll(".preset-btn"),
  customTimeVal: document.querySelector("#custom-time-val"),
  applyCustomTimeBtn: document.querySelector("#apply-custom-time"),
  sessionsCountStrong: document.querySelector("#completed-sessions-count"),
  miniTimerDisplay: document.querySelector("#mini-timer-display"),
  miniTimerMode: document.querySelector("#mini-timer-mode"),
  miniTimerStartBtn: document.querySelector("#mini-timer-start-btn"),
  miniTimerResetBtn: document.querySelector("#mini-timer-reset-btn"),
  weatherSearchForm: document.querySelector("#weather-search-form"),
  weatherSearchInput: document.querySelector("#weather-search-input"),
  pageWeatherCity: document.querySelector("#page-weather-city"),
  pageWeatherCondition: document.querySelector("#page-weather-condition"),
  pageWeatherTemp: document.querySelector("#page-weather-temp"),
  pageWeatherApparent: document.querySelector("#page-weather-apparent"),
  pageWeatherHumidity: document.querySelector("#page-weather-humidity"),
  pageWeatherWind: document.querySelector("#page-weather-wind"),
  forecastGrid: document.querySelector("#forecast-cards-grid"),
  wxHero: document.querySelector("#wx-hero"),
  wxHeroSub: document.querySelector("#wx-hero-sub"),
  wxHigh: document.querySelector("#wx-high"),
  wxLow: document.querySelector("#wx-low"),
  wxHourlyGrid: document.querySelector("#wx-hourly-grid"),
  wxTempChart: document.querySelector("#wx-temp-chart"),
  wxPressure: document.querySelector("#wx-pressure"),
  wxDangerBadge: document.querySelector("#wx-danger-badge"),
  wxRecentList: document.querySelector("#wx-recent-list"),
  wxClearRecent: document.querySelector("#wx-clear-recent"),
  wxWindSpeedLabel: document.querySelector("#wx-wind-speed-label"),
  wxWindDirLabel: document.querySelector("#wx-wind-dir-label"),
  wxWindArrow: document.querySelector("#wx-wind-arrow"),
  wxLastUpdated: document.querySelector("#wx-last-updated"),
  wxPageDate: document.querySelector("#wx-page-date"),
  wxSearchToggle: document.querySelector("#wx-search-toggle"),
  wxRefreshBtn: document.querySelector("#wx-refresh-btn"),
  weatherTemp: document.querySelector("#temperature"),
  weatherCondition: document.querySelector("#condition"),
  weatherCity: document.querySelector("#city"),
  weatherHumidityVal: document.querySelector("#weather-humidity-val"),
  weatherWindSpeed: document.querySelector("#weather-wind-speed"),
  weatherApparent: document.querySelector("#weather-apparent"),
  weatherCompactHumidity: document.querySelector("#humidity"),
  weatherCompactWind: document.querySelector("#wind"),
  quoteText: document.querySelector("#page-quote-text"),
  quoteAuthor: document.querySelector("#page-quote-author"),
  copyQuoteBtn: document.querySelector("#copy-quote-btn"),
  favQuoteBtn: document.querySelector("#fav-quote-btn"),
  nextQuoteBtn: document.querySelector("#next-quote-btn"),
  quoteTabs: document.querySelectorAll(".quotes-tabs button"),
  quoteDisplayCard: document.querySelector("#quote-display-card"),
  quoteFavoritesSection: document.querySelector("#favorite-quotes-list-section"),
  favoritesList: document.querySelector("#favorites-list"),
  widgetQuoteText: document.querySelector("#widget-quote p"),
  widgetQuoteAuthor: document.querySelector("#widget-quote cite"),
  menuToggleBtn: document.querySelector("#menu-toggle-btn"),
  sidebarOverlay: document.querySelector("#sidebar-overlay"),
  sidebar: document.querySelector(".sidebar"),
  dashboardWeatherIcon: document.querySelector("#dashboard-weather-icon"),
  pageWeatherIcon: document.querySelector("#page-weather-icon")
};

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initRouter();
  initClock();
  initWeather();
  initTodos();
  initNotes();
  initPlanner();
  initGoals();
  initPomodoro();
  initQuotes();
  initSearch();
});
