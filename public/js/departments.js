let departments = [];
const departmentTableBody = document.getElementById("departmentTableBody");
const departmentModal = new bootstrap.Modal(
  document.getElementById("departmentModal")
);

// Load departments on page load
window.addEventListener("DOMContentLoaded", loadDepartments);

async function loadDepartments() {
  try {
    const res = await fetch("http://localhost:5000/api/departments");
    departments = await res.json();
    console.log(departments);
    updateDepartmentTable();
  } catch (err) {
    alert("Failed to load departments!");
  }
}

// Open modal to add new department
function openAddDepartmentModal() {
  document.getElementById("modalDeptTitle").innerText = "Add Department";
  document.getElementById("departmentForm").reset();
  document.getElementById("editDeptIndex").value = "";
  departmentModal.show();
}

async function saveDepartment(event) {
  event.preventDefault();
  console.log("departments", departments);

  const name = document.getElementById("deptName").value.trim();
  const index = document.getElementById("editDeptIndex").value;

  const departmentData = { name };

  try {
    let res;
    if (index === "") {
      res = await fetch("http://localhost:5000/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(departmentData),
      });
    } else {
      const deptId = departments[index].id;
      res = await fetch(`http://localhost:5000/api/departments/${deptId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(departmentData),
      });
    }

    if (res.ok) {
      departmentModal.hide();
      loadDepartments();
    } else {
      alert("Failed to save department!");
    }
  } catch (err) {
    alert("Error saving department!");
  }
}

function updateDepartmentTable() {
  departmentTableBody.innerHTML = "";

  if (departments.length === 0) {
    departmentTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No departments found.</td></tr>`;
    return;
  }

  departments.forEach((dept, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${dept.name}</td>
        <td>${dept.employee_count || 0}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="editDepartment(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="removeDepartment(${index})">Remove</button>
        </td>
      </tr>
    `;
    departmentTableBody.innerHTML += row;
  });
}

function editDepartment(index) {
  const dept = departments[index];
  document.getElementById("modalDeptTitle").innerText = "Edit Department";
  document.getElementById("deptName").value = dept.name;
  document.getElementById("editDeptIndex").value = index;
  departmentModal.show();
}

async function removeDepartment(index) {
  if (!confirm("Are you sure you want to remove this department?")) return;

  try {
    const deptId = departments[index].id;
    const res = await fetch(`http://localhost:5000/api/departments/${deptId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      loadDepartments();
    } else {
      alert("Failed to remove department.");
    }
  } catch {
    alert("Error removing department.");
  }
}
