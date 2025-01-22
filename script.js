let drinksData = []; // To hold the loaded data
let selectedDrinks = []; // To hold selected drinks

// Load the data
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    // Convert sugar and calories to numbers
    drinksData = data.map(drink => ({
      ...drink,
      sugar: parseFloat(drink.sugar) || 0, // Convert sugar to a number, default to 0 if invalid
      calories: parseFloat(drink.calories) || 0 // Convert calories to a number, default to 0 if invalid
    }));
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
      if (!selectedDrinks.some(selected => selected.drink === drink)) {
          selectedDrinks.push({ drink, amount: 0 });
      }
  } else {
      selectedDrinks = selectedDrinks.filter(selected => selected.drink !== drink);
  }

  console.log('Selected Drinks:', selectedDrinks); // Debugging
  updateSelectedDrinksList();
  updateTotalSugar();
  updateTotalCalories();
}

function updateSelectedDrinksList() {
  const selectedDrinksList = document.getElementById('selected-drinks');
  selectedDrinksList.innerHTML = '';

  selectedDrinks.forEach((selected, index) => {
      const { drink, amount } = selected;

      const listItem = document.createElement('li');

      const amountInput = document.createElement('input');
      amountInput.type = 'number';
      amountInput.min = '0';
      amountInput.value = amount;
      amountInput.placeholder = 'ml';
      amountInput.oninput = () => {
          selectedDrinks[index].amount = parseFloat(amountInput.value) || 0;
          updateTotalSugar();
          updateTotalCalories();
      };

      const mlLabel = document.createElement('span');
      mlLabel.textContent = ' ml';

      const drinkText = document.createTextNode(
          ` ${drink.name} (Sugar: ${drink.sugar}, Calories: ${drink.calories}) `
      );

      const removeButton = document.createElement('button');
      removeButton.textContent = 'x';
      removeButton.onclick = () => {
          selectedDrinks = selectedDrinks.filter(item => item.drink !== drink);
          updateSelectedDrinksList();
          updateTotalSugar();
          updateTotalCalories();
      };

      listItem.appendChild(amountInput);
      listItem.appendChild(mlLabel);
      listItem.appendChild(drinkText);
      listItem.appendChild(removeButton);

      selectedDrinksList.appendChild(listItem);
  });
}

  function updateTotalSugar() {
    const totalSugar = selectedDrinks.reduce((sum, { drink, amount }) => {
      const sugarPer100ml = drink.sugar; // Use the numeric sugar value directly
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
  function updateTotalCalories() {
    const totalCalories = selectedDrinks.reduce((sum, { drink, amount }) => {
        const caloriesPer100ml = drink.calories; // Use the numeric calories value directly
        if (isNaN(caloriesPer100ml)) {
            console.error(`Invalid calories value for ${drink.name}:`, drink.calories);
            return sum; // Skip drinks with invalid calories values
        }
        const calorieValue = (caloriesPer100ml / 100) * amount; // Calculate calories for the entered amount
        return sum + calorieValue;
    }, 0);

    // Update the total calories in the UI
    document.getElementById('total-calories').textContent = totalCalories.toFixed(1); // Round to 1 decimal place
    console.log(`Updated total calories: ${totalCalories.toFixed(1)} kcal`); // Debugging
}