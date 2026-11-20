# To-Do List and Study Planner

A responsive, browser-based planner for organizing coursework, reading, exam preparation, and personal tasks. Add due dates, track completion, filter or search your list, and keep your tasks between visits with your browser's local storage.

## Features

- Add tasks with a title, category, and due date.
- Mark tasks complete or move them back to in progress; delete tasks when they are no longer needed.
- Filter by all, in-progress, or completed tasks and search by title or category.
- See total, completed, and pending task counts.
- Save tasks in `localStorage` so they persist after refresh.
- Get friendly messages for successful actions and validation errors.
- Explore nested study areas, counted recursively.
- Use a responsive interface with accessible form labels and controls.
- Format task dates using Day.js.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript (ES6)
- [Day.js](https://day.js.org/), loaded from its official jsDelivr CDN
- Browser `localStorage`

## Setup and run

1. Open this project folder in Visual Studio Code.
2. Install the **Live Server** extension if it is not already installed.
3. In VS Code, right-click `index.html` and select **Open with Live Server** (or select **Go Live** in the status bar).
4. The planner opens in your browser. The Day.js CDN requires an internet connection; task storage itself is local to your browser.

No build step, package installation, or backend is required. You can also open `index.html` directly in a modern browser, though Live Server is recommended while developing.

## How to use

1. Enter a task name, choose a study area, and select a due date in the **Add a task** form.
2. Select **Add to my planner**. The task appears in the list and is saved automatically.
3. Use a task's checkbox to mark it completed or in progress. Use the × button to delete it.
4. Use the status buttons or search field to find tasks. The statistics update as your list changes.
5. Refresh the browser to confirm that saved tasks are still available on the same browser and device.

## JavaScript concepts

- **`map()`**: `renderTasks()` maps the visible task records to dynamically created task-card elements.
- **`filter()`**: `getVisibleTasks()` filters by status and search text; the statistics also filter completed and pending tasks. Deletion filters out the selected task.
- **`find()`**: `toggleTask()` and `deleteTask()` locate a task by its unique ID before changing it.
- **Recursion**: `countCategoryTopics()` counts the leaf study areas in the multi-level `categoryTree`. A category with no children is the base case and counts as one focus area; categories with children recursively add their descendants. `addCategoryOptions()` also traverses this same tree to populate the category selector. The resulting topic count is shown in the Study areas card.
- **Day.js**: Dates are validated and displayed in a friendly format with Day.js. Invalid saved dates are safely rejected, and malformed local storage does not prevent the application from starting.

## Project structure

```text
CSE310-Module-2/
├── index.html
├── README.md
├── .gitignore
├── CSS/
│   └── style.css
└── JS/
    └── script.js
```

## Screenshot

![Study Planner screenshot placeholder](screenshots/study-planner.png)

Replace the placeholder above with a screenshot of the running application.

## Demonstration video

YouTube demonstration video: **Add your published video link here.**

## Author

Richard Muwonge  
BYU-Idaho CSE310 Module #2