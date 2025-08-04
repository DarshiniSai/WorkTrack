const leaveRequestsContainer = document.getElementById('leaveRequestsContainer');

window.addEventListener('DOMContentLoaded', () => {
  loadLeaveRequests();
});

async function loadLeaveRequests() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/leave-requests`);
    const data = await res.json();

    leaveRequestsContainer.innerHTML = '';

    if (data.length === 0) {
      leaveRequestsContainer.innerHTML = `<p class="text-muted">No leave requests found.</p>`;
      return;
    }

    data.forEach(req => {
      const remarkId = `remark-${req.id}`;
      const card = document.createElement('div');
      card.className = 'col-md-6 col-lg-4 mb-4';

      card.innerHTML = `
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body">
            <h5 class="card-title">${req.employee}</h5>
            <p class="card-text">
              <strong>Department:</strong> ${req.department || '-'}<br>
              <strong>Type:</strong> ${req.type}<br>
              <strong>From:</strong> ${req.start_date}<br>
              <strong>To:</strong> ${req.end_date}<br>
              ${req.description ? `<strong>Note:</strong> ${req.description}<br>` : ''}
              ${req.admin_remark ? `<strong>Admin Remark:</strong> ${req.admin_remark}<br>` : ''}
            </p>
            ${req.status === 'Pending' ? `
              <div class="mb-2">
                <textarea id="${remarkId}" class="form-control" rows="2" placeholder="Optional remark for rejection"></textarea>
              </div>
            ` : ''}
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge ${getStatusBadgeClass(req.status)}">${req.status}</span>
              ${req.status === 'Pending' ? `
                <div>
                  <button class="btn btn-sm btn-success me-2" onclick="updateStatus(${req.id}, 'Approved')">Approve</button>
                  <button class="btn btn-sm btn-danger" onclick="updateStatus(${req.id}, 'Rejected')">Reject</button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
      leaveRequestsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading leave requests:", error);
    leaveRequestsContainer.innerHTML = `<p class="text-danger">Failed to load leave requests.</p>`;
  }
}

function getStatusBadgeClass(status) {
  if (status === 'Approved') return 'bg-success';
  if (status === 'Rejected') return 'bg-danger';
  return 'bg-warning text-dark';
}

function updateStatus(id, newStatus) {
  const remarkBox = document.getElementById(`remark-${id}`);
  const remark = remarkBox ? remarkBox.value.trim() : null;

  fetch(`${BACKEND_URL}/api/leave-requests/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: newStatus,
      admin_remark: remark,
    }),
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    })
    .then(() => loadLeaveRequests())
    .catch(err => {
      console.error('Status update error:', err);
      alert('Error updating status');
    });
}
