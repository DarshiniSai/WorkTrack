const reportCards = document.getElementById('reportCards');

async function loadReportData() {
  try {
    const [empCountRes, deptCountRes, leaveSummaryRes, distRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/employees/count`),
      fetch(`${BACKEND_URL}/api/departments/count`),
      fetch(`${BACKEND_URL}/api/leave-requests/summary`),
      fetch(`${BACKEND_URL}/api/employees/distribution`)
    ]);

    if (!empCountRes.ok || !deptCountRes.ok || !leaveSummaryRes.ok || !distRes.ok) {
      throw new Error('Failed to fetch report data');
    }

    const [empCountData, deptCountData, leaveSummaryData, distData] = await Promise.all([
      empCountRes.json(),
      deptCountRes.json(),
      leaveSummaryRes.json(),
      distRes.json()
    ]);
    const payrollData = 934728;
    const reports = {
      totalEmployees: empCountData.total || 0,
      totalDepartments: deptCountData.total || 0,
      totalPayrollExpense: payrollData.total || 0,
      leaveSummary: leaveSummaryData,
      deptDistribution: distData
    };

    renderReportCards(reports);
    renderDepartmentChart(reports.deptDistribution);
  } catch (error) {
    console.error('Error loading report data:', error);
    renderReportCards({
      totalEmployees: 0,
      totalDepartments: 0,
      totalPayrollExpense: 0,
      leaveSummary: { approved: 0, pending: 0, rejected: 0 },
      deptDistribution: {}
    });
  }
}

function renderReportCards(reports) {
  const html = `
    <div class="col-md-3 mb-4">
      <div class="card text-white bg-primary h-100">
        <div class="card-body">
          <h5 class="card-title">Total Employees</h5>
          <p class="card-text fs-4">${reports.totalEmployees}</p>
        </div>
      </div>
    </div>
    <div class="col-md-3 mb-4">
      <div class="card text-white bg-secondary h-100">
        <div class="card-body">
          <h5 class="card-title">Departments</h5>
          <p class="card-text fs-4">${reports.totalDepartments}</p>
        </div>
      </div>
    </div>
    <div class="col-md-3 mb-4">
      <div class="card text-white bg-success h-100">
        <div class="card-body">
          <h5 class="card-title">Payroll Expense</h5>
          <p class="card-text fs-4">₹${reports.totalPayrollExpense.toLocaleString()}</p>
        </div>
      </div>
    </div>
    <div class="col-md-3 mb-4">
      <div class="card text-white bg-warning h-100">
        <div class="card-body">
          <h5 class="card-title">Leave Summary</h5>
          <p class="card-text fs-6">
            ✅ Approved: ${reports.leaveSummary.approved || 0} <br>
            ⏳ Pending: ${reports.leaveSummary.pending || 0} <br>
            ❌ Rejected: ${reports.leaveSummary.rejected || 0}
          </p>
        </div>
      </div>
    </div>
  `;
  reportCards.innerHTML = html;
}

function renderDepartmentChart(distribution) {
  const ctx = document.getElementById('departmentChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(distribution),
      datasets: [{
        label: 'Employees per Department',
        data: Object.values(distribution),
        backgroundColor: [
          '#0d6efd', '#198754', '#dc3545', '#ffc107', '#6f42c1',
          '#0dcaf0', '#adb5bd' // Added more colors for additional departments
        ]
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

window.onload = () => {
  loadReportData();
};
