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
      if (!selectedDrinks.some(selected => selected.drink === drink)) {
        selectedDrinks.push({ drink, amount: 0 });
      }
    } else {
      // Remove drink from selected list
      selectedDrinks = selectedDrinks.filter(selected => selected.drink !== drink);
    }
  
    console.log('Selected Drinks:', selectedDrinks); // Debugging
    updateSelectedDrinksList();
    updateTotalSugar();
  }

// Update the selected drinks list in the UI
function updateSelectedDrinksList() {
    const selectedDrinksList = document.getElementById('selected-drinks');
    selectedDrinksList.innerHTML = ''; // Clear existing list
  
    console.log('Updating selected drinks list:', selectedDrinks); // Debugging
  
    selectedDrinks.forEach((selected, index) => {
      const { drink, amount } = selected;
  
      const listItem = document.createElement('li');
  
      // Create input for amount
      const amountInput = document.createElement('input');
      amountInput.type = 'number';
      amountInput.min = '0';
      amountInput.value = amount;
      amountInput.placeholder = 'ml';
      amountInput.oninput = () => {
        // Update the amount for this drink
        selectedDrinks[index].amount = parseFloat(amountInput.value) || 0;
        console.log(`Updated amount for ${drink.name}:`, selectedDrinks[index].amount); // Debugging
        updateTotalSugar();
      };
  
      // Create label for "ml"
      const mlLabel = document.createElement('span');
      mlLabel.textContent = ' ml';
  
      // Create text for the drink
      const drinkText = document.createTextNode(
        ` ${drink.name} (Sugar: ${drink.sugar}, Calories: ${drink.calories}) `
      );
  
      // Create remove button
      const removeButton = document.createElement('button');
      removeButton.textContent = 'x';
      removeButton.onclick = () => {
        // Remove drink from selected list
        selectedDrinks = selectedDrinks.filter(item => item.drink !== drink);
        console.log(`Removed ${drink.name}. Updated list:`, selectedDrinks); // Debugging
        updateSelectedDrinksList();
        updateTotalSugar();
        // Uncheck checkbox if it exists
        const checkbox = document.querySelector(
          `#search-results input[type="checkbox"][id^="drink-"]:checked`
        );
        if (checkbox) checkbox.checked = false;
      };
  
      // Append input, label, text, and button to the list item
      listItem.appendChild(amountInput);
      listItem.appendChild(mlLabel);
      listItem.appendChild(drinkText);
      listItem.appendChild(removeButton);
  
      // Add the list item to the selected drinks list
      selectedDrinksList.appendChild(listItem);
    });
  }

  function updateTotalSugar() {
    const totalSugar = selectedDrinks.reduce((sum, { drink, amount }) => {
      const sugarPer100ml = parseFloat(drink.sugar.replace(' g', '')); // Extract numeric sugar value
      if (isNaN(sugarPer100ml)) {
        console.error(`Invalid sugar value for ${drink.name}:`, drink.sugar);
        return sum; // Skip drinks with invalid sugar values
      }
      const sugarValue = (sugarPer100ml / 100) * amount; // Calculate sugar for the entered amount
      return sum + sugarValue;
    }, 0);
  
    // Update the total sugar in the UI
    document.getElementById('total-sugar').textContent = totalSugar.toFixed(1); // Round to 1 decimal place
    console.log(`Updated total sugar: ${totalSugar.toFixed(1)} g`); // Debugging
  }