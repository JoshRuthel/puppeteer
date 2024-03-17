const { categoryTypes } = require('../db/resources');

const categories = {
  'https://www.woolworths.co.za/cat/Food/Fruit-Vegetables-Salads/Fresh-Fruit/_/N-14dx7ht':
    { category: categoryTypes.fruit },
  'https://www.woolworths.co.za/cat/Food/Fruit-Vegetables-Salads/Fresh-Vegetables/_/N-t8h2zb':
    { category: categoryTypes.vegetables },
  'https://www.woolworths.co.za/cat/Food/Fruit-Vegetables-Salads/Salads-Herbs/_/N-50pb9r':
    { category: categoryTypes.salads_herbs },
  'https://www.woolworths.co.za/cat/Food/Milk-Dairy-Eggs/_/N-1sqo44p': {
    category: categoryTypes.dairy_eggs,
  },
  'https://www.woolworths.co.za/cat/Food/Meat-Poultry-Fish/_/N-d87rb7': {
    category: categoryTypes.meat_poultry_fish,
  },
  'https://www.woolworths.co.za/cat/Food/Deli-Entertaining/_/N-13b8g51': {
    category: categoryTypes.deli_entertain,
  },
  'https://www.woolworths.co.za/cat/Food/Ready-Meals/_/N-s2csbp': {
    category: categoryTypes.ready_meals,
  },
  'https://www.woolworths.co.za/cat/Food/Bakery/_/N-1bm2new': {
    category: categoryTypes.bakery,
  },
  'https://www.woolworths.co.za/cat/Food/Frozen-Food/_/N-j8pkwq': {
    category: categoryTypes.frozen_food,
  },
  'https://www.woolworths.co.za/cat/Food/Pantry/_/N-1lw4dzx': {
    category: categoryTypes.pantry,
  },
  'https://www.woolworths.co.za/cat/Food/Chocolates-Sweets-Snacks/_/N-1yz1i0m':
    { category: categoryTypes.pantry },
  'https://www.woolworths.co.za/cat/Food/Beverages-Juices/_/N-mnxddc': {
    category: categoryTypes.drinks,
  },
  'https://www.woolworths.co.za/cat/WCellar/Wine-Bubbles/_/N-1yphczq': {
    category: categoryTypes.wine,
  },
  'https://www.woolworths.co.za/cat/Food/Household/_/N-vvikef': {
    category: categoryTypes.household_cleaning,
  },
  'https://www.woolworths.co.za/cat/Food/Cleaning/_/N-o1v4pe': {
    category: categoryTypes.household_cleaning,
  },
  'https://www.woolworths.co.za/cat/Food/Toiletries-Health/_/N-1q1wl1r': {
    category: categoryTypes.health,
  },
};

module.exports = {
  categories,
};
