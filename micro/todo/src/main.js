// ===== FocusFlow – main.js =====
// ToDo-Liste mit Hauptfokus. Alles lokal in localStorage.

const STORE = 'focusflow_todos';
const STORE_FOCUS = 'focusflow_focus_id';

const $ = (s) => document.querySelector(s);

// ---------- State ----------
let todos = loadTodos();
let focusId = loadFocusId();

// ---------- Storage ----------
function loadTodos() {
  try { return JSON.parse(localStorage.getItem(STORE)) || []; }
  catch { return []; }
}
function saveTodos() {
  localStorage.setItem(STORE, JSON.stringify(todos));
}
function loadFocusId() {
  return localStorage.getItem(STORE_FOCUS) || null;
}
function saveFocusId() {
  if (focusId) localStorage.setItem(STORE_FOCUS, focusId);
  else localStorage.removeItem(STORE_FOCUS);
}

// ---------- Helpers ----------
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2000);
}

// ---------- Actions ----------
function addTodo(text) {
  todos.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    text,
    done: false
  });
  saveTodos();
  render();
}

function toggleDone(id) {
  const t = todos.find(t => t.id === id);
  if (!t) return;
  t.done = !t.done;
  // Wenn ein erledigtes ToDo der Fokus war -> Fokus entfernen
  if (t.done && focusId === id) {
    focusId = null;
    saveFocusId();
  }
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  if (focusId === id) {
    focusId = null;
    saveFocusId();
  }
  saveTodos();
  render();
}

function setFocus(id) {
  // Klick auf Stern: wenn schon Fokus -> entfernen, sonst setzen
  focusId = (focusId === id) ? null : id;
  saveFocusId();
  render();
  toast(focusId ? '⭐ Als Hauptfokus markiert' : 'Fokus entfernt');
}

function clearDone() {
  const before = todos.length;
  todos = todos.filter(t => !t.done);
  // Falls der Fokus erledigt war
  if (focusId && !todos.some(t => t.id === focusId)) {
    focusId = null;
    saveFocusId();
  }
  saveTodos();
  render();
  if (before !== todos.length) toast('Erledigte gelöscht');
}

// ---------- Render ----------
function render() {
  const list = $('#todo-list');
  const countEl = $('#count');
  const emptyMsg = $('#empty-msg');
  const focusCard = $('#focus-card');
  const focusText = $('#focus-text');

  // Fokus-Bereich
  const focusTodo = todos.find(t => t.id === focusId && !t.done);
  if (focusTodo) {
    focusCard.classList.remove('empty-focus');
    focusText.textContent = focusTodo.text;
  } else {
    if (focusId && !focusTodo) {
      // Fokus existierte, ist aber erledigt/gelöscht -> cleanup
      focusId = null;
      saveFocusId();
    }
    focusCard.classList.add('empty-focus');
    focusText.textContent = 'Kein Fokus gesetzt – markiere ein ToDo mit ⭐';
  }

  // Zähler
  const open = todos.filter(t => !t.done).length;
  countEl.textContent = `${open} offen · ${todos.length} gesamt`;

  // Liste
  list.innerHTML = '';
  emptyMsg.style.display = todos.length === 0 ? 'block' : 'none';

  // Fokus-ToDo immer oben anzeigen
  const sorted = [...todos].sort((a, b) => {
    if (a.id === focusId) return -1;
    if (b.id === focusId) return 1;
    return 0;
  });

  sorted.forEach(t => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    if (t.done) li.classList.add('is-done');
    if (t.id === focusId && !t.done) li.classList.add('is-focus');

    // Checkbox
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'todo-check';
    check.checked = t.done;
    check.addEventListener('change', () => toggleDone(t.id));

    // Text
    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = t.text;
    text.addEventListener('click', () => toggleDone(t.id));

    // Actions
    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const star = document.createElement('button');
    star.className = 'icon-btn star' + (t.id === focusId ? ' active' : '');
    star.textContent = t.id === focusId ? '⭐' : '☆';
    star.title = 'Als Hauptfokus markieren';
    star.disabled = t.done;
    star.addEventListener('click', () => setFocus(t.id));

    const del = document.createElement('button');
    del.className = 'icon-btn del';
    del.textContent = '🗑';
    del.title = 'Löschen';
    del.addEventListener('click', () => {
      if (confirm(`"${t.text}" löschen?`)) deleteTodo(t.id);
    });

    actions.append(star, del);
    li.append(check, text, actions);
    list.appendChild(li);
  });
}

// ---------- Events ----------
$('#add-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('#todo-input');
  const val = input.value.trim();
  if (!val) return;
  addTodo(val);
  input.value = '';
  input.focus();
});

$('#clear-done').addEventListener('click', clearDone);

// ---------- Init ----------
render();