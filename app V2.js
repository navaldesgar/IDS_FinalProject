const users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = null;
let tasks = [];

document.getElementById('register-btn').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (username && password) {
    if (users[username]) {
      alert('El usuario ya existe.');
    } else {
      users[username] = { password, tasks: [] };
      localStorage.setItem('users', JSON.stringify(users));
      alert('Registro exitoso.');
    }
  }
});

document.getElementById('login-btn').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (users[username] && users[username].password === password) {
    currentUser = username;
    tasks = users[username].tasks || [];
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('task-section').classList.remove('hidden');
    document.getElementById('user-info').innerText = `Bienvenido, ${username}`;
    document.getElementById('logout-btn').classList.remove('hidden');
    renderTasks();
    showNotification('¡Bienvenido!', 'Ahora puedes ver tus tareas.');
  } else {
    alert('Credenciales incorrectas.');
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('task-section').classList.add('hidden');
  document.getElementById('user-info').innerText = '';
  document.getElementById('logout-btn').classList.add('hidden');
});

document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('task-title').value;
  const desc = document.getElementById('task-desc').value;
  const deadline = document.getElementById('task-deadline').value;
  const priority = document.getElementById('task-priority').value;
  const task = {
    title,
    desc,
    deadline,
    priority,
    completed: false,
    comments: [],
  };
  tasks.push(task);
  saveTasks();
  renderTasks();
  e.target.reset();
  checkDeadlines();
});

function saveTasks() {
  users[currentUser].tasks = tasks;
  localStorage.setItem('users', JSON.stringify(users));
}

function renderTasks() {
  const taskList = document.getElementById('tasks-list');
  taskList.innerHTML = '';
  const search = document.getElementById('search').value.toLowerCase();
  const filterPriority = document.getElementById('filter-priority').value;

  const filteredTasks = tasks.filter(task =>
    (!filterPriority || task.priority === filterPriority) &&
    (!search || task.title.toLowerCase().includes(search))
  );

  filteredTasks.forEach((task, index) => {
    const div = document.createElement('div');
    div.className = `task ${task.completed ? 'completed' : ''}`;
    div.innerHTML = `
      <h3>${task.title} (${task.priority})</h3>
      <p>${task.desc}</p>
      <p>Fecha límite: ${task.deadline}</p>
      <button onclick="toggleComplete(${index})">${task.completed ? 'Reabrir' : 'Completar'}</button>
      <button onclick="deleteTask(${index})">Eliminar</button>
      <button onclick="addComment(${index})">Comentar</button>
      <div>Comentarios: ${task.comments.join(', ')}</div>
    `;
    taskList.appendChild(div);
  });

  updateMetrics();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function addComment(index) {
  const comment = prompt('Escribe un comentario:');
  if (comment) {
    tasks[index].comments.push(comment);
    saveTasks();
    renderTasks();
  }
}

function updateMetrics() {
  document.getElementById('total-tasks').innerText = tasks.length;
  document.getElementById('completed-tasks').innerText = tasks.filter(t => t.completed).length;
  document.getElementById('pending-tasks').innerText = tasks.filter(t => !t.completed).length;
}

// Notificaciones
function showNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

function checkDeadlines() {
  const today = new Date().toISOString().split('T')[0];
  tasks.forEach(task => {
    if (task.deadline === today && !task.completed) {
      showNotification('Recordatorio', `La tarea "${task.title}" vence hoy.`);
    }
  });
}

// Inicializar filtros
document.getElementById('search').addEventListener('input', renderTasks);
document.getElementById('filter-priority').addEventListener('change', renderTasks);

// Pedir permiso para notificaciones
if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission();
}
