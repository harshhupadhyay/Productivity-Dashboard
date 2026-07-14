// ==========================================
// INSPIRATIONAL QUOTES HUB
// ==========================================
const builtInQuotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Your talent determines what you can do. Your motivation determines how much you are willing to do.", author: "Lou Holtz" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." }
];

function initQuotes() {
  elements.quoteTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      elements.quoteTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      if (tab.id === "tab-all-quotes") {
        elements.quoteDisplayCard.classList.remove("hidden");
        elements.quoteFavoritesSection.classList.add("hidden");
      } else {
        elements.quoteDisplayCard.classList.add("hidden");
        elements.quoteFavoritesSection.classList.remove("hidden");
        renderFavoritesList();
      }
    });
  });

  elements.nextQuoteBtn.addEventListener("click", displayRandomQuote);

  elements.copyQuoteBtn.addEventListener("click", () => {
    if (!AppState.currentQuote) return;
    const format = `"${AppState.currentQuote.text}" - ${AppState.currentQuote.author}`;
    navigator.clipboard.writeText(format)
      .then(() => {
        const origText = elements.copyQuoteBtn.innerHTML;
        elements.copyQuoteBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        setTimeout(() => elements.copyQuoteBtn.innerHTML = origText, 1500);
      })
      .catch(err => console.error("Clipboard copy failed:", err));
  });

  elements.favQuoteBtn.addEventListener("click", toggleFavoriteQuoteItem);
  displayRandomQuote();
}

function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * builtInQuotes.length);
  AppState.currentQuote = builtInQuotes[randomIndex];

  elements.quoteText.textContent = `"${AppState.currentQuote.text}"`;
  elements.quoteAuthor.textContent = `— ${AppState.currentQuote.author}`;
  elements.widgetQuoteText.textContent = `"${AppState.currentQuote.text}"`;
  elements.widgetQuoteAuthor.textContent = `— ${AppState.currentQuote.author}`;

  updateFavoriteHeartIconState();
}

function updateFavoriteHeartIconState() {
  const isFav = AppState.favoriteQuotes.some(q => q.text === AppState.currentQuote.text);
  const heartIcon = elements.favQuoteBtn.querySelector("i");
  if (isFav) {
    heartIcon.className = "fa-solid fa-heart";
    elements.favQuoteBtn.style.color = "var(--danger)";
  } else {
    heartIcon.className = "fa-regular fa-heart";
    elements.favQuoteBtn.style.color = "";
  }
}

function toggleFavoriteQuoteItem() {
  const current = AppState.currentQuote;
  if (!current) return;

  const favIndex = AppState.favoriteQuotes.findIndex(q => q.text === current.text);
  if (favIndex === -1) {
    AppState.favoriteQuotes.push(current);
  } else {
    AppState.favoriteQuotes.splice(favIndex, 1);
  }

  localStorage.setItem("favQuotes", JSON.stringify(AppState.favoriteQuotes));
  updateFavoriteHeartIconState();
  renderFavoritesList();
}

function renderFavoritesList() {
  elements.favoritesList.innerHTML = "";

  if (AppState.favoriteQuotes.length === 0) {
    elements.favoritesList.innerHTML = `<p class="empty-msg">Nothing saved yet.</p>`;
  } else {
    AppState.favoriteQuotes.forEach((quote, index) => {
      const li = document.createElement("li");
      li.className = "fav-quote-item";
      li.innerHTML = `
        <div>
          <p>"${escapeHTML(quote.text)}"</p>
          <span>— ${escapeHTML(quote.author)}</span>
        </div>
        <button class="delete-fav-btn" data-index="${index}" title="Remove Favorite" style="color: var(--danger);">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;

      li.querySelector(".delete-fav-btn").addEventListener("click", () => {
        AppState.favoriteQuotes.splice(index, 1);
        localStorage.setItem("favQuotes", JSON.stringify(AppState.favoriteQuotes));
        renderFavoritesList();
        updateFavoriteHeartIconState();
      });

      elements.favoritesList.appendChild(li);
    });
  }
}

// ==========================================
// SEARCH FILTERS MANAGER (⌘K / Search Bar)
// ==========================================
function initSearch() {
  elements.globalSearch.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (AppState.activeTab === "todo") {
      filterTodoListByQuery(query);
    } else if (AppState.activeTab === "planner") {
      filterPlannerListByQuery(query);
    } else if (AppState.activeTab === "goals") {
      filterGoalsByQuery(query);
    } else if (AppState.activeTab === "dashboard") {
      filterDashboardWidgetsByQuery(query);
    }
  });

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      elements.globalSearch.focus();
    }
  });
}

function filterTodoListByQuery(query) {
  const items = elements.todoList.querySelectorAll(".todo-item");
  items.forEach(item => {
    const text = item.querySelector("span").textContent.toLowerCase();
    if (text.includes(query)) {
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  });
}

function filterPlannerListByQuery(query) {
  elements.plannerDayCards.forEach(card => {
    const items = card.querySelectorAll(".planner-item");
    items.forEach(item => {
      const text = item.querySelector("span").textContent.toLowerCase();
      if (text.includes(query)) {
        item.classList.remove("hidden");
      } else {
        item.classList.add("hidden");
      }
    });
  });
}

function filterGoalsByQuery(query) {
  const items = elements.goalsGrid.querySelectorAll(".goal-card");
  items.forEach(item => {
    const text = item.querySelector("h3").textContent.toLowerCase();
    if (text.includes(query)) {
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  });
}

function filterDashboardWidgetsByQuery(query) {
  const todoItems = elements.widgetTodoList.querySelectorAll(".widget-todo-item");
  todoItems.forEach(item => {
    const text = item.querySelector("span").textContent.toLowerCase();
    if (text.includes(query)) {
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  });

  const goalItems = elements.widgetGoalContent.querySelectorAll(".widget-goal-item");
  goalItems.forEach(item => {
    const text = item.querySelector("span").textContent.toLowerCase();
    if (text.includes(query)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}
