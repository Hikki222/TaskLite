const inputAdd = document.getElementById("addInp");
const searchInp = document.getElementById("searchTask");
const tasksElem = document.querySelector(".tasks");
const taskForm = document.querySelector(".addTask");
const sortSelector = document.querySelector(".sort-select");
const filterSelector = document.querySelector(".filter-select");

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let sortMode = "newest";
let nextId = tasks.length > 0
? Math.max(...tasks.map((t) =>t.id)) + 1 
: 1;
let currentFilter = "all"; 

// Отправка формы
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask();
});

// Сортировка
sortSelector.addEventListener("change", (event) => {
  sortMode = event.target.value;
  renderTasks();
});

// Шаг 4: Поиск в реальном времени
searchInp.addEventListener("input", () => {
  renderTasks();
});

// Шаг 5–7: Вкладки фильтров
const filterButtons = document.querySelectorAll(".filter-btn");
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Шаг 5: переключение подсветки
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Шаг 6: определение фильтра по тексту кнопки
    const text = btn.textContent.trim().toLowerCase();
    if (text === "активные") currentFilter = "active";
    else if (text === "выполненные") currentFilter = "completed";
    else currentFilter = "all";

    // Шаг 7: перерисовка
    renderTasks();
  });
});

// Добавление задачи
function addTask() {
  const inputTask = inputAdd.value.trim();

  if (inputTask === "") {
    inputAdd.classList.add("error");
    return;
  }

  inputAdd.classList.remove("error");

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  tasks.push({
    id: nextId++,
    title: inputTask,
    done: false,
    date: `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`,
    time: `${hours}:${minutes}`
  });
  saveTasks();
  inputAdd.value = "";
  renderTasks();
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.classList.add("card");

  if (task.done) {
    card.classList.add("task-done");
  }

  card.addEventListener("click", (event) => {
    if (!event.target.closest(".task-actions")) {
      task.done = !task.done;
      saveTasks();
      renderTasks();
    }
  });

  const taskName = document.createElement("div");
  taskName.classList.add("task-name");
  taskName.innerHTML = `<h3 class="card-title">${task.title}</h3>`;

  const taskDate = document.createElement("span");
  taskDate.classList.add("task-date");
  taskDate.textContent = `${task.date} | ${task.time}`;
  taskName.append(taskDate);

  card.append(taskName);
  card.append(createTaskActions(task));

  return card;
}

// Создание кнопок действий
function createTaskActions(task) {
  const taskActions = document.createElement("div");
  taskActions.classList.add("task-actions");

  const btnEdit = createButton(
    "edit-button",
    `<svg class="task__icon" viewBox="0 0 24 24" fill="none" stroke="#6f64a3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>`
  );

  btnEdit.addEventListener("click", (event) => {
    event.stopPropagation();
    const newText = prompt("Введите новый текст:", task.title);
    if (newText !== null && newText.trim() !== "") {
      task.title = newText.trim();
      saveTasks();
      renderTasks();
    }
  });

  const btnDelete = createButton(
    "delete-button",
    `<svg class="task__icon" viewBox="0 0 24 24" fill="none" stroke="#cb6e6e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
      <path d="M10 11v6"></path>
      <path d="M14 11v6"></path>
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
    </svg>`
  );

  btnDelete.addEventListener("click", (event) => {
    event.stopPropagation();
    tasks = tasks.filter((t) => t.id !== task.id);
    saveTasks();
    renderTasks();
  });

  taskActions.append(btnEdit, btnDelete);
  return taskActions;
}

function createButton(className, innerHTML) {
  const button = document.createElement("button");
  button.classList.add(className);
  button.innerHTML = innerHTML;
  return button;
}

// Единая функция рендера (Шаги 2, 3, 8)
function renderTasks() {
  const searchText = searchInp.value.trim().toLowerCase();

  // Шаг 2: фильтрация по статусу
  let filtered = tasks.filter((task) => {
    if (currentFilter === "active") return !task.done;
    if (currentFilter === "completed") return task.done;
    return true;
  });

  // Шаг 3 + 8: поиск поверх фильтра статуса
  if (searchText) {
    filtered = filtered.filter((t) =>
      t.title.toLowerCase().includes(searchText)
    );
  }

  // Сортировка
  const sorted = filtered.sort((a, b) => {
    return sortMode === "newest" ? b.id - a.id : a.id - b.id;
  });

  tasksElem.innerHTML = "";
  sorted.forEach((task) => tasksElem.append(createTaskCard(task)));
}

// Инициализация
renderTasks();

// Самостоятельная часть: определение части суток
function getPartOfDay() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Утро";
  if (hour >= 12 && hour < 18) return "День";
  if (hour >= 18 && hour < 23) return "Вечер";
  return "Ночь";
}
console.log(getPartOfDay());

function saveTasks(){
 localStorage.setItem('tasks', JSON.stringify(tasks));
}