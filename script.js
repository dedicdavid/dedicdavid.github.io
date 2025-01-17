fetch('data.json')
  .then(response => response.json())
  .then(data => {
    displayTable(data); // Populate the table
    createChart(data);  // Create the chart
  });

// Function to Populate the Table
function displayTable(data) {
  const tableBody = document.querySelector('#product-table tbody');
  tableBody.innerHTML = '';
  data.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.sugar}</td>
      <td>${product.calories}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Filter Data by Sugar Content
function filterData() {
  const maxSugar = parseFloat(document.getElementById('sugar-filter').value);
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      const filtered = data.filter(product => {
        const sugarValue = parseFloat(product.sugar.replace(' g', ''));
        return sugarValue <= maxSugar;
      });
      displayTable(filtered);
      createChart(filtered);
    });
}

// Function to Create a Bar Chart
function createChart(data) {
  const ctx = document.getElementById('sugarChart').getContext('2d');
  const labels = data.map(product => product.name);
  const sugarData = data.map(product => parseFloat(product.sugar.replace(' g', '')));

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Sugar Content (g)',
        data: sugarData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}