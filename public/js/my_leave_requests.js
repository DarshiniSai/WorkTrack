const leaveCardsContainer = document.getElementById("leaveCards");
const leaveModal = new bootstrap.Modal(document.getElementById("leaveModal"));
var leaveRequests = [];
const userId = localStorage.getItem("user_id");
console.log("usrid", userId);

function getStatusColor(status) {
  return status === "Approved"
    ? "success"
    : status === "Pending"
    ? "warning"
    : "danger";
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function renderLeaveCards(leaves) {
  leaveCardsContainer.innerHTML = "";
  leaves.forEach((leave) => {
    const card = `
      <div class="col-md-6">
        <div class="card border-${getStatusColor(leave.status)} shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-1">${leave.description}</h5>
            <p class="mb-1"><strong>From:</strong> ${formatDate(
              leave.start_date
            )}</p>
            <p class="mb-1"><strong>To:</strong> ${formatDate(
              leave.end_date
            )}</p>
            <p class="mb-0"><strong>Status:</strong> <span class="text-${getStatusColor(
              leave.status
            )} fw-bold">${leave.status}</span></p>
            ${
              leave.status === "Pending"
                ? `
              <div class="mt-3">
                <button class="btn btn-sm btn-warning me-2" onclick="editLeave(${leave.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteLeave(${leave.id})">Delete</button>
              </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `;
    leaveCardsContainer.innerHTML += card;
  });
}

async function fetchLeaveRequests() {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/leave-requests/user/${userId}`
    );
    const data = await res.json();
    renderLeaveCards(data);
    leaveRequests = data;
    console.log(data);
  } catch (err) {
    leaveCardsContainer.innerHTML = `<p class="text-danger">Failed to load leave requests.</p>`;
  }
}

function openLeaveModal() {
  document.getElementById("leaveFrom").value = "";
  document.getElementById("leaveTo").value = "";
  document.getElementById("leaveReason").value = "";
  leaveModal.show();
}

async function submitLeaveRequest(event) {
  event.preventDefault();
  const from = document.getElementById("leaveFrom").value;
  const to = document.getElementById("leaveTo").value;
  const reason = document.getElementById("leaveReason").value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/leave-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        from_date: from,
        to_date: to,
        reason,
      }),
    });

    if (res.ok) {
      fetchLeaveRequests(); // refresh
      leaveModal.hide();
    } else {
      alert("Failed to submit leave request");
    }
  } catch (err) {
    alert("Error submitting leave request");
  }
}

function formatInputDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; 
}

function editLeave(id) {
  const leave = leaveRequests.find((l) => l.id === id);
  if (!leave) return;

  document.getElementById("leaveFrom").value = formatInputDate(
    leave.start_date
  );
  document.getElementById("leaveTo").value = formatInputDate(leave.end_date);
  document.getElementById("leaveReason").value = leave.description;
  if (document.activeElement) {
    document.activeElement.blur();
  }

  leaveModal.show();

  document.querySelector("form").onsubmit = async function (e) {
    e.preventDefault();
    const from = document.getElementById("leaveFrom").value;
    const to = document.getElementById("leaveTo").value;
    const reason = document.getElementById("leaveReason").value;

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/leave-requests/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ from_date: from, to_date: to, reason }),
        }
      );

      if (res.ok) {
        fetchLeaveRequests();
        leaveModal.hide();
      } else {
        alert("Failed to update leave");
      }
    } catch (err) {
      alert("Error updating leave");
    }
  };
}

async function deleteLeave(id) {
  if (!confirm("Are you sure you want to delete this leave request?")) return;
  try {
    const res = await fetch(`${BACKEND_URL}/api/leave-requests/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchLeaveRequests();
    } else {
      alert("Failed to delete leave");
    }
  } catch (err) {
    alert("Error deleting leave");
  }
}

document.addEventListener("DOMContentLoaded", fetchLeaveRequests);
