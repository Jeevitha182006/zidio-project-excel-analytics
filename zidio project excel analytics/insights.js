document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("fileInputInsights");
  const insightsContainer = document.getElementById("insights");
  const noDataMsg = document.getElementById("noDataMsg");

  fileInput.addEventListener("change", handleFile);

  function handleFile(event) {
    const file = event.target.files[0];
    if (!file) {
      noDataMsg.classList.remove("hidden");
      insightsContainer.innerHTML = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (jsonData.length === 0) {
          noDataMsg.classList.remove("hidden");
          insightsContainer.innerHTML = "";
        } else {
          noDataMsg.classList.add("hidden");
          generateInsights(jsonData);
        }
      } catch (err) {
        console.error("Error reading file:", err);
        noDataMsg.classList.remove("hidden");
        insightsContainer.innerHTML = "";
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function generateInsights(data) {
    insightsContainer.innerHTML = ""; 

    const totalSales = data.reduce((sum, row) => sum + (parseFloat(row["Sales"]) || 0), 0);
    const totalRevenue = data.reduce((sum, row) => {
      return sum + ((parseFloat(row["Sales"]) || 0) * (parseFloat(row["Price"]) || 0));
    }, 0);

    const productStats = {};
    data.forEach(row => {
      const product = row["Product"];
      const sales = parseFloat(row["Sales"]) || 0;
      const price = parseFloat(row["Price"]) || 0;
      if (product) {
        if (!productStats[product]) {
          productStats[product] = { sales: 0, revenue: 0, price: price };
        }
        productStats[product].sales += sales;
        productStats[product].revenue += sales * price;
      }
    });

    const topProduct = Object.entries(productStats).sort((a, b) => b[1].sales - a[1].sales)[0];
    const mostExpensive = Object.entries(productStats).sort((a, b) => b[1].price - a[1].price)[0];
    const leastExpensive = Object.entries(productStats).sort((a, b) => a[1].price - b[1].price)[0];
    const averagePrice = (
      data.reduce((sum, row) => sum + (parseFloat(row["Price"]) || 0), 0) / data.length
    ).toFixed(2);

    
    insightsContainer.innerHTML += `
      <div class="bg-green-100 p-4 rounded shadow mb-2">
        <p class="font-semibold">Total Sales Units:</p>
        <p>${totalSales}</p>
      </div>
      <div class="bg-yellow-100 p-4 rounded shadow mb-2">
        <p class="font-semibold">Total Revenue:</p>
        <p>₹${totalRevenue.toFixed(2)}</p>
      </div>
      <div class="bg-purple-100 p-4 rounded shadow mb-2">
        <p class="font-semibold">Top-Selling Product:</p>
        <p>${topProduct[0]} (Units Sold: ${topProduct[1].sales})</p>
      </div>
      <div class="bg-blue-100 p-4 rounded shadow mb-2">
        <p class="font-semibold">Average Price per Product:</p>
        <p>₹${averagePrice}</p>
      </div>
      <div class="bg-red-100 p-4 rounded shadow mb-2">
        <p class="font-semibold">Most Expensive Product:</p>
        <p>${mostExpensive[0]} (₹${mostExpensive[1].price})</p>
      </div>
      <div class="bg-pink-100 p-4 rounded shadow mb-4">
        <p class="font-semibold">Least Expensive Product:</p>
        <p>${leastExpensive[0]} (₹${leastExpensive[1].price})</p>
      </div>
    `;

   
    const table = document.createElement("table");
    table.className = "w-full text-left mt-4 border border-collapse";

    table.innerHTML = `
      <thead>
        <tr class="bg-gray-200">
          <th class="border p-2">Product</th>
          <th class="border p-2">Revenue</th>
          <th class="border p-2">Contribution %</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(productStats).map(([product, stat]) => {
          const percent = ((stat.revenue / totalRevenue) * 100).toFixed(2);
          return `
            <tr>
              <td class="border p-2">${product}</td>
              <td class="border p-2">₹${stat.revenue.toFixed(2)}</td>
              <td class="border p-2">${percent}%</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    `;

    insightsContainer.appendChild(table);
  }
});
