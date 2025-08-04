let employees = [];
let departments = [];

const employeeTableBody = document.getElementById("employeeTableBody");
const employeeModal = new bootstrap.Modal(
  document.getElementById("employeeModal")
);
const deptSelect = document.getElementById("empDept");
const employeeForm = document.getElementById("employeeForm");

window.addEventListener("DOMContentLoaded", () => {
  loadDepartments();
  loadEmployees();
  employeeForm.addEventListener("submit", saveEmployee);
});

async function loadEmployees() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/employees`);
    const data = await res.json();
    employees = data;
    updateTable();
  } catch (err) {
    showToast("Failed to load employees!");
  }
}

async function loadDepartments() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/departments`);
    const data = await res.json();
    departments = data;
    console.log("departments", departments);

    deptSelect.innerHTML = `<option value="">Select Department</option>`;
    departments.forEach((dept) => {
      const option = document.createElement("option");
      option.value = dept.id; // Use department ID
      option.textContent = dept.name;
      deptSelect.appendChild(option);
    });
  } catch (err) {
    showToast("Failed to load departments!");
  }
}
function openAddEmployeeModal() {
  document.getElementById("modalTitle").innerText = "Add Employee";
  document.getElementById("employeeForm").reset();
  document.getElementById("editIndex").value = "";
  employeeModal.show();
}

async function saveEmployee(event) {
  event.preventDefault();

  const name = document.getElementById("empName").value.trim();
  const department_id = parseInt(document.getElementById("empDept").value);
  const email = document.getElementById("empEmail").value.trim();
  const salary = document.getElementById("empSalary").value.trim();
  const index = document.getElementById("editIndex").value;

  const newEmployee = {
    name,
    email,
    department_id: isNaN(department_id) ? null : department_id,
    salary: isNaN(salary) ? 0: salary
  };
  console.log("new employee " + JSON.stringify(newEmployee));

  try {
    const url =
      index === ""
        ? `${BACKEND_URL}/api/employees`
        : `http://localhost:5000/api/employees/${employees[index].id}`;
    const method = index === "" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEmployee),
    });

    if (res.ok) {
      showToast(index === "" ? "Employee added!" : "Employee updated!");
      loadEmployees();
      employeeModal.hide();
    } else {
      throw new Error();
    }
  } catch {
    showToast("Failed to save employee!");
  }
}

function updateTable() {
  employeeTableBody.innerHTML = "";

  if (employees.length === 0) {
    employeeTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No employees found.</td></tr>`;
    return;
  }

  employees.forEach((emp, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${emp.name}</td>
        <td>${
          emp.department || "-"
        }</td> <!-- This shows department name from backend -->
        <td>${emp.email}</td>
        <td>${emp.salary}</td>
          <td>
            <button class="btn btn-sm btn-warning me-2" onclick="editEmployee(${index})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="removeEmployee(${index})">Remove</button>
          </td>
      </tr>
    `;
    employeeTableBody.innerHTML += row;
  });
}

function editEmployee(index) {
  const emp = employees[index];
  console.log(emp);
  document.getElementById("modalTitle").innerText = "Edit Employee";
  document.getElementById("empName").value = emp.name;
  document.getElementById("empDept").value = emp.department_id || "";
  document.getElementById("empEmail").value = emp.email;
  document.getElementById("empSalary").value = emp.salary;
  document.getElementById("editIndex").value = index;
  employeeModal.show();
}

function handleCSVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async function (e) {
    const lines = e.target.result.split("\n");
    const bulkEmployees = [];

    lines.forEach((line, i) => {
      const [name, email, deptName, salary] = line.split(",").map((s) => s.trim());

      if (!name || !email) {
        console.warn(`Skipping line ${i + 1} - missing name/email`);
        return;
      }

      let department_id = null;
      let base_salary = 0.0;

      if (deptName) {
        const matchedDept = departments.find(
          (dept) => dept.name.toLowerCase() === deptName.toLowerCase()
        );

        if (matchedDept) {
          department_id = matchedDept.id;
        } else {
          console.warn(
            `Department '${deptName}' not found in line ${
              i + 1
            }, setting department as null`
          );
        }
      } 
      base_salary = isNaN(salary) ? base_salary: salary;

      bulkEmployees.push({
        name,
        email,
        department_id,
        salary
      });
    });

    console.log("bulk emp", bulkEmployees);
    try {
      const res = await fetch(`${BACKEND_URL}api/employees/bulk-add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employees: bulkEmployees }),
      });

      if (res.ok) {
        showToast("Employees added and emails sent!");
        loadEmployees();
      } else {
        showToast("Failed to upload CSV.");
      }
    } catch {
      showToast("CSV upload error!");
    }
  };

  reader.readAsText(file);
}

async function removeEmployee(index) {
  if (!confirm("Are you sure you want to remove this employee?")) return;

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/employees/${employees[index].id}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      showToast("Employee removed!");
      loadEmployees();
    } else {
      throw new Error();
    }
  } catch {
    showToast("Failed to remove employee.");
  }
}

function showToast(message) {
  const toastEl = document.getElementById("feedbackToast");
  toastEl.querySelector(".toast-body").textContent = message;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}
