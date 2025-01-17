let drinksData = []; // To hold the loaded data
let selectedDrinks = []; // To hold selected drinks

// Load the data
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    drinksData = data;
    console.log('Drinks data loaded:', drinksData);
    displayFullDrinkList(); // Display the full list of drinks on page load
  })
  .catch(error => console.error('Error loading data:', error));

// Display the full list of drinks
function displayFullDrinkList() {
  const fullDrinkList = document.getElementById('full-drink-list');
  fullDrinkList.innerHTML = ''; // Clear existing list

  drinksData.forEach(drink => {
    const listItem = document.createElement('li');
    listItem.textContent = `${drink.name} (Sugar: ${drink.sugar}, Calories: ${drink.calories})`;
    fullDrinkList.appendChild(listItem);
  });
}

// Search for drinks
function searchDrinks() {
  const searchQuery = document.getElementById('search').value.toLowerCase();
  const searchResults = document.getElementById('search-results');
  searchResults.innerHTML = ''; // Clear previous results

  const filteredDrinks = drinksData.filter(drink =>
    drink.name.toLowerCase().includes(searchQuery)
  );

  filteredDrinks.forEach(drink => {
    const listItem = document.createElement('li');
    listItem.textContent = `${drink.name} (${drink.sugar})`;
    listItem.onclick = () => selectDrink(drink);
    searchResults.appendChild(listItem);
  });
}

// Select a drink
function selectDrink(drink) {
  if (!selectedDrinks.includes(drink)) {
    selectedDrinks.push(drink);

    // Update the selected drinks list
    const selectedDrinksList = document.getElementById('selected-drinks');
    const listItem = document.createElement('li');
    listItem.textContent = `${drink.name} (${drink.sugar})`;
    selectedDrinksList.appendChild(listItem);

    // Update the total sugar count
    updateTotalSugar();
  }
}

// Update total sugar count
function updateTotalSugar() {
  const totalSugar = selectedDrinks.reduce((sum, drink) => {
    // Convert sugar to float
    const sugarValue = parseFloat(drink.sugar.replace(' g', ''));
    return sum + (isNaN(sugarValue) ? 0 : sugarValue); // Handle invalid sugar values
  }, 0);

  document.getElementById('total-sugar').textContent = totalSugar.toFixed(1);
}