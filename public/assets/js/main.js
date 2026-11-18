// ==========================================================
// zara's custom dash - main script
// ==========================================================

const html = document.documentElement;

// ---------- chart data ----------
const salesData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  thisYear: [190, 230, 220, 350, 360, 460, 420, 370, 400, 300, 350, 430],
  lastYear: [480, 240, 210, 280, 250, 230, 260, 230, 140, 180, 200, 150]
};

const usersData = {
  labels: ["January", "February", "March", "April", "May", "June"],
  desktop: [186, 305, 237, 73, 209, 214],
  mobile: [80, 200, 120, 190, 130, 140]
};

// ---------- chart helpers ----------
// reads a css variable from the page, so the charts match the theme
function cssVar(name) {
  return getComputedStyle(html).getPropertyValue(name).trim();
}

// builds a top-to-bottom fade, like the shadcn gradient
function makeGradient(context, rgb) {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) {
    return null; // chart isn't drawn yet
  }
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, `rgba(${rgb}, 0.6)`);
  gradient.addColorStop(1, `rgba(${rgb}, 0.02)`);
  return gradient;
}

// ---------- draw the charts ----------
let salesChart;
let usersChart;

function drawCharts() {
  const chart1 = cssVar("--chart-1-rgb");
  const chart2 = cssVar("--chart-2-rgb");
  const gridColor = cssVar("--bs-border-color");
  const textColor = cssVar("--bs-secondary-color");

  // use the same font and grey text as bootstrap
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.color = textColor;

  // remove old charts first (needed when the theme changes)
  if (salesChart) {
    salesChart.destroy();
    usersChart.destroy();
  }

  // sales overview: gradient area chart
  salesChart = new Chart(document.querySelector("#sales-chart"), {
    type: "line",
    data: {
      labels: salesData.labels,
      datasets: [
        {
          label: "This year",
          data: salesData.thisYear,
          borderColor: `rgb(${chart1})`,
          backgroundColor: (context) => makeGradient(context, chart1),
          fill: true
        },
        {
          label: "Last year",
          data: salesData.lastYear,
          borderColor: `rgb(${chart2})`,
          backgroundColor: (context) => makeGradient(context, chart2),
          fill: true
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      elements: {
        line: { tension: 0.4, borderWidth: 2 },  // smooth curves
        point: { radius: 0 }                     // hide the dots
      },
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: gridColor }, border: { display: false } }
      }
    }
  });

  // active users: radar chart
  usersChart = new Chart(document.querySelector("#users-chart"), {
    type: "radar",
    data: {
      labels: usersData.labels,
      datasets: [
        {
          label: "Desktop",
          data: usersData.desktop,
          backgroundColor: `rgba(${chart1}, 0.6)`,
          borderColor: `rgb(${chart1})`
        },
        {
          label: "Mobile",
          data: usersData.mobile,
          backgroundColor: `rgba(${chart2}, 0.8)`,
          borderColor: `rgb(${chart2})`
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      elements: {
        line: { borderWidth: 1 },
        point: { radius: 0 }
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, pointStyle: "rectRounded" }
        }
      },
      scales: {
        r: {
          grid: { color: gridColor },
          angleLines: { color: gridColor },
          ticks: { display: false }
        }
      }
    }
  });
}

// ---------- light / dark mode toggle ----------
const themeToggle = document.querySelector("#theme-toggle");

// use the saved theme if there is one (dark is the default in the html)
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  html.setAttribute("data-bs-theme", savedTheme);
}

// draw the charts once the theme is set
drawCharts();

// switch themes on click and remember the choice
themeToggle.addEventListener("click", () => {
  const newTheme = html.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-bs-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  drawCharts(); // redraw so the charts pick up the new colours
});