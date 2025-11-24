let rapidApiKey = '';
let vegApiUrl = 'https://the-vegan-recipes-db.p.rapidapi.com';

let recipeList = [];
let filteredList = [];

document.addEventListener('DOMContentLoaded', () => {
    if (typeof config !== 'undefined' && config.RAPIDAPI_KEY) {
        rapidApiKey = config.RAPIDAPI_KEY;
    } else {
        showError('API key not configured. Please set up config.js with your RapidAPI key.');
        return;
    }

    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('loadAllBtn').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        handleSearch();
    });
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    document.getElementById('difficultyFilter').addEventListener('change', applyFilters);

    document.getElementById('sortBy').addEventListener('change', applySorting);

    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
});

async function handleSearch() {
    const userQuery = document.getElementById('searchInput').value.trim();
    
    console.log('Searching for:', userQuery || 'all recipes');
    
    hideError();
    toggleLoading(true);
    hideResults();

    try {
        const foundRecipes = await searchRecipes(userQuery);
        recipeList = foundRecipes;
        applyFilters();
    } catch (err) {
        console.error('Search error:', err);
        showError('Failed to search recipes: ' + err.message);
        toggleLoading(false);
    }
}

async function searchRecipes(queryText) {
    const apiUrl = vegApiUrl + '/';

    return fetch(apiUrl, {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'the-vegan-recipes-db.p.rapidapi.com'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('API error: ' + response.status);
        }
        return response.json();
    }).then(data => {
        if (!data || data.length === 0) {
            toggleLoading(false);
            showNoResults();
            return [];
        }
        
        const allRecipes = Array.isArray(data) ? data : [];
        
        if (!queryText || queryText.trim() === '') {
            toggleLoading(false);
            return allRecipes;
        }
        
        const searchLower = queryText.toLowerCase();
        const filtered = allRecipes.filter(rec => {
            const title = (rec.title || '').toLowerCase();
            return title.includes(searchLower);
        });
        
        toggleLoading(false);
        return filtered;
    }).catch(err => {
        toggleLoading(false);
        throw err;
    });
}

function applyFilters() {
    const difficultyVal = document.getElementById('difficultyFilter').value;

    filteredList = recipeList.filter(rec => {
        if (difficultyVal && rec.difficulty) {
            if (rec.difficulty.toLowerCase() !== difficultyVal.toLowerCase()) {
                return false;
            }
        }
        return true;
    });
    
    applySorting();
}

function applySorting() {
    const sortOption = document.getElementById('sortBy').value;
    const sortedRecipes = [...filteredList];

    switch (sortOption) {
        case 'title-asc':
            sortedRecipes.sort((r1, r2) => {
                const t1 = (r1.title || '').toLowerCase();
                const t2 = (r2.title || '').toLowerCase();
                return t1.localeCompare(t2);
            });
            break;

        case 'title-desc':
            sortedRecipes.sort((r1, r2) => {
                const t1 = (r1.title || '').toLowerCase();
                const t2 = (r2.title || '').toLowerCase();
                return t2.localeCompare(t1);
            });
            break;

        case 'difficulty':
            sortedRecipes.sort((r1, r2) => {
                const d1 = r1.difficulty || '';
                const d2 = r2.difficulty || '';
                const order = { 'Easy': 1, 'Medium': 2, 'A challenge': 3 };
                return (order[d1] || 99) - (order[d2] || 99);
            });
            break;

        default:
            break;
    }

    displayRecipes(sortedRecipes);
}

function displayRecipes(recipeArray) {
    const recipeContainer = document.getElementById('recipesContainer');
    const resultsDiv = document.getElementById('resultsSection');
    const countElement = document.getElementById('resultsCount');
    const noResultsDiv = document.getElementById('noResults');

    if (recipeArray.length === 0) {
        resultsDiv.classList.add('hidden');
        noResultsDiv.classList.remove('hidden');
        return;
    }

    noResultsDiv.classList.add('hidden');
    resultsDiv.classList.remove('hidden');
    
    const plural = recipeArray.length !== 1 ? 's' : '';
    countElement.textContent = 'Found ' + recipeArray.length + ' Recipe' + plural;

    recipeContainer.innerHTML = recipeArray.map(r => createRecipeCard(r)).join('');
}

function createRecipeCard(rec) {
    const imgUrl = rec.image || 'https://via.placeholder.com/300x200?text=No+Image';
    const recTitle = rec.title || 'Untitled Recipe';
    const difficulty = rec.difficulty || 'N/A';

    const cardHtml = '<div class="recipe-card">' +
        '<img src="' + imgUrl + '" alt="' + recTitle + '" class="recipe-image" onerror="this.src=\'https://via.placeholder.com/300x200?text=No+Image\'">' +
        '<div class="recipe-content">' +
        '<h3 class="recipe-title">' + recTitle + '</h3>' +
        '<div class="recipe-info">' +
        '<div class="info-item"><strong>Difficulty:</strong> ' + difficulty + '</div>' +
        '</div>' +
        '</div></div>';

    return cardHtml;
}

function clearFilters() {
    document.getElementById('difficultyFilter').value = '';
    document.getElementById('sortBy').value = 'relevance';
    applyFilters();
}

function toggleLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (show) {
        loader.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
    }
}

function showError(errMsg) {
    const errDiv = document.getElementById('errorMessage');
    errDiv.textContent = errMsg;
    errDiv.classList.remove('hidden');
}

function hideError() {
    document.getElementById('errorMessage').classList.add('hidden');
}

function hideResults() {
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('noResults').classList.add('hidden');
}

function showNoResults() {
    document.getElementById('noResults').classList.remove('hidden');
}
