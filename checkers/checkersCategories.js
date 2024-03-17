const { categoryTypes } = require('../resources');

const categories = {
  'https://www.checkers.co.za/c-66/All-Departments/Food/Fresh-Food/Fresh-Fruit?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.fruit },
  'https://www.checkers.co.za/c-2423/All-Departments/Food/Fresh-Food/Fresh-Vegetables?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.vegetables },
  'https://www.checkers.co.za/c-93/All-Departments/Food/Fresh-Food/Fresh-Salad%2C-Herbs-and-Dip?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.salads_herbs },
  'https://www.checkers.co.za/c-2449/All-Departments/Food/Fresh-Food/Cheese?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.dairy_eggs },
  'https://www.checkers.co.za/c-2515/All-Departments/Food/Fresh-Food/Fresh-Meat-and-Poultry?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.meat_poultry_fish },
  'https://www.checkers.co.za/c-2530/All-Departments/Food/Fresh-Food/Fresh-Fish-and-Seafood?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.meat_poultry_fish },
  'https://www.checkers.co.za/c-2464/All-Departments/Food/Fresh-Food/Yoghurt?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.dairy_eggs },
  'https://www.checkers.co.za/c-2475/All-Departments/Food/Fresh-Food/Milk%2C-Butter-and-Eggs?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.dairy_eggs },
  'https://www.checkers.co.za/c-2489/All-Departments/Food/Fresh-Food/Cooked-Meats%2C-Sandwich-Fillers-and-Deli?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.deli_entertain },
  'https://www.checkers.co.za/c-2709/All-Departments/Food/Platters-and-Fruit-Baskets?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.deli_entertain },
  'https://www.checkers.co.za/c-2501/All-Departments/Food/Fresh-Food/Ready-Meals?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.ready_meals },
  'https://www.checkers.co.za/c-2483/All-Departments/Food/Fresh-Food/Fresh-and-Chilled-Desserts?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.pantry },
  'https://www.checkers.co.za/c-2540/All-Departments/Food/Frozen-Food?q=%3Arelevance%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.frozen_food },
  'https://www.checkers.co.za/c-2614/All-Departments/Food/Bakery?q=%3Arelevance%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=0':
    { category: categoryTypes.bakery },
  'https://www.checkers.co.za/c-92/All-Departments/Food/Food-Cupboard?q=%3Arelevance%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=':
    { category: categoryTypes.pantry, iterate: true, endPage: 242 },
  'https://www.checkers.co.za/c-2721/All-Departments/Household?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=':
    { category: categoryTypes.household_cleaning, iterate: true, endPage: 377 },
  'https://www.checkers.co.za/c-2748/All-Departments/Health-and-Beauty?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=':
    {
      category: categoryTypes.health,
      startPage: 0,
      iterate: true,
      endPage: 319,
    },
};

module.exports = {
  categories,
};
