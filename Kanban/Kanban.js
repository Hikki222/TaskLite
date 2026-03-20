const columns = document.querySelectorAll(".column");

const defaultData = {
  "To Do": [],
  "In Progress": [],
  Done: [],
};

let infoData = JSON.parse(localStorage.getItem("kanban")) || defaultData;

let taskIdCount = 0;
Object.values(infoData).forEach((arr) => {
  arr.forEach((t) => {
    if (typeof t.id === "number" && t.id > taskIdCount) taskIdCount = t.id;
  });
});

function saveTasks() {
  localStorage.setItem("kanban", JSON.stringify(infoData));
}

function createTaskElement(taskData) {
  const article = document.createElement("article");
  article.classList.add("task-card");
  article.dataset.id = taskData.id;
  article.draggable = true;

  article.innerHTML = `<div class="task-header">
    <h3 class="task-title">${escapeHtml(taskData.title)}</h3>
    <p class="button-description">${escapeHtml(taskData.description)}</p>
    <button class="delete-button">Удалить</button>
  </div>`;

  article.querySelector(".delete-button").addEventListener("click", () => {
    removeTaskById(taskData.id);
  });

  article.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", taskData.id);
    article.classList.add("dragging");
  });

  article.addEventListener("dragend", () => {
    article.classList.remove("dragging");
  });

  return article;
}

function renderBoard() {
  columns.forEach((column) => {
    const status = column.dataset.status;
    const tasksContainer = column.querySelector(".tasks") || column;
    if (column.querySelector(".tasks")) {
      column.querySelector(".tasks").innerHTML = "";
    } else {
      column.querySelectorAll(".task-card").forEach((n) => n.remove());
    }

    const countSpan = column.querySelector(".title span");
    if (infoData[status]) {
      if (countSpan) countSpan.innerText = infoData[status].length;
      infoData[status].forEach((task) => {
        const taskEl = createTaskElement(task);
        if (column.querySelector(".tasks")) {
          column.querySelector(".tasks").appendChild(taskEl);
        } else {
          column.appendChild(taskEl);
        }
      });
    } else {
      if (countSpan) countSpan.innerText = 0;
    }
  });

  saveTasks();
}

function addTask(column) {
  const status = column.dataset.status;
  const title = prompt("Введите название задачи:");
  const description = prompt("Введите описание задачи:");

  if (title && description) {
    taskIdCount++;
    const taskData = {
      id: taskIdCount,
      title: title,
      description: description,
    };

    if (!infoData[status]) infoData[status] = [];
    infoData[status].push(taskData);
    saveTasks();
    renderBoard();
  }
}

function removeTaskById(id) {
  let removed = false;
  Object.keys(infoData).forEach((status) => {
    const idx = infoData[status].findIndex((t) => t.id === id);
    if (idx !== -1) {
      infoData[status].splice(idx, 1);
      removed = true;
    }
  });
  if (removed) {
    saveTasks();
    renderBoard();
  }
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task-card:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

document.querySelectorAll(".add-task").forEach((button) => {
  button.addEventListener("click", function () {
    addTask(this.closest(".column"));
  });
});

renderBoard();

columns.forEach((column) => {
  const dropZone = column.querySelector(".tasks") || column;

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");

    const afterElement = getDragAfterElement(dropZone, e.clientY);
    const dragging = document.querySelector(".dragging");
    if (dragging) {
      if (afterElement) {
        dropZone.insertBefore(dragging, afterElement);
      } else {
        dropZone.appendChild(dragging);
      }
    }
  });

  dropZone.addEventListener("dragleave", (e) => {
    if (!dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove("drag-over");
    }
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");

    const taskId = Number(e.dataTransfer.getData("text/plain"));
    const newStatus = column.dataset.status;

    let taskData = null;
    Object.keys(infoData).forEach((status) => {
      const idx = infoData[status].findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        taskData = infoData[status].splice(idx, 1)[0];
      }
    });

    if (taskData) {
      if (!infoData[newStatus]) infoData[newStatus] = [];

      const afterElement = getDragAfterElement(dropZone, e.clientY);
      if (afterElement) {
        const afterId = Number(afterElement.dataset.id);
        const insertIdx = infoData[newStatus].findIndex(
          (t) => t.id === afterId
        );
        infoData[newStatus].splice(insertIdx, 0, taskData);
      } else {
        infoData[newStatus].push(taskData);
      }

      saveTasks();
      renderBoard();
    }
  });
});