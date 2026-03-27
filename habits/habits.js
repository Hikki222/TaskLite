const menuBtn = document.getElementById("addBut");
let menuEl = null;

// Пример пунктов (замените на свои)
const categories = [
  {id:'health', label:'Здоровье и тело', color:'#8b5cf6'},
  {id:'study',  label:'Учёба и развитие', color:'#06b6d4'},
  {id:'mood',   label:'Эмоциональное состояние', color:'#f97316'},
  {id:'home',   label:'Дом и быт', color:'#f59e0b'},
  {id:'work',   label:'Работа и финансы', color:'#10b981'},
  {id:'social', label:'Социальные привычки', color:'#fb7185'}
];

function createMenuElement() {
  const wrapper = document.createElement('div');
  wrapper.className = 'menu-back';
  wrapper.setAttribute('role','menu');
  wrapper.innerHTML = `
    <h3 class="menu-title">Выберите категорию</h3>
    <div class="menu-list"></div>
  `;

  const list = wrapper.querySelector('.menu-list');
  categories.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'menu-item';
    item.tabIndex = 0;
    item.dataset.id = cat.id;
    item.innerHTML = `
      <div class="menu-dot" style="background:${cat.color}"></div>
      <div class="menu-label">${cat.label}</div>
    `;
    // клик по пункту
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelectCategory(cat);
    });
    // Enter на пункте
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') onSelectCategory(cat);
    });
    list.appendChild(item);
  });

  return wrapper;
}

function openMenu() {
  if (menuEl) return; // уже открыт
  menuEl = createMenuElement();
  document.body.appendChild(menuEl);
  positionMenu(menuEl);
  menuBtn.setAttribute('aria-expanded','true');
  // небольшая задержка, чтобы фокусировать после вставки
  setTimeout(()=> {
    const first = menuEl.querySelector('.menu-item');
    if (first) first.focus();
  }, 0);
}

function closeMenu() {
  if (!menuEl) return;
  menuEl.remove();
  menuEl = null;
  menuBtn.setAttribute('aria-expanded','false');
}

function toggleMenu() {
  if (menuEl) closeMenu(); else openMenu();
}

function positionMenu(menu) {
  const rect = menuBtn.getBoundingClientRect();
  // позиционируем меню под кнопкой, в пределах видимой области
  const left = rect.left + window.scrollX;
  const top = rect.bottom + window.scrollY + 8;
  menu.style.left = left + 'px';
  menu.style.top = top + 'px';

  // если меню выходит за правый край окна — подвинуть
  const menuRect = menu.getBoundingClientRect();
  const overflowRight = menuRect.right - window.innerWidth;
  if (overflowRight > 8) {
    menu.style.left = Math.max(8, left - overflowRight - 8) + 'px';
  }
}

function onSelectCategory(cat) {
  // действие при выборе — замените на вашу логику
  console.log('Выбрано', cat);
  // например, вставить выбранную категорию под кнопкой
  menuBtn.textContent = cat.label;
  closeMenu();
}

// обработчики событий
menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMenu();
});

