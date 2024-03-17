const categoryTypes = {
    fruit: 'fruit',
    vegetables: 'vegetables',
    salads_herbs: 'salads_herbs',
    dairy_eggs: 'dairy_eggs',
    meat_poultry_fish: 'meat_poultry_fish',
    deli_entertain: 'deli_entertain',
    ready_meals: 'ready_meals',
    bakery: 'bakery',
    frozen_food: 'frozen_food',
    pantry: 'pantry',
    drinks: 'drinks',
    wine: 'wine',
    household_cleaning: 'household_cleaning',
    health: 'health_beauty',
  };
  
  const stores = ['woolworths', 'checkers'];
  const units = ['kg', 'g', 'ml', 'L', 'l', 'cm', 'pack', 'pk', 'single', 'half', 'quarter', 'bag', 'tray', 'bunch', 'punnet', 'piece'];

  module.exports = {
    categoryTypes,
    stores,
    units,
  }