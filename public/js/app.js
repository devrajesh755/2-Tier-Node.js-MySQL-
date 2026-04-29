/* public/js/app.js — Frontend SPA logic */

// ── State ──────────────────────────────────────────────
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// ── Helpers ────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const api = async (method, path, body) => {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

// ── Auth ───────────────────────────────────────────────
async function login() {
  clearErr('login-err');
  const email = $('login-email').value.trim();
  const password = $('login-password').value;
  try {
    await api('POST', '/api/auth/login', { email, password });
    await loadDashboard();
  } catch (e) {
    showErr('login-err', e.message);
  }
}

async function register() {
  clearErr('reg-err');
  const name = $('reg-name').value.trim();
  const email = $('reg-email').value.trim();
  const password = $('reg-password').value;
  try {
    await api('POST', '/api/auth/register', { name, email, password });
    await loadDashboard();
  } catch (e) {
    showErr('reg-err', e.message);
  }
}

async function logout() {
  await api('POST', '/api/auth/logout');
  showScreen('auth-screen');
}

// ── Dashboard ──────────────────────────────────────────
async function loadDashboard() {
  const user = await api('GET', '/api/auth/me');
  $('user-name-display').textContent = user.name;
  $('user-role-display').textContent = user.role;
  $('user-avatar').textContent = user.name.charAt(0).toUpperCase();
  await fetchTasks();
  showScreen('dashboard-screen');
}

async function fetchTasks() {
  tasks = await api('GET', '/api/tasks');
  updateBadges();
  renderTasks();
}

function updateBadges() {
  const counts = { all: tasks.length, todo: 0, in_progress: 0, done: 0 };
  tasks.forEach(t => counts[t.status]++);
  $('badge-all').textContent = counts.all;
  $('badge-todo').textContent = counts.todo;
  $('badge-inprogress').textContent = counts.in_progress;
  $('badge-done').textContent = counts.done;
}

function filterTasks(status) {
  currentFilter = status;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');

  const titles = {
    all: 'All Tasks',
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
  };
  $('page-title').textContent = titles[status] || 'Tasks';
  renderTasks();
}

function renderTasks() {
  const filtered = currentFilter === 'all'
    ? tasks
    : tasks.filter(t => t.status === currentFilter);

  const grid = $('task-list');
  const empty = $('empty-state');

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = filtered.map(task => `
    <div class="task-card" id="card-${task.id}">
      <span class="task-status-badge badge-${task.status}">
        ${statusLabel(task.status)}
      </span>
      <div class="task-title">${esc(task.title)}</div>
      ${task.description ? `<div class="task-desc">${esc(task.description)}</div>` : ''}
      <div class="task-meta">Created ${formatDate(task.created_at)}</div>
      <div class="task-actions">
        <button class="btn-edit" onclick="openEditModal(${task.id})">✎ Edit</button>
        <button class="btn-delete" onclick="deleteTask(${task.id})">✕ Delete</button>
      </div>
    </div>
  `).join('');
}

// ── Modal ──────────────────────────────────────────────
function openModal() {
  editingTaskId = null;
  $('modal-title').textContent = 'New Task';
  $('modal-save-btn').textContent = 'Save Task';
  $('task-title').value = '';
  $('task-desc').value = '';
  $('task-status').value = 'todo';
  clearErr('modal-err');
  $('modal-overlay').classList.remove('hidden');
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingTaskId = id;
  $('modal-title').textContent = 'Edit Task';
  $('modal-save-btn').textContent = 'Update Task';
  $('task-title').value = task.title;
  $('task-desc').value = task.description || '';
  $('task-status').value = task.status;
  clearErr('modal-err');
  $('modal-overlay').classList.remove('hidden');
}

function closeModal(e) {
  if (e && e.target !== $('modal-overlay')) return;
  $('modal-overlay').classList.add('hidden');
}

async function saveTask() {
  clearErr('modal-err');
  const title = $('task-title').value.trim();
  const description = $('task-desc').value.trim();
  const status = $('task-status').value;
  if (!title) { showErr('modal-err', 'Title is required'); return; }

  try {
    if (editingTaskId) {
      await api('PUT', `/api/tasks/${editingTaskId}`, { title, description, status });
    } else {
      await api('POST', '/api/tasks', { title, description, status });
    }
    $('modal-overlay').classList.add('hidden');
    await fetchTasks();
  } catch (e) {
    showErr('modal-err', e.message);
  }
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  try {
    await api('DELETE', `/api/tasks/${id}`);
    await fetchTasks();
  } catch (e) {
    alert(e.message);
  }
}

// ── Screens ────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

// ── Utils ──────────────────────────────────────────────
function switchTab(tab) {
  $('form-login').classList.toggle('hidden', tab !== 'login');
  $('form-register').classList.toggle('hidden', tab !== 'register');
  $('tab-login').classList.toggle('active', tab === 'login');
  $('tab-register').classList.toggle('active', tab === 'register');
}

function statusLabel(s) {
  return { todo: '○ To Do', in_progress: '◑ In Progress', done: '● Done' }[s] || s;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function showErr(id, msg) { $(id).textContent = msg; }
function clearErr(id) { $(id).textContent = ''; }

// ── Init — check existing session ─────────────────────
(async () => {
  try {
    await loadDashboard();
  } catch {
    showScreen('auth-screen');
  }
})();

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $('modal-overlay').classList.add('hidden');
});
