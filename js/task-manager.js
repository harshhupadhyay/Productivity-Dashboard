// ==========================================
// TODO LIST MANAGER
// ==========================================
function initTodos() {
  elements.todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const taskText = elements.todoInput.value.trim();
    if (taskText) {
      addTodoItem(taskText);
      elements.todoInput.value = "";
    }
  });

  elements.widgetTodoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const quickInput = elements.widgetTodoForm.querySelector("input");
    const taskText = quickInput.value.trim();
    if (taskText) {
      addTodoItem(taskText);
      quickInput.value = "";
    }
  });

  elements.todoList.addEventListener("click", (e) => {
    const target = e.target;
    const itemEl = target.closest(".todo-item");
    if (!itemEl) return;
    const todoId = parseInt(itemEl.getAttribute("data-id"));

    if (target.type === "checkbox") {
      toggleTodoItem(todoId);
    }

    if (target.closest(".delete-btn")) {
      deleteTodoItem(todoId);
    }
  });

  elements.widgetTodoList.addEventListener("click", (e) => {
    const target = e.target;
    const itemEl = target.closest(".widget-todo-item");
    if (!itemEl) return;
    const todoId = parseInt(itemEl.getAttribute("data-id"));

    if (target.type === "checkbox") {
      toggleTodoItem(todoId);
    }
  });

  elements.todoFilterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      elements.todoFilterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      AppState.todoFilter = btn.getAttribute("data-filter");
      renderTodosList();
    });
  });

  elements.clearCompletedBtn.addEventListener("click", () => {
    AppState.todos = AppState.todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodosList();
    renderDashboardTodoWidget();
  });

  renderTodosList();
  renderDashboardTodoWidget();
}

function addTodoItem(taskText) {
  const newTodo = { id: Date.now(), text: taskText, completed: false };
  AppState.todos.push(newTodo);
  saveTodos();
  renderTodosList();
  renderDashboardTodoWidget();
}

function toggleTodoItem(id) {
  const todo = AppState.todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodosList();
    renderDashboardTodoWidget();
  }
}

function deleteTodoItem(id) {
  AppState.todos = AppState.todos.filter(t => t.id !== id);
  saveTodos();
  renderTodosList();
  renderDashboardTodoWidget();
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(AppState.todos));
}

function renderTodosList() {
  elements.todoList.innerHTML = "";

  let filtered = AppState.todos;
  if (AppState.todoFilter === "active") {
    filtered = AppState.todos.filter(todo => !todo.completed);
  } else if (AppState.todoFilter === "completed") {
    filtered = AppState.todos.filter(todo => todo.completed);
  }

  if (filtered.length === 0) {
    elements.todoList.innerHTML = `<p class="empty-msg">No tasks found in this view.</p>`;
  } else {
    filtered.forEach(todo => {
      const li = document.createElement("li");
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      li.setAttribute("data-id", todo.id);
      li.innerHTML = `
        <label>
          <input type="checkbox" ${todo.completed ? 'checked' : ''} />
          <span>${escapeHTML(todo.text)}</span>
        </label>
        <button class="delete-btn" aria-label="Delete task">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      elements.todoList.appendChild(li);
    });
  }

  const total = AppState.todos.length;
  const remaining = AppState.todos.filter(todo => !todo.completed).length;
  elements.todoCountBadge.textContent = `${total} task${total !== 1 ? "s" : ""}`;
  elements.todoRemainingSpan.textContent = `${remaining} remaining`;
}

function renderDashboardTodoWidget() {
  elements.widgetTodoList.innerHTML = "";

  const activeTodos = AppState.todos.filter(todo => !todo.completed);
  const totalCount = AppState.todos.length;
  const completedCount = AppState.todos.filter(todo => todo.completed).length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  elements.widgetTodoProgress.style.width = `${percentage}%`;
  elements.widgetTodoStats.textContent = `${completedCount}/${totalCount} completed`;
  elements.widgetTodoBadge.textContent = activeTodos.length;

  if (activeTodos.length === 0) {
    elements.widgetTodoList.innerHTML = `<p class="empty-msg">All caught up.</p>`;
  } else {
    activeTodos.slice(0, 3).forEach(todo => {
      const li = document.createElement("li");
      li.className = "widget-todo-item";
      li.setAttribute("data-id", todo.id);
      li.innerHTML = `
        <label>
          <input type="checkbox" />
          <span>${escapeHTML(todo.text)}</span>
        </label>
      `;
      elements.widgetTodoList.appendChild(li);
    });
  }
}

// ==========================================
// QUICK NOTES STICKY NOTE
// ==========================================
function initNotes() {
  const savedNotes = localStorage.getItem("stickyNote") || "";
  elements.stickyNote.value = savedNotes;

  elements.stickyNote.addEventListener("input", (e) => {
    localStorage.setItem("stickyNote", e.target.value);
  });
}

// ==========================================
// WEEKLY PLANNER
// ==========================================
function initPlanner() {
  elements.plannerDayCards.forEach(card => {
    const day = card.getAttribute("data-day");
    const form = card.querySelector(".planner-add-form");
    const list = card.querySelector(".planner-task-list");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const text = input.value.trim();
      if (text) {
        addPlannerItem(day, text);
        input.value = "";
      }
    });

    list.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest(".planner-delete-btn");
      if (deleteBtn) {
        const itemIdx = parseInt(deleteBtn.getAttribute("data-index"));
        deletePlannerItem(day, itemIdx);
      }
    });
  });

  renderPlanner();
}

function addPlannerItem(day, text) {
  AppState.planner[day].push(text);
  savePlanner();
  renderPlanner();
}

function deletePlannerItem(day, index) {
  AppState.planner[day].splice(index, 1);
  savePlanner();
  renderPlanner();
}

function savePlanner() {
  localStorage.setItem("planner", JSON.stringify(AppState.planner));
}

function renderPlanner() {
  elements.plannerDayCards.forEach(card => {
    const day = card.getAttribute("data-day");
    const list = card.querySelector(".planner-task-list");
    const badge = card.querySelector(".day-count");

    const items = AppState.planner[day] || [];
    badge.textContent = items.length;

    list.innerHTML = "";

    if (items.length === 0) {
      list.innerHTML = `<p class="empty-msg" style="padding: 10px 0; font-size: 0.8rem;">Clear schedule</p>`;
    } else {
      items.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "planner-item";
        li.innerHTML = `
          <span>${escapeHTML(item)}</span>
          <button class="planner-delete-btn" data-index="${index}" aria-label="Delete schedule">
            <i class="fa-solid fa-xmark"></i>
          </button>
        `;
        list.appendChild(li);
      });
    }
  });
}

// ==========================================
// GOALS TRACKER
// ==========================================
function initGoals() {
  elements.goalsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = elements.goalTitleInput.value.trim();
    const category = elements.goalCategorySelect.value;
    const target = parseInt(elements.goalTargetInput.value);

    if (title && target > 0) {
      addGoalItem(title, category, target);
      elements.goalTitleInput.value = "";
      elements.goalTargetInput.value = "";
    }
  });

  elements.goalsGrid.addEventListener("click", (e) => {
    const target = e.target;
    const goalCard = target.closest(".goal-card");
    if (!goalCard) return;
    const goalId = parseInt(goalCard.getAttribute("data-id"));

    if (target.closest(".goal-btn-inc")) {
      incrementGoalItem(goalId);
    }

    if (target.closest(".goal-btn-del")) {
      deleteGoalItem(goalId);
    }
  });

  renderGoals();
}

function addGoalItem(title, category, target) {
  const newGoal = { id: Date.now(), title: title, category: category, target: target, current: 0 };
  AppState.goals.push(newGoal);
  saveGoals();
  renderGoals();
}

function incrementGoalItem(id) {
  const goal = AppState.goals.find(g => g.id === id);
  if (goal) {
    if (goal.current < goal.target) {
      goal.current++;
      saveGoals();
      renderGoals();
    }
  }
}

function deleteGoalItem(id) {
  AppState.goals = AppState.goals.filter(g => g.id !== id);
  saveGoals();
  renderGoals();
}

function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(AppState.goals));
}

function renderGoals() {
  elements.goalsGrid.innerHTML = "";

  if (AppState.goals.length === 0) {
    elements.goalsGrid.innerHTML = `<p class="empty-msg" style="grid-column: 1 / -1;">No goals setup yet. Add a new goal to start tracking progress.</p>`;
  } else {
    AppState.goals.forEach(goal => {
      const percentage = Math.min(Math.round((goal.current / goal.target) * 100), 100);
      const isCompleted = goal.current >= goal.target;

      const div = document.createElement("div");
      div.className = "goal-card card";
      div.setAttribute("data-id", goal.id);
      div.innerHTML = `
        <div class="goal-card-header">
          <div class="goal-title-group">
            <h3>${escapeHTML(goal.title)}</h3>
            <span class="goal-category-badge">${goal.category}</span>
          </div>
          ${isCompleted ? '<span class="badge" style="background: var(--success-light); color: var(--success);">Complete</span>' : ''}
        </div>
        <div class="goal-progress-info">
          <span>Progress</span>
          <strong>${goal.current} / ${goal.target} (${percentage}%)</strong>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${percentage}%; background: ${isCompleted ? 'var(--success)' : 'var(--accent)'}"></div>
        </div>
        <div class="goal-actions">
          <button class="goal-btn-inc" ${isCompleted ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
            <i class="fa-solid fa-plus"></i> Log Progress
          </button>
          <button class="goal-btn-del" title="Delete Goal">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
      elements.goalsGrid.appendChild(div);
    });
  }

  renderDashboardGoalsWidget();
}

function renderDashboardGoalsWidget() {
  elements.widgetGoalContent.innerHTML = "";

  if (AppState.goals.length === 0) {
    elements.widgetGoalContent.innerHTML = `<p class="empty-msg">No active goals yet.</p>`;
  } else {
    AppState.goals.slice(0, 2).forEach(goal => {
      const percentage = Math.min(Math.round((goal.current / goal.target) * 100), 100);
      const div = document.createElement("div");
      div.className = "widget-goal-item";
      div.innerHTML = `
        <div class="widget-goal-info">
          <span>${escapeHTML(goal.title)}</span>
          <strong>${goal.current}/${goal.target}</strong>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${percentage}%; background: ${goal.current >= goal.target ? 'var(--success)' : 'var(--accent)'}"></div>
        </div>
      `;
      elements.widgetGoalContent.appendChild(div);
    });
  }
}
