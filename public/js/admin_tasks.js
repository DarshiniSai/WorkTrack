let employees = [];
let tasks = [];

const assignModal = new bootstrap.Modal(document.getElementById("assignModal"));
const taskTableBody = document.getElementById("taskTableBody");

window.addEventListener("DOMContentLoaded", () => {
  loadEmployees();
  loadTasks();
  document.getElementById("assignTaskForm").addEventListener("submit", saveTask);
  document.getElementById("filterEmployee").addEventListener("change", loadTasks);
  document.getElementById("filterStatus").addEventListener("change", loadTasks);
});

async function loadEmployees() {
  const res = await fetch(`${BACKEND_URL}/api/employees`);
  employees = await res.json();

  const empSelects = [document.getElementById("assignTo"), document.getElementById("filterEmployee")];
  empSelects.forEach(select => {
    select.innerHTML = '<option value="">Select Employee</option>';
    employees.forEach(emp => {
      const opt = document.createElement("option");
      opt.value = emp.id;
      opt.textContent = emp.name;
      select.appendChild(opt);
    });
  });
}

function clearFilters() {
  document.getElementById("filterEmployee").value = "";
  document.getElementById("filterStatus").value = "";
  loadTasks();
}

async function loadTasks() {
  const filterEmpId = document.getElementById("filterEmployee").value;
  const filterStatus = document.getElementById("filterStatus").value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/tasks/all-tasks`);
    const data = await res.json();

    tasks = data.filter(task => {
      return (!filterEmpId || task.user_id == filterEmpId) &&
             (!filterStatus || task.status === filterStatus);
    });
    console.log("tasks: ", tasks);

    updateTable();
  } catch (err) {
    showToast("Failed to load tasks");
  }
}

function updateTable() {
  taskTableBody.innerHTML = "";
  if (tasks.length === 0) {
    taskTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No tasks found.</td></tr>`;
    return;
  }

  tasks.forEach((task, i) => {
    const employeeName = employees.find(e => e.id === task.user_id)?.name || "N/A";

    taskTableBody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${employeeName}</td>
        <td>${task.description}</td>
        <td>${task.due_date ? task.due_date.split("T")[0] : "-"}</td>
        <td>${task.status}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="editTask(${task.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function openAssignModal() {
  document.getElementById("assignTaskForm").reset();
  document.getElementById("editTaskId").value = "";
  assignModal.show();
}

async function saveTask(e) {
  e.preventDefault();
  const id = document.getElementById("editTaskId").value;
  const user_id = parseInt(document.getElementById("assignTo").value);
  const description = document.getElementById("taskDesc").value.trim();
  const due_date = document.getElementById("taskDueDate").value;

  const payload = { user_id, description, due_date };

  try {
    const url = id
      ? `${BACKEND_URL}/api/tasks/${id}`
      : `${BACKEND_URL}/api/tasks`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showToast(id ? "Task updated" : "Task assigned");
      assignModal.hide();
      loadTasks();
    } else {
      showToast("Error saving task");
    }
  } catch {
    showToast("Task save failed");
  }
}

async function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById("editTaskId").value = task.id;
  document.getElementById("assignTo").value = task.user_id;
  document.getElementById("taskDesc").value = task.description;
  document.getElementById("taskDueDate").value = task.due_date ? task.due_date.split("T")[0] : "";

  assignModal.show();
}

async function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      showToast("Task deleted");
      loadTasks();
    } else {
      showToast("Failed to delete task");
    }
  } catch {
    showToast("Delete request failed");
  }
}

function showToast(msg) {
  const toastEl = document.getElementById("feedbackToast");
  toastEl.querySelector(".toast-body").textContent = msg;
  new bootstrap.Toast(toastEl).show();
}
