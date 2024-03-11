const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('shopping', 'postgres', 'postgres', {
  dialect: 'postgres',
  host: 'localhost',
  port: 5432, // Default PostgreSQL port
  logging: false
});

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

const highLevelCategories = [];
const lowLevelCategories = [];

const stores = ['woolworths', 'checkers'];
const units = [  'kg',
'g',
'ml',
'L',
'l',
'cm',
'pack',
'pk',
'single',
'half',
'quarter',
'bag',
'tray',
'bunch',
'punnet',
'piece',];

const woolworthsProduct = sequelize.define('woolworths_product', {
  // id: {
  //   type: DataTypes.INTEGER,
  //   primaryKey: true,
  //   autoIncrement: true,
  // },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  volume: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  volumeUnit: {
    type: DataTypes.ENUM(units),
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  promotionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isVitality: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  isWList: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  categoryType: {
    type: DataTypes.ENUM(Object.values(categoryTypes)),
    allowNull: false,
  },
  highLevelCategory: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lowLevelCategory: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const woolworthsPromotions = sequelize.define('woolworths_promotions', {
  // id: {
  //   type: DataTypes.INTEGER,
  //   primaryKey: true,
  //   autoIncrement: true,
  // },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Populate this brandlist from checkers scrape (woolworths don't have a key for brands)
const productBrands = sequelize.define('product_brand', {
  // id: {
  //   type: DataTypes.INTEGER,
  //   primaryKey: true,
  //   autoIncrement: true,
  // },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(Object.values(categoryTypes)),
    allowNull: false,
  },

});

const checkersProduct = sequelize.define('checkers_product', {
  // id: {
  //   type: DataTypes.INTEGER,
  //   primaryKey: true,
  // },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  standardPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  salePrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  volume: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  volumeUnit: {
    type: DataTypes.ENUM(units),
    allowNull: true,
  },
  promotionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  loyaltyCardRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  categoryType: {
    type: DataTypes.ENUM(Object.values(categoryTypes)),
    allowNull: false,
  },
  highLevelCategory: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lowLevelCategory: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const checkersPromotions = sequelize.define('checkers_promotions', {
  // id: {
  //   type: DataTypes.INTEGER,
  //   primaryKey: true,
  //   autoIncrement: true,
  // },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.sync();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } 
}

module.exports = {
  sequelize,
  woolworthsProduct,
  productBrands,
  checkersProduct,
  woolworthsPromotions,
  checkersPromotions,
  categoryTypes,
  testConnection,
  units
};
