document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const randomBtn = document.getElementById('random-btn');
    const mealTypeSelect = document.getElementById('meal-type');
    const dietTypeSelect = document.getElementById('diet-type');
    const recipesGrid = document.getElementById('recipes-grid');
    const resultsTitle = document.getElementById('results-title');
    const modal = document.getElementById('recipe-modal');
    const modalContent = document.getElementById('modal-content');
    const closeBtn = document.querySelector('.close-btn');

    // API configuration
    const API_KEY = '1'; // Using a public API that doesn't require a key
    const API_URL = 'https://www.themealdb.com/api/json/v1/1/';
    
    // Event Listeners
    searchBtn.addEventListener('click', searchRecipes);
    randomBtn.addEventListener('click', getRandomRecipe);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', outsideClick);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchRecipes();
        }
    });

    // Search for recipes
    async function searchRecipes() {
        const searchTerm = searchInput.value.trim();
        const mealType = mealTypeSelect.value;
        const dietType = dietTypeSelect.value;
        
        if (!searchTerm) {
            alert('Please enter an ingredient to search for');
            return;
        }
        
        try {
            let url = `${API_URL}filter.php?i=${searchTerm}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            displayResults(data.meals, searchTerm);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            displayNoResults(searchTerm);
        }
    }

    // Display search results
    function displayResults(recipes, searchTerm) {
        recipesGrid.innerHTML = '';
        resultsTitle.textContent = `Results for "${searchTerm}"`;
        
        if (!recipes) {
            displayNoResults(searchTerm);
            return;
        }
        
        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            recipeCard.innerHTML = `
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="recipe-img">
                <div class="recipe-info">
                    <h3 class="recipe-title">${recipe.strMeal}</h3>
                    <div class="recipe-details">
                        <span><i class="fas fa-utensils"></i> ${recipe.strCategory || 'N/A'}</span>
                        <span><i class="fas fa-globe"></i> ${recipe.strArea || 'N/A'}</span>
                    </div>
                </div>
            `;
            
            recipeCard.addEventListener('click', () => getRecipeDetails(recipe.idMeal));
            recipesGrid.appendChild(recipeCard);
        });
    }

    // Display no results message
    function displayNoResults(searchTerm) {
        recipesGrid.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-exclamation-circle fa-3x"></i>
                <p>No recipes found for "${searchTerm}". Try another ingredient!</p>
            </div>
        `;
    }

    // Get random recipe
    async function getRandomRecipe() {
        try {
            const response = await fetch(`${API_URL}random.php`);
            const data = await response.json();
            
            if (data.meals) {
                getRecipeDetails(data.meals[0].idMeal);
            }
        } catch (error) {
            console.error('Error fetching random recipe:', error);
        }
    }

    // Get recipe details by ID
    async function getRecipeDetails(id) {
        try {
            const response = await fetch(`${API_URL}lookup.php?i=${id}`);
            const data = await response.json();
            
            if (data.meals) {
                displayRecipeDetails(data.meals[0]);
            }
        } catch (error) {
            console.error('Error fetching recipe details:', error);
        }
    }

    // Display recipe details in modal
    function displayRecipeDetails(recipe) {
        modalContent.innerHTML = `
            <div class="recipe-modal-content">
                <div class="recipe-modal-header">
                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="recipe-modal-img">
                    <div>
                        <h2 class="recipe-modal-title">${recipe.strMeal}</h2>
                        <div class="recipe-modal-details">
                            <span><i class="fas fa-utensils"></i> ${recipe.strCategory}</span>
                            <span><i class="fas fa-globe"></i> ${recipe.strArea}</span>
                            ${recipe.strTags ? `<span><i class="fas fa-tags"></i> ${recipe.strTags.split(',').join(', ')}</span>` : ''}
                        </div>
                        <button class="favorite-btn"><i class="far fa-heart"></i> Add to Favorites</button>
                    </div>
                </div>
                
                <div class="recipe-modal-section">
                    <h3>About This Dish</h3>
                    <p class="recipe-modal-summary">${recipe.strInstructions}</p>
                </div>
                
                <div class="recipe-modal-section">
                    <h3>Ingredients</h3>
                    <div class="recipe-modal-ingredients">
                        ${getIngredientsList(recipe)}
                    </div>
                </div>
                
                ${recipe.strYoutube ? `
                <div class="recipe-modal-section">
                    <h3>Video Tutorial</h3>
                    <div class="video-container">
                        <iframe width="100%" height="400" src="https://www.youtube.com/embed/${recipe.strYoutube.split('v=')[1]}" frameborder="0" allowfullscreen></iframe>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add event listener to favorite button
        const favoriteBtn = document.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-heart"></i> Added to Favorites';
            this.style.backgroundColor = '#4ecdc4';
            this.style.color = 'white';
            
            // In a real app, you would save to localStorage or a database
            setTimeout(() => {
                this.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
                this.style.backgroundColor = '';
                this.style.color = '';
            }, 2000);
        });
    }

    // Helper function to get ingredients list
    function getIngredientsList(recipe) {
        let ingredientsHtml = '';
        
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim() !== '') {
                ingredientsHtml += `
                    <div class="ingredient-item">
                        <img src="https://www.themealdb.com/images/ingredients/${ingredient}-Small.png" alt="${ingredient}">
                        <span>${measure} ${ingredient}</span>
                    </div>
                `;
            }
        }
        
        return ingredientsHtml;
    }

    // Close modal
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Close modal when clicking outside
    function outsideClick(e) {
        if (e.target === modal) {
            closeModal();
        }
    }
});
