const userId = localStorage.getItem("user_id");

const monthSelect = document.getElementById("filterMonth");
const yearSelect = document.getElementById("filterYear");
const payrollTableBody = document.getElementById("payrollTableBody");

let payrolls = [];

function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.toLocaleString('default', { month: 'long' }),
    year: now.getFullYear().toString()
  };
}

async function fetchPayrolls() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/payrolls/employee/${userId}`);
    payrolls = await res.json();
    setDefaultFilters();
    renderPayrolls();
  } catch (err) {
    console.error("Error loading payrolls:", err);
    alert("Failed to load payroll data");
  }
}

function setDefaultFilters() {
  const { month, year } = getCurrentMonthYear();
  if (monthSelect && yearSelect) {
    monthSelect.value = month;
    yearSelect.value = year;
  }
}

function renderPayrolls() {
  const month = monthSelect.value;
  const year = yearSelect.value;

  const filtered = payrolls.filter(
    (p) => (!month || p.month === month) && (!year || p.year.toString() === year)
  );

  payrollTableBody.innerHTML = "";
  filtered.forEach((p, i) => {
    payrollTableBody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.month} ${p.year}</td>
        <td>₹${p.base}</td>
        <td>₹${p.deductions}</td>
        <td>₹${p.net}</td>
        <td>${p.status}</td>
        <td><button class="btn btn-sm btn-outline-primary" id="downloadBtn-${i}">Download</button></td>
      </tr>
    `;
  });

  filtered.forEach((p, i) => {
    document
      .getElementById(`downloadBtn-${i}`)
      .addEventListener("click", () => downloadPayslip(p));
  });

  if (filtered.length === 0) {
    payrollTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No payroll found</td></tr>`;
  }
}

async function downloadPayslip(payroll) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let logoBase64 = null;
  try {
    const response = await fetch('./images/gradiouslogo.png');
    const blob = await response.blob();
    const reader = new FileReader();
    logoBase64 = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Logo not loaded, proceeding without it.");
  }

  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 10, 10, 30, 15);
  }

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("WorkTrack Payslip", 50, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Employee ID: ${payroll.id}`, 50, 30);
  if (payroll.name) doc.text(`Employee Name: ${payroll.name}`, 50, 37);
  if (payroll.department) doc.text(`Department: ${payroll.department}`, 50, 44);
  doc.text(`Month & Year: ${payroll.month} ${payroll.year}`, 50, 51);

  doc.autoTable({
    startY: 60,
    head: [['Description', 'Amount (₹)']],
    body: [
      ['Base Pay', payroll.base],
      ['Deductions', payroll.deductions],
      ['Net Pay', payroll.net]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: [255, 255, 255],
      fontSize: 12
    },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40, halign: 'right' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Status: ${payroll.status}`, 50, finalY);

  doc.setFontSize(10);
  doc.text(
    `WorkTrack © ${new Date().getFullYear()} | Page 1 of 1`,
    50,
    290
  );

  doc.save(`${payroll.id}_payslip.pdf`);
}

monthSelect.addEventListener("change", renderPayrolls);
yearSelect.addEventListener("change", renderPayrolls);

fetchPayrolls();
