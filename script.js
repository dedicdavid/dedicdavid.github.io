let drinksData = []; // To hold the loaded data
let selectedDrinks = []; // To hold selected drinks

// Load the data
// Precompute unique ingredients and create vectors
let uniqueIngredients = []; // Store all unique ingredients

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    // Extract unique ingredients
    uniqueIngredients = [...new Set(data.flatMap(drink => drink.ingredients.split(", ").map(ing => ing.trim())))];

    // Convert sugar, calories, and compute ingredient vectors
    drinksData = data.map(drink => ({
      ...drink,
      sugar: parseFloat(drink.sugar) || 0, // Convert sugar to a number
      calories: parseFloat(drink.calories) || 0, // Convert calories to a number
      vector: uniqueIngredients.map(ingredient => drink.ingredients.includes(ingredient) ? 1 : 0) // Ingredient vector
    }));

    console.log('Drinks data with vectors:', drinksData);
    displayFullDrinkList(); // Display the full list of drinks
  })
  .catch(error => console.error('Error loading data:', error));


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
    label.textContent = `${drink.name}`;

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
  recommendDrinks(); // Update recommendations
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
          ` ${drink.name} `
      );

      const removeButton = document.createElement('button');
      removeButton.textContent = 'x';
      removeButton.style.padding = '2px 10px'; // Smaller padding
      removeButton.style.fontSize = '12px'; // Smaller font size
      removeButton.style.borderRadius = '3px'; // Optional: make it rounded
      removeButton.style.border = '1px solid #ccc'; // Optional: define border
      removeButton.style.background = '#f8f8f8'; // Optional: light background
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
function calculateSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

// Recommend drinks based on selected drinks
function recommendDrinks() {
  if (selectedDrinks.length === 0) {
      document.getElementById('recommendations').innerHTML = '<li>No recommendations available.</li>';
      return;
  }

  // Get the average vector of selected drinks
  const avgVector = selectedDrinks
      .map(({ drink }) => drink.vector)
      .reduce((acc, vec) => acc.map((sum, i) => sum + vec[i]), new Array(uniqueIngredients.length).fill(0))
      .map(sum => sum / selectedDrinks.length);

  // Calculate similarity for each drink
  const recommendations = drinksData
      .filter(drink => !selectedDrinks.some(selected => selected.drink === drink)) // Exclude selected drinks
      .map(drink => ({
          ...drink,
          similarity: calculateSimilarity(drink.vector, avgVector)
      }))
      .sort((a, b) => b.similarity - a.similarity) // Sort by similarity
      .slice(0, 3); // Get top 3 recommendations

  // Update recommendations in the UI
  const recommendationsList = document.getElementById('recommendations');
  recommendationsList.innerHTML = '';
  recommendations.forEach(rec => {
      const listItem = document.createElement('li');
      listItem.textContent = `${rec.name}`;
      recommendationsList.appendChild(listItem);
  });
}