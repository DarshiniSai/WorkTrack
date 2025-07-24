const userId = localStorage.getItem('user_id');
const taskTableBody = document.getElementById("taskTableBody");

let tasks = [];

async function fetchTasks() {
  try {
    const res = await fetch(`http://localhost:5000/api/tasks/user/${userId}`);
    tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    taskTableBody.innerHTML = '<tr><td colspan="5" class="text-danger">Failed to load tasks.</td></tr>';
  }
}

function renderTasks(tasks) {
  taskTableBody.innerHTML = '';

  tasks.forEach((task, index) => {
    const isCompleted = task.status === "Completed";
    const statusClass =
      isCompleted ? "text-success fw-bold"
      : task.status === "In Progress" ? "text-warning fw-bold"
      : "text-danger fw-bold";

    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${task.description}</td>
        <td class="${statusClass}">${task.status}</td>
        <td>
          <input type="checkbox" ${isCompleted ? "checked disabled" : ""} onchange="markCompleted(${task.id})" />
        </td>
        <td>${formatInputDate(task.due_date)}</td>
      </tr>
    `;
    taskTableBody.innerHTML += row;
  });
}

function formatInputDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; 
}

async function markCompleted(taskId) {
  try {
    const res = await fetch(`http://localhost:5000/api/tasks/status/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Completed" })
    });

    if (res.ok) {
      fetchTasks();
    } else {
      alert("Failed to mark task as completed");
    }
  } catch (err) {
    alert("Error updating task status");
  }
}

document.addEventListener('DOMContentLoaded', fetchTasks);
