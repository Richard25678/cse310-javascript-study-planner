// Nested categories power the form options and the recursive study-area count.
const categoryTree = [
  {
    name: "Academics",
    children: [
      { name: "Coursework", children: [{ name: "Assignments" }, { name: "Reading" }] },
      { name: "Exam preparation" }
    ]
  },
  {
    name: "Personal",
    children: [
      { name: "Wellbeing" },
      { name: "Planning", children: [{ name: "Errands" }] }
    ]
  }
];

const STORAGE_KEY = "studyplan.tasks.v1";
const taskForm = document.querySelector("#new-task-form");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const message = document.querySelector("#app-message");
const searchInput = document.querySelector("#task-search");
const categorySelect = document.querySelector("#task-category");
const dateInput = document.querySelector("#task-date");
const filterButtons = document.querySelectorAll(".filter-button");

let tasks = loadTasks();
let activeFilter = "all";
let messageTimer;

// Count leaf categories. A leaf has no children, which is the base case;
// every other category adds the counts returned by its recursive child calls.
function countCategoryTopics(category) {
  const children = Array.isArray(category.children) ? category.children : [];
  if (children.length === 0) {
    return 1;
  }
  return children.reduce((count, child) => count + countCategoryTopics(child), 0);
}

// Add each leaf category to the selector and recurse through nested groups.
function addCategoryOptions(categories) {
  categories.forEach((category) => {
    const children = Array.isArray(category.children) ? category.children : [];
    if (children.length > 0) {
      addCategoryOptions(children);
      return;
    }

    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    categorySelect.append(option);
  });
}

// Confirm a date is a real YYYY-MM-DD date before displaying or saving it.
function isValidDate(dateString) {
  if (typeof dateString !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  const parsedDate = dayjs(dateString);
  return parsedDate.isValid() && parsedDate.format("YYYY-MM-DD") === dateString;
}

// Read saved tasks safely, ignoring malformed records rather than breaking startup.
function loadTasks() {
  try {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (!storedTasks) {
      return [];
    }

    const parsedTasks = JSON.parse(storedTasks);
    if (!Array.isArray(parsedTasks)) {
      console.warn("Saved planner data is not a task list; starting with an empty planner.");
      return [];
    }

    return parsedTasks.filter((task) => (
      task &&
      typeof task.id === "string" &&
      typeof task.title === "string" &&
      task.title.trim().length > 0 &&
      typeof task.category === "string" &&
      isValidDate(task.date) &&
      typeof task.completed === "boolean"
    )).map((task) => ({
      id: task.id,
      title: task.title.trim(),
      category: task.category,
      date: task.date,
      completed: task.completed
    }));
  } catch (error) {
    console.warn("Could not read saved planner tasks. The planner will start empty.", error);
    return [];
  }
}

// Persist the current task list and report storage problems in the developer console.
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn("Could not save planner tasks to local storage.", error);
    showMessage("Your browser could not save these changes.", true);
  }
}

// Announce an action in the live region, clearing the message after a short delay.
function showMessage(text, isError) {
  window.clearTimeout(messageTimer);
  message.textContent = text;
  message.classList.toggle("error", Boolean(isError));
  messageTimer = window.setTimeout(() => {
    message.textContent = "";
    message.classList.remove("error");
  }, 3500);
}

// Format known-valid dates with Day.js, while keeping unexpected values harmless.
function formatTaskDate(dateString) {
  if (!isValidDate(dateString)) {
    return "Date unavailable";
  }
  return dayjs(dateString).format("MMM D, YYYY");
}

// Build one accessible task card using DOM methods and safe text content.
function createTaskCard(task) {
  const article = document.createElement("article");
  article.className = `task-card${task.completed ? " is-completed" : ""}`;
  article.dataset.taskId = task.id;

  const checkbox = document.createElement("input");
  checkbox.className = "task-check";
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.dataset.action = "toggle";
  checkbox.setAttribute("aria-label", `${task.completed ? "Mark incomplete" : "Mark complete"}: ${task.title}`);

  const copy = document.createElement("div");
  copy.className = "task-copy";
  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "task-meta";
  const category = document.createElement("span");
  category.className = "category-badge";
  category.textContent = task.category;
  const dueDate = document.createElement("time");
  dueDate.className = "task-date";
  dueDate.dateTime = isValidDate(task.date) ? task.date : "";
  dueDate.textContent = formatTaskDate(task.date);
  if (!task.completed && isValidDate(task.date) && dayjs(task.date).isBefore(dayjs(), "day")) {
    dueDate.classList.add("overdue");
    dueDate.textContent = `Overdue · ${dueDate.textContent}`;
  }
  meta.append(category, dueDate);
  copy.append(title, meta);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.setAttribute("aria-label", `Delete task: ${task.title}`);
  deleteButton.textContent = "×";

  article.append(checkbox, copy, deleteButton);
  return article;
}

// Return the currently visible tasks using filter for status and search matching.
function getVisibleTasks() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  return tasks.filter((task) => {
    const matchesStatus = activeFilter === "all" ||
      (activeFilter === "completed" && task.completed) ||
      (activeFilter === "pending" && !task.completed);
    const matchesSearch = !searchTerm ||
      task.title.toLowerCase().includes(searchTerm) ||
      task.category.toLowerCase().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });
}

// Map task data into DOM cards and refresh the empty state, task count, and statistics.
function renderTasks() {
  const visibleTasks = getVisibleTasks();
  const cards = visibleTasks.map((task) => createTaskCard(task));
  taskList.replaceChildren(...cards);
  emptyState.hidden = cards.length > 0;
  document.querySelector("#total-count").textContent = String(tasks.length);
  document.querySelector("#completed-count").textContent =
    String(tasks.filter((task) => task.completed).length);
  document.querySelector("#pending-count").textContent =
    String(tasks.filter((task) => !task.completed).length);
  document.querySelector("#task-total-pill").textContent =
    `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

  const noTasks = tasks.length === 0;
  document.querySelector("#empty-title").textContent = noTasks
    ? "Your next win starts here"
    : "No tasks match this view";
  document.querySelector("#empty-description").textContent = noTasks
    ? "Add a task to turn your plans into progress."
    : "Try another filter or search for something else.";
}

// Create a unique identifier for new tasks, with a fallback for older browsers.
function createTaskId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Validate and add a task, then persist it and return focus to the task-name field.
function handleTaskSubmit(event) {
  event.preventDefault();
  const titleInput = document.querySelector("#task-title");
  const title = titleInput.value.trim();
  const date = dateInput.value;
  const category = categorySelect.value;

  if (!title) {
    showMessage("Please enter a task name before adding it.", true);
    titleInput.focus();
    return;
  }
  if (!isValidDate(date)) {
    showMessage("Please choose a valid due date.", true);
    dateInput.focus();
    return;
  }
  if (!category) {
    showMessage("Please choose a category for this task.", true);
    categorySelect.focus();
    return;
  }

  tasks.unshift({ id: createTaskId(), title, category, date, completed: false });
  saveTasks();
  taskForm.reset();
  renderTasks();
  showMessage(`“${title}” was added to your planner.`, false);
  titleInput.focus();
}

// Find a task by its unique ID and toggle its completion state.
function toggleTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) {
    showMessage("That task could not be found. Please refresh and try again.", true);
    return;
  }
  task.completed = !task.completed;
  saveTasks();
  renderTasks();
  showMessage(task.completed ? `“${task.title}” completed. Nice work!` : `“${task.title}” is back in progress.`, false);
}

// Find a task by its unique ID, remove it, and announce the deletion.
function deleteTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) {
    showMessage("That task could not be found. Please refresh and try again.", true);
    return;
  }
  tasks = tasks.filter((item) => item.id !== taskId);
  saveTasks();
  renderTasks();
  showMessage(`“${task.title}” was deleted from your planner.`, false);
}

// Route checkbox and delete-button actions through one delegated task-list handler.
function handleTaskListClick(event) {
  const actionElement = event.target.closest("[data-action]");
  const taskCard = event.target.closest("[data-task-id]");
  if (!actionElement || !taskCard || !taskList.contains(actionElement)) {
    return;
  }
  if (actionElement.dataset.action === "toggle") {
    toggleTask(taskCard.dataset.taskId);
  } else if (actionElement.dataset.action === "delete") {
    deleteTask(taskCard.dataset.taskId);
  }
}

// Set the active status filter and keep its button state accessible.
function handleFilterClick(event) {
  activeFilter = event.currentTarget.dataset.filter;
  filterButtons.forEach((button) => {
    const isActive = button === event.currentTarget;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  renderTasks();
}

// Initialize category choices, date context, and all event listeners.
function initializePlanner() {
  addCategoryOptions(categoryTree);
  document.querySelector("#category-topic-count").textContent = String(
    categoryTree.reduce((count, category) => count + countCategoryTopics(category), 0)
  );
  document.querySelector("#today-label").textContent = dayjs().format("dddd, MMM D");
  filterButtons.forEach((button) => button.addEventListener("click", handleFilterClick));
  taskForm.addEventListener("submit", handleTaskSubmit);
  taskList.addEventListener("click", handleTaskListClick);
  searchInput.addEventListener("input", renderTasks);
  renderTasks();
}

initializePlanner();