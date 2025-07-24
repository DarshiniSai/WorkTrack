document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("user_id");

  // Load employee name
  async function loadEmployeeName() {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`);
      if (!res.ok) throw new Error("User not found");

      const user = await res.json();
      const name = user.name || "Employee";

      document.getElementById("greeting").innerText = `Hello, ${name}!!!`;
      document.getElementById("dropdown-name").innerText = name;
    } catch (err) {
      console.warn("Could not load employee name. Using default.");
    }
  }

  // Load attendance rate
  async function loadAttendanceRates() {
    try {
      const res = await fetch(
        `http://localhost:5000/api/attendance/summary/${userId}`
      );
      const data = await res.json();

      const total = data.workingDays || 1;
      const present = data.present || 0;
      const absent = data.absent || 0;
      const pending = data.pending || 0;
      const attended = present + pending;

      const presentRate = Math.round((attended / total) * 100);
      const absentRate = 100 - presentRate;

      const presentCtx = document
        .getElementById("presentRateChart")
        .getContext("2d");
      createDoughnut(presentCtx, presentRate, "#4caf50", "Present Rate");

      const absentCtx = document
        .getElementById("absentRateChart")
        .getContext("2d");
      createDoughnut(absentCtx, absentRate, "#f44336", "Absent Rate");
    } catch (err) {
      console.error("Failed to load attendance summary:", err);
    }
  }

  // FullCalendar
  const calendar = new FullCalendar.Calendar(
    document.getElementById("calendar"),
    {
      initialView: "dayGridMonth",
      height: 400,
      selectable: true,
      dateClick: function (info) {
        const title = prompt("Enter event title:");
        if (title) {
          calendar.addEvent({
            title: title,
            start: info.dateStr,
            allDay: true,
          });
        }
      },
    }
  );
  calendar.render();

  // Chart.js plugin
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      const width = chart.width;
      const height = chart.height;
      const text = chart.config.options.plugins.centerText.text;
      const fontSize = chart.config.options.plugins.centerText.fontSize || "20";
      const fontColor = chart.config.options.plugins.centerText.color || "#000";

      ctx.save();
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, width / 2, height / 2);
      ctx.restore();
    },
  };

  // Create doughnut chart
  function createDoughnut(ctx, value, color, label) {
    return new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Filled", "Remaining"],
        datasets: [
          {
            data: [value, 100 - value],
            backgroundColor: [color, "#e0e0e0"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          centerText: {
            text: `${value}%`,
            fontSize: 24,
            color: "#000",
          },
        },
      },
      plugins: [centerTextPlugin],
    });
  }

  loadEmployeeName();
  loadAttendanceRates();
});
