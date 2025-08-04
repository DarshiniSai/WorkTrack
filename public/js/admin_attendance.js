document.addEventListener("DOMContentLoaded", () => {
  loadAttendance();

  document.getElementById("editForm").addEventListener("submit", updateAttendance);
});

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

async function loadAttendance() {
  const emp = document.getElementById("filter-employee").value;
  const dept = document.getElementById("filter-department").value;
  const date = document.getElementById("filter-date").value;
  const status = document.getElementById("filter-status").value;

  const params = new URLSearchParams({
    employee: emp,
    department: dept,
    date: date,
    status: status
  });

  try {
    const res = await fetch(`${BACKEND_URL}/api/attendance/admin?${params.toString()}`);
    const data = await res.json();
    renderTable(data);
  } catch (err) {
    alert("Failed to load attendance");
  }
}

function renderTable(data) {
  const tbody = document.querySelector("#attendanceTable tbody");
  tbody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.department}</td>
      <td>${formatDate(row.date)}</td>
      <td>${row.check_in || '-'}</td>
      <td>${row.check_out || '-'}</td>
      <td>${row.status}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="openEdit(${row.id}, '${row.status}', '${row.check_in || ""}', '${row.check_out || ""}')">Edit</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openEdit(id, status, checkin, checkout) {
  document.getElementById("edit-id").value = id;
  document.getElementById("edit-status").value = status;
  document.getElementById("edit-checkin").value = checkin;
  document.getElementById("edit-checkout").value = checkout;

  const modal = new bootstrap.Modal(document.getElementById("editModal"));
  modal.show();
}

async function updateAttendance(e) {
  e.preventDefault();

  const id = document.getElementById("edit-id").value;
  const status = document.getElementById("edit-status").value;
  const check_in = document.getElementById("edit-checkin").value;
  const check_out = document.getElementById("edit-checkout").value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/attendance/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, check_in, check_out })
    });
    const data = await res.json();
    alert(data.message);
    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
    loadAttendance();
  } catch (err) {
    alert("Failed to update record");
  }
}

function exportCSV() {
  const table = document.getElementById("attendanceTable");
  const rows = Array.from(table.querySelectorAll("tr")).map(row =>
    Array.from(row.cells).map(cell => `"${cell.textContent}"`).join(",")
  );

  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "attendance.csv";
  link.click();
}
