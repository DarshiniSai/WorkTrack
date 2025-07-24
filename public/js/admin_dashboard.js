const userId = localStorage.getItem("user_id");
document.addEventListener("DOMContentLoaded", function () {
  var empElement = document.querySelector(".emp");
  var deptElement = document.querySelector(".dept");
  var leaveReqElement = document.querySelector(".leave_requests");
  loadAdminName();

  async function loadCounts() {
    try {
      const [empRes, deptRes, leaveRes] = await Promise.all([
        fetch("http://localhost:5000/api/employees/count"),
        fetch("http://localhost:5000/api/departments/count"),
        fetch("http://localhost:5000/api/leave-requests/pending-count"),
      ]);

      if (!empRes.ok || !deptRes.ok || !leaveRes.ok)
        throw new Error("Failed to fetch counts");

      const [empData, deptData, leaveData] = await Promise.all([
        empRes.json(),
        deptRes.json(),
        leaveRes.json(),
      ]);

      empElement.textContent = empData.total || 0;
      deptElement.textContent = deptData.total || 0;
      leaveReqElement.textContent = leaveData.total || 0;
    } catch (error) {
      console.error("Error loading counts:", error);
      empElement.textContent = "--";
      deptElement.textContent = "--";
      leaveReqElement.textContent = "--";
    }
  }

  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "500px",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    selectable: true,
    editable: true,
    events: [], 
    dateClick: function (info) {
      const title = prompt("Enter Event Title:");
      if (title) {
        calendar.addEvent({
          title: title,
          start: info.dateStr,
          allDay: true,
        });
      }
    },
    eventClick: function (info) {
      if (confirm("Delete this event?")) {
        info.event.remove();
      }
    },
  });

  calendar.render();
  loadCounts();
});

async function loadAdminName() {
  try {
    const res = await fetch(`http://localhost:5000/api/users/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch admin details");

    const data = await res.json();
    const name = data.name || "Admin";

    document.querySelectorAll(".admin-name").forEach(el => el.textContent = name);
  } catch (err) {
    console.error("Error loading admin name:", err);
  }
}
