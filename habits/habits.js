const menuBtn = document.getElementById("addBut");
const menu = document.querySelector(".habit-form");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const container = document.getElementById("articlesContainer");
const emptyMsg = document.getElementById("emptyMsg");
const nameInput = document.querySelector(".habit-name");
const freqSelect = document.querySelector(".filt-sort");
const targetInput = document.querySelector(".habit-target");

let habits = JSON.parse(localStorage.getItem('habits')) || [];
let editingId = null;
let selectedCategory = null;
let selectedEmoji = "";

// Показ/скрытие формы
menuBtn.addEventListener("click", () => {
  menu.classList.toggle("visible");
});

// Выбор категории
document.querySelectorAll(".list__button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".list__button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCategory = btn.dataset.category || null;
    selectedEmoji = btn.dataset.emoji || "";
  });
});

// Отмена
cancelBtn.addEventListener("click", () => {
  menu.classList.remove("visible");
  clearForm();
});

// Сохранение — создаём/обновляем карточку и добавляем в контейнер
saveBtn.addEventListener("click", () => {
  const habit = {
    id: editingId || Date.now().toString(),
    name: nameInput.value.trim(),
    freq: freqSelect.value,
    category: selectedCategory,
    emoji: selectedEmoji,
    target: parseInt(targetInput?.value, 10) || 0,
    checks: editingId ? (habits.find(h => h.id === editingId)?.checks || []) : []
  };

  if (editingId) {
    habits = habits.map(h => h.id === editingId ? habit : h);
    const existingCard = container.querySelector(`.habit-card[data-id="${editingId}"]`);
    if (existingCard) {
      const newCard = createHabit(habit);
      container.replaceChild(newCard, existingCard);
    } else {
      container.appendChild(createHabit(habit));
    }
  } else {
    habits.push(habit);
    const card = createHabit(habit);
    container.appendChild(card);
  }

  saveTasks();
  updateEmptyMessage();
  clearForm();
  menu.classList.remove("visible");
  editingId = null;
});

function clearForm() {
  nameInput.value = "";
  if (freqSelect) freqSelect.selectedIndex = 0;
  if (targetInput) targetInput.value = "";
  selectedCategory = null;
  selectedEmoji = "";
  document.querySelectorAll(".list__button").forEach(b => b.classList.remove("active"));
}

// Обновление видимости сообщения о пустом списке
function updateEmptyMessage() {
  emptyMsg.style.display = container.children.length ? "none" : "block";
}

// Вспомогательные функции для чек-инов и streak
function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function isCheckedToday(checks = []) {
  return checks.includes(todayStr());
}

function calculateStreak(checks = []) {
  if (!checks || checks.length === 0) return 0;
  const set = new Set(checks);
  let streak = 0;
  let day = new Date();
  while (true) {
    const d = day.toISOString().slice(0, 10);
    if (set.has(d)) {
      streak++;
      day.setDate(day.getDate() - 1);
    } else break;
  }
  return streak;
}

// Функция создания карточки
function createHabit(habit = {}) {
  const card = document.createElement("article");
  card.className = "habit-card";
  card.dataset.id = habit.id || "";

  const left = document.createElement("div");
  left.className = "habit-left";

  const emoji = document.createElement("div");
  emoji.className = "habit-emoji";
  emoji.textContent = habit.emoji || "📝";

  const titleWrap = document.createElement("div");
  titleWrap.className = "habit-title";

  const nameEl = document.createElement("div");
  nameEl.className = "name";
  nameEl.textContent = habit.name || "Без названия";

  const meta = document.createElement("div");
  meta.className = "habit-meta";
  meta.textContent = `${habit.freq || ""}${habit.category ? " | " + habit.category : ""}`;

  titleWrap.appendChild(nameEl);
  titleWrap.appendChild(meta);
  left.appendChild(emoji);
  left.appendChild(titleWrap);

  // Правая часть
  const actions = document.createElement("div");
  actions.className = "habit-actions";

  // Статистика и чек-ин
  const statsWrap = document.createElement("div");
  statsWrap.className = "habit-stats-wrap";

  const stats = document.createElement("div");
  stats.className = "habit-stats";
  const streakCount = calculateStreak(habit.checks);
  stats.textContent = `Streak: ${streakCount} / ${habit.target || "—"}`;

  const progress = document.createElement("div");
  progress.className = "habit-progress";
  if (habit.target && habit.target > 0) {
    const percent = Math.min(100, Math.round((streakCount / habit.target) * 100));
    progress.textContent = `Прогресс: ${percent}%`;
  } else {
    progress.textContent = "";
  }

  const checkBtn = document.createElement("button");
  checkBtn.className = "habit-check";
  checkBtn.type = "button";
  checkBtn.textContent = isCheckedToday(habit.checks) ? "Отмечено сегодня" : "Отметить сегодня";
  if (isCheckedToday(habit.checks)) checkBtn.disabled = true;

  checkBtn.addEventListener("click", () => {
    const today = todayStr();
    if (!habit.checks.includes(today)) {
      habit.checks.push(today);
      const newStreak = calculateStreak(habit.checks);
      stats.textContent = `Streak: ${newStreak} / ${habit.target || "—"}`;
      if (habit.target && habit.target > 0) {
        const percent = Math.min(100, Math.round((newStreak / habit.target) * 100));
        progress.textContent = `Прогресс: ${percent}%`;
      }
      checkBtn.textContent = "Отмечено сегодня";
      checkBtn.disabled = true;
      // обновляем глобальный массив и сохраняем
      habits = habits.map(h => h.id === habit.id ? habit : h);
      saveTasks();
    }
  });

  statsWrap.appendChild(stats);
  statsWrap.appendChild(progress);

  // Кнопки редактирования и удаления
  const editBtn = document.createElement("button");
  editBtn.className = "habit-edit";
  editBtn.type = "button";
  editBtn.textContent = "Изменить";
  editBtn.addEventListener("click", () => {
    // populate form for editing
    nameInput.value = habit.name || "";
    if (habit.freq) {
      for (let i = 0; i < freqSelect.options.length; i++) {
        if (freqSelect.options[i].value === habit.freq) {
          freqSelect.selectedIndex = i;
          break;
        }
      }
    }
    if (targetInput) targetInput.value = habit.target || "";

    // Восстанавливаем выбор категории (по эмодзи/категории ищем кнопку)
    const btn = Array.from(document.querySelectorAll(".list__button")).find(b =>
      (b.dataset.category === habit.category) || (b.dataset.emoji === habit.emoji)
    );
    if (btn) {
      document.querySelectorAll(".list__button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = btn.dataset.category || null;
      selectedEmoji = btn.dataset.emoji || "";
    } else {
      selectedCategory = habit.category || null;
      selectedEmoji = habit.emoji || "";
    }

    // Открываем форму и помечаем редактирование
    menu.classList.add("visible");
    editingId = habit.id || null;
  });

  const removeBtn = document.createElement("button");
  removeBtn.className = "habit-remove";
  removeBtn.type = "button";
  removeBtn.textContent = "Удалить";
  removeBtn.addEventListener("click", () => {
    habits = habits.filter(h => h.id !== habit.id);
    card.remove();
    saveTasks();
    updateEmptyMessage();
  });

  // Сборка правой части
  actions.appendChild(statsWrap);
  actions.appendChild(checkBtn);
  actions.appendChild(editBtn);
  actions.appendChild(removeBtn);

  card.appendChild(left);
  card.appendChild(actions);

  return card;
}

function saveTasks() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

function renderFromStorage() {
  container.innerHTML = "";
  habits.forEach(h => container.appendChild(createHabit(h)));
  updateEmptyMessage();
}
renderFromStorage();
