document.getElementById("excelFile").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet);

    if (json.length === 0) return;

   
    localStorage.setItem("excelData", JSON.stringify(json));

   
    displayTable(json);

   
    updateSummary(json);

    updateChart(json);
  };

  reader.readAsArrayBuffer(file);
});

function displayTable(data) {
  const output = document.getElementById("output");
  const table = document.createElement("table");
  table.className = "min-w-full border border-gray-300";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  Object.keys(data[0]).forEach((key) => {
    const th = document.createElement("th");
    th.textContent = key;
    th.className = "border px-4 py-2 bg-gray-100 font-semibold";
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  data.forEach((row) => {
    const tr = document.createElement("tr");
    Object.values(row).forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      td.className = "border px-4 py-2";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  output.innerHTML = "";
  output.appendChild(table);
}

function updateSummary(data) {
  
  let totalSales = 0;
  let totalProducts = data.length;
  let totalPrice = 0;

  data.forEach((item) => {
    totalSales += parseFloat(item.Sales || 0);
    totalPrice += parseFloat(item.Price || 0);
  });

  const avgPrice = totalProducts ? (totalPrice / totalProducts).toFixed(2) : 0;

  document.getElementById("totalSales").textContent = `₹${totalSales.toLocaleString()}`;
  document.getElementById("totalProducts").textContent = totalProducts;
  document.getElementById("avgPrice").textContent = `₹${avgPrice}`;
}

let chart; 

function updateChart(data) {
  const labels = data.map((item) => item.Product || "N/A");
  const salesData = data.map((item) => parseFloat(item.Sales || 0));

  const ctx = document.getElementById("chart").getContext("2d");

  if (chart) chart.destroy(); 

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Sales",
        data: salesData,
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
