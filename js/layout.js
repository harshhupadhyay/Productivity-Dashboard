// ==========================================
// THEME MANAGER
// ==========================================
function initTheme() {
  applyTheme(AppState.theme);

  elements.themeBtn.addEventListener("click", () => {
    const newTheme = document.body.classList.contains("light") ? "dark" : "light";
    AppState.theme = newTheme;
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  });
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.remove("light");
    elements.themeIcon.className = "fa-solid fa-moon";
    elements.themeOnOff.className = "fa-solid fa-toggle-on";
    if (elements.themeLabel) elements.themeLabel.textContent = "Dark mode";
  } else {
    document.body.classList.add("light");
    elements.themeIcon.className = "fa-solid fa-sun";
    elements.themeOnOff.className = "fa-solid fa-toggle-off";
    if (elements.themeLabel) elements.themeLabel.textContent = "Light mode";
  }
}

// ==========================================
// ROUTER & NAVIGATION
// ==========================================
function initRouter() {
  if (elements.menuToggleBtn && elements.sidebar && elements.sidebarOverlay) {
    elements.menuToggleBtn.addEventListener("click", () => {
      elements.sidebar.classList.toggle("open");
      elements.sidebarOverlay.classList.toggle("active");
    });

    elements.sidebarOverlay.addEventListener("click", () => {
      elements.sidebar.classList.remove("open");
      elements.sidebarOverlay.classList.remove("active");
    });
  }

  elements.navItems.forEach(item => {
    item.addEventListener("click", () => {
      const pageId = item.getAttribute("data-page");
      switchTab(pageId);

      if (elements.sidebar && elements.sidebarOverlay) {
        elements.sidebar.classList.remove("open");
        elements.sidebarOverlay.classList.remove("active");
      }
    });
  });

  elements.dashboardLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pageId = link.getAttribute("data-link");
      switchTab(pageId);
    });
  });

  switchTab(AppState.activeTab);
}

function switchTab(pageId) {
  AppState.activeTab = pageId;
  localStorage.setItem("activeTab", pageId);

  elements.navItems.forEach(item => {
    if (item.getAttribute("data-page") === pageId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  elements.sections.forEach(section => {
    if (section.id === pageId) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  });

  document.body.classList.toggle("weather-active", pageId === "weather");
  if (pageId === "weather") updateWxPageDate();
}

// ==========================================
// DATE & CLOCK UPDATES
// ==========================================
function initClock() {
  function tick() {
    const now = new Date();
    const timeOptions = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true };
    const timeString = now.toLocaleTimeString("en-US", timeOptions);
    const dateOptions = { weekday: "long", month: "long", day: "numeric" };
    const dateString = now.toLocaleDateString("en-US", dateOptions);

    const hour = now.getHours();
    let greetingText = "Good night";
    if (hour < 5) {
      greetingText = "Good night";
    } else if (hour < 12) {
      greetingText = "Good morning";
    } else if (hour < 17) {
      greetingText = "Good afternoon";
    } else if (hour < 21) {
      greetingText = "Good evening";
    }

    if (elements.headerTime) elements.headerTime.textContent = timeString;
    if (elements.headerDate) elements.headerDate.textContent = dateString;
    if (elements.headerGreeting) elements.headerGreeting.textContent = greetingText;

    if (elements.dashboardTime) elements.dashboardTime.textContent = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    if (elements.heroDate) elements.heroDate.textContent = dateString;
    if (elements.heroGreeting) elements.heroGreeting.textContent = greetingText;
  }

  tick();
  setInterval(tick, 1000);
}
