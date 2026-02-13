const inputAdd = document.getElementById("addInp");
const searchInp = document.getElementById("searchTask");
const tasksElem = document.querySelector(".tasks");
const taskForm = document.querySelector(".addTask");
const sortSelector = document.querySelector(".sort-select");

let tasks = [];
let sortMode = "newest";
let nextId = 1; // счётчик, который никогда не уменьшается

let currentFilter = "all";

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask();
});

sortSelector.addEventListener("change", (event) => {
  sortMode = event.target.value;
  renderTasks();
});

function addTask() {
  const inputTask = inputAdd.value.trim();

  if (inputTask === "") {
    inputAdd.classList.add("error");
    return;
  }

  inputAdd.classList.remove("error");

  const now = new Date(); // свежая дата для каждой задачи

  tasks.push({
    id: nextId++,
    title: inputTask,
    done: false,
    date: `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`,
  });

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
      renderTasks();
    }
  });

  const taskName = document.createElement("div");
  taskName.classList.add("task-name");
  taskName.innerHTML = `<h3 class="card-title">${task.title}</h3>`; // закрыт тег h3

  card.append(taskName);
  card.append(createTaskActions(task));

  return card; // теперь возвращает элемент
}

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
    tasks = tasks.filter((t) => t.id !== task.id); // по id надежнее
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

function renderTasks() {  //renderAll//
  const sorted = [...tasks].sort((a, b) => {
    return sortMode === "newest" ? b.id - a.id : a.id - b.id;
  });

console.log(tasks)

  tasksElem.innerHTML = "";
  sorted.forEach((task) => tasksElem.append(createTaskCard(task)));
  console.log(currentFilter)
  const selectorFilter = tasks.filter((task, i) => {
    if (currentFilter === 'active') return task.done
    return true;
  })
  console.log(selectorFilter)
  return selectorFilter;
}

renderTasks();