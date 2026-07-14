# Desk - Personal Productivity Dashboard

Desk is a front-end productivity dashboard for managing tasks, planning the week, tracking goals, staying focused with Pomodoro timers, checking live weather, and browsing inspirational quotes in one workspace.

## Features

- Task manager with add, complete, delete, and filter actions.
- Dashboard task widget with quick add and progress summary.
- Weekly planner for organizing items across Monday to Sunday.
- Goals tracker with progress logging and completion states.
- Pomodoro timer with focus, short break, and long break modes.
- Quick sticky note that auto-saves in the browser.
- Weather experience powered by live forecast data and recent searches.
- Inspirational quotes with copy, save, and browse views.
- Global search to filter items in the current section.
- Light and dark theme toggle.

## Project Structure

```text
Productivity-Dashboard-main/
|-- index.html
|-- style.css
|-- weather.css
|-- README.md
|-- js/
|   |-- state.js
|   |-- shared.js
|   |-- layout.js
|   |-- task-manager.js
|   |-- pomodoro.js
|   |-- weather.js
|   `-- quotes-search.js
`-- assets/
```

## How To Run

1. Open the project folder in VS Code or any editor.
2. Open `index.html` in a browser.
3. Use the dashboard normally. No build step is required.

## Notes

- The app stores user data in `localStorage` for persistence.
- Weather features require an active internet connection.
- The app is fully client-side and does not need a backend.

## Tech Stack

- HTML
- CSS
- JavaScript
- Font Awesome
- Open-Meteo weather API
- Nominatim geocoding API
