const tableBody = document.getElementById("attendanceTableBody");
const monthFilter = document.getElementById("monthFilter");
const yearFilter = document.getElementById("yearFilter");

const userId = localStorage.getItem("user_id");

const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= 2022; y--) {
  const option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  yearFilter.appendChild(option);
}

monthFilter.value = new Date().getMonth() + 1;
yearFilter.value = currentYear;

monthFilter.addEventListener("change", fetchAttendance);
yearFilter.addEventListener("change", fetchAttendance);

async function fetchAttendance() {
  const month = monthFilter.value;
  const year = yearFilter.value;

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/attendance/user/${userId}?month=${month}&year=${year}`
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    renderAttendance(data);
  } catch (err) {
    console.error("Error loading attendance:", err);
    tableBody.innerHTML = `<tr><td colspan="4" class="text-danger">Failed to load attendance records.</td></tr>`;
  }
}

function renderAttendance(records) {
  tableBody.innerHTML = "";

  if (!records.length) {
    tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No records found for this month.</td></tr>`;
    return;
  }

  records.forEach((record) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(record.date)}</td>
      <td>${record.status || "-"}</td>
      <td>${record.check_in || "-"}</td>
      <td>${record.check_out || "-"}</td>
    `;
    tableBody.appendChild(row);
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

async function checkIn() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/attendance/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });

    const data = await res.json();
    alert(data.message);
    fetchAttendance();
  } catch (err) {
    alert("Error during check-in.");
    console.error(err);
  }
}

async function checkOut() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/attendance/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });

    const data = await res.json();
    alert(data.message);
    fetchAttendance();
  } catch (err) {
    alert("Error during check-out.");
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", fetchAttendance);
