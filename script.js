let drinksData = []; // To hold the loaded data
let selectedDrinks = []; // To hold selected drinks

// Load the data
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    drinksData = data;
    console.log('Drinks data loaded:', drinksData);
    displayFullDrinkList(); // Display the full list of drinks
  })
  .catch(error => console.error('Error loading data:', error));

// Display the full list of drinks (at the end of the page)
function displayFullDrinkList() {
  const fullDrinkList = document.getElementById('full-drink-list');
  fullDrinkList.innerHTML = ''; // Clear existing list

  drinksData.forEach(drink => {
    const listItem = document.createElement('li');
    listItem.textContent = `${drink.name} (Sugar: ${drink.sugar}, Calories: ${drink.calories})`;
    fullDrinkList.appendChild(listItem);
  });
}

// Search for drinks and display checkboxes
function searchDrinks() {
  const searchQuery = document.getElementById('search').value.toLowerCase();
  const searchResults = document.getElementById('search-results');
  searchResults.innerHTML = ''; // Clear previous results

  if (searchQuery.trim() === '') {
    // Do not display any results if the search query is empty
    return;
  }

  const filteredDrinks = drinksData.filter(drink =>
    drink.name.toLowerCase().includes(searchQuery)
  );

  filteredDrinks.forEach((drink, index) => {
    const listItem = document.createElement('li');

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `drink-${index}`;
    checkbox.checked = selectedDrinks.includes(drink); // Keep checkbox state
    checkbox.onchange = () => toggleDrinkSelection(drink, checkbox.checked);

    // Create label for checkbox
    const label = document.createElement('label');
    label.htmlFor = `drink-${index}`;
    label.textContent = `${drink.name} (Sugar: ${drink.sugar}, Calories: ${drink.calories})`;

    // Append checkbox and label to the list item
    listItem.appendChild(checkbox);
    listItem.appendChild(label);

    // Add the list item to the search results
    searchResults.appendChild(listItem);
  });
}

// Toggle drink selection when a checkbox is checked/unchecked
function toggleDrinkSelection(drink, isSelected) {
  if (isSelected) {
    // Add drink to selected list if not already present
    if (!selectedDrinks.includes(drink)) {
      selectedDrinks.push(drink);
    }
  } else {
    // Remove drink from selected list
    selectedDrinks = selectedDrinks.filter(selected => selected !== drink);
  }

  // Update the selected drinks list and total sugar
  updateSelectedDrinksList();
  updateTotalSugar();
}

// Update the selected drinks list in the UI
function updateSelectedDrinksList() {
  const selectedDrinksList = document.getElementById('selected-drinks');
  selectedDrinksList.innerHTML = ''; // Clear existing list

  selectedDrinks.forEach(drink => {
    const listItem = document.createElement('li');

    // Create text for the drink
    const drinkText = document.createTextNode(
      `${drink.name} (Sugar: ${drink.sugar}, Calories: ${drink.calories})`
    );

    // Create remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'x';
    removeButton.onclick = () => {
      // Remove drink from selected list
      selectedDrinks = selectedDrinks.filter(selected => selected !== drink);
      // Update UI
      updateSelectedDrinksList();
      updateTotalSugar();
      // Uncheck checkbox if it exists
      const checkbox = document.querySelector(
        `#search-results input[type="checkbox"][id^="drink-"]:checked`
      );
      if (checkbox) checkbox.checked = false;
    };

    // Append text and button to the list item
    listItem.appendChild(drinkText);
    listItem.appendChild(removeButton);

    // Add the list item to the selected drinks list
    selectedDrinksList.appendChild(listItem);
  });
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