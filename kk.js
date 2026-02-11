const inputAdd = document.getElementById("addInp");
const butAdd = document.getElementById("addBut");
const searchInp = document.getElementById("searchTask");
const tasksElem = document.querySelector(".tasks");
const addTasks = document.getElementById("addInp");
const searchTasks = document.getElementById("searchTask");
const taskForm = document.querySelector(".addTask");
const time = new Date();
// const tasks = [
//   { title: "Спорт", text: "Сходить в зал", done: false, date: "10.10" },
//   { title: "Магазин", text: "Купить молоко", done: true, date: "11.10" },
//   { title: "Учеба", text: "Выучить JS", done: false, date: "12.10" },
// ];
let tasks = [];
console.log(tasks);
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask();
});
function addTask() {
  let inputTask = document.getElementById("addInp").value;

  if (inputTask === "") {
    inputAdd.classList.add("error");
    return;
  } else {
    inputAdd.classList.remove("error");
  }
  let newTask = {
    id: tasks.length + 1,
    title: inputTask,
    complete: false,
    date: `${time.getDate()}.${time.getMonth() + 1}.${time.getFullYear()}`,
  };
  tasks.push(newTask);
  inputAdd.value = "";
  renderTasks();
}

function createTaskCard(task, index) {
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
  taskName.innerHTML = `<h3 class="card-title">${task.title}`;

  card.append(taskName);
  card.append(createTaskActions(task, index));
  tasksElem.append(card);
}

function createTaskActions(task, index) {
  const taskActions = document.createElement("div");
  taskActions.classList.add("task-actions");

  const btnEdit = createButton(
    "edit-button",
    `<svg class="task__icon" viewBox="0 0 24 24" fill="none" stroke="#6f64a3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>`,
  );

  btnEdit.addEventListener("click", (event) => {
    event.stopPropagation();
    const newText = prompt("Введите новый текст:", task.title);
    if (newText) {
      task.title = newText;
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
    </svg>`,
  );

  btnDelete.addEventListener("click", (event) => {
    event.stopPropagation();
    tasks.splice(index, 1);
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

function renderTasks() {
  tasksElem.innerHTML = "";
  tasks.forEach((task) => createTaskCard(task));
}

renderTasks();

const sortSelector = document.querySelector(".sort-select");
let sortMode;
sortSelector.addEventListener("change", (event) => {
  sortMode = event.target.value;
  console.log(`${sortMode}`);
  renderAll();
});

function renderAll() {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortMode === "newest") {
      console.log(a, b);
      return a.id - b.id;
    }
    return b.id - a.id;
  });
  tasksElem.innerHTML = "";
  sortedTasks.forEach((task) => tasksElem.before(createTaskCard(task)));
}
