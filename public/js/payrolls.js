document.addEventListener("DOMContentLoaded", () => {
  populateMonthYearDropdowns();
  setCurrentFilterValues();
  loadPayrolls(); 
});

const formatCurrency = value => `₹${parseFloat(value).toLocaleString("en-IN")}`;

const payrollTableBody = document.getElementById("payrollTableBody");
const previewTableBody = document.getElementById("previewTableBody");
const previewCard = document.getElementById("previewCard");
const payrollStatusMessage = document.getElementById("payrollStatusMessage");
const displayMonthYear = document.getElementById("displayMonthYear");

function populateMonthYearDropdowns() {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentYear = new Date().getFullYear();
  const monthSelects = [document.getElementById("filterMonth"), document.getElementById("genMonth")];
  const yearSelects = [document.getElementById("filterYear"), document.getElementById("genYear")];

  months.forEach((m, i) => {
    const opt = new Option(m, i + 1);
    monthSelects.forEach(sel => sel.appendChild(opt.cloneNode(true)));
  });

  for (let y = currentYear - 5; y <= currentYear + 2; y++) {
    const opt = new Option(y, y);
    yearSelects.forEach(sel => sel.appendChild(opt.cloneNode(true)));
  }
}

function setCurrentFilterValues() {
  const now = new Date();
  document.getElementById("filterMonth").value = now.getMonth() + 1;
  document.getElementById("filterYear").value = now.getFullYear();
  document.getElementById("genMonth").value = now.getMonth() + 1;
  document.getElementById("genYear").value = now.getFullYear();
}

async function loadPayrolls() {
  const month = document.getElementById("filterMonth").value;
  const year = document.getElementById("filterYear").value;
  const monthName = getMonthName(month);

  displayMonthYear.textContent = `${monthName} ${year}`;
  previewCard.classList.add("d-none");

  try {
    const statusRes = await fetch(`http://localhost:5000/api/payrolls/status?month=${month}&year=${year}`);
    const { alreadyGenerated } = await statusRes.json();

    if (!alreadyGenerated) {
      payrollTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Payroll not yet generated for ${monthName} ${year}</td></tr>`;
      payrollStatusMessage.className = "alert alert-warning";
      payrollStatusMessage.textContent = `Payroll for ${monthName} ${year} is not generated yet.`;
      payrollStatusMessage.classList.remove("d-none");
      return;
    }

    const res = await fetch(`http://localhost:5000/api/payrolls?month=${month}&year=${year}`);
    const data = await res.json();

    payrollStatusMessage.className = "alert alert-success";
    payrollStatusMessage.textContent = `Payroll for ${monthName} ${year} is already generated.`;
    payrollStatusMessage.classList.remove("d-none");
    console.log("payroll", data);
    payrollTableBody.innerHTML = "";
    data.forEach((p, index) => {
      payrollTableBody.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${p.name}</td>
          <td>${p.department || '-'}</td>
          <td>${formatCurrency(p.base)}</td>
          <td>${p.presentDays || '-'}</td>
          <td>${formatCurrency(p.bonus)}</td>
          <td>${formatCurrency(p.net)}</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Failed to load payrolls:", err);
    payrollTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error loading payroll data</td></tr>`;
  }
}

let previewData = [];

document.getElementById("generateForm").addEventListener("submit", async e => {
  e.preventDefault();
  const month = document.getElementById("genMonth").value;
  const year = document.getElementById("genYear").value;
  const bonus = parseFloat(document.getElementById("bonus").value) || 0;

  try {
    const statusRes = await fetch(`http://localhost:5000/api/payrolls/status?month=${month}&year=${year}`);
    const { alreadyGenerated } = await statusRes.json();
    if (alreadyGenerated) {
      alert(`Payroll for ${getMonthName(month)} ${year} is already generated.`);
      return;
    }

    const res = await fetch(`http://localhost:5000/api/payrolls/preview?month=${month}&year=${year}&bonus=${bonus}`);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Invalid data");

    const missingSalary = data.find(p => !p.base_salary || p.base_salary === 0);
    if (missingSalary) {
      alert(`Cannot generate payroll. Employee "${missingSalary.name}" has base salary = 0. Please update their salary first.`);
      return;
    }

    previewData = data;
    previewTableBody.innerHTML = "";
    data.forEach(p => {
      previewTableBody.innerHTML += `
        <tr>
          <td>${p.employee_id}</td>
          <td>${p.name}</td>
          <td>${p.department || '-'}</td>
          <td>${formatCurrency(p.base_salary)}</td>
          <td>${p.days_present}</td>
          <td>${formatCurrency(p.bonus)}</td>
          <td>${formatCurrency(p.total_pay)}</td>
        </tr>
      `;
    });

    previewCard.classList.remove("d-none");
  } catch (err) {
    console.error("Preview failed:", err);
    alert("Could not generate payroll preview.");
  }
});

async function confirmGenerate() {
  if (!previewData.length) return alert("No data to save");

  const month = document.getElementById("genMonth").value;
  const year = document.getElementById("genYear").value;

  const dataToSave = previewData.map(p => ({
    ...p,
    month: parseInt(month),
    year: parseInt(year)
  }));

  try {
    const res = await fetch("http://localhost:5000/api/payrolls/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSave)
    });

    if (res.ok) {
      alert("Payroll generated successfully!");
      loadPayrolls();
      previewCard.classList.add("d-none");
    } else if (res.status === 409) {
      const { error } = await res.json();
      alert(error);
    } else {
      alert("Failed to generate payroll.");
    }
  } catch (err) {
    console.error("Generation error:", err);
    alert("Something went wrong while saving payroll.");
  }
}

function clearPreview() {
  previewData = [];
  previewTableBody.innerHTML = "";
  previewCard.classList.add("d-none");
}

function getMonthName(m) {
  return [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ][m - 1];
}
