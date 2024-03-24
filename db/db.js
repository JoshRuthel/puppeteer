const { Pool } = require('pg');

const db = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'shopping',
  password: 'postgres',
  port: 5432,
});

// Create woolworths_product table
async function createWoolworthsProductTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS woolworths_products (
      id UUID PRIMARY KEY UNIQUE,
      title VARCHAR(255) NOT NULL,
      price FLOAT NOT NULL,
      brand VARCHAR(255),
      volume FLOAT NOT NULL,
      unit VARCHAR(255),
      promotion_id UUID,
      is_vitality BOOLEAN,
      is_wlist BOOLEAN,
      image_url VARCHAR(255),
      category_type VARCHAR(255) NOT NULL,
      high_level_category VARCHAR(255) NOT NULL,
      low_level_category VARCHAR(255) NOT NULL,
      CONSTRAINT unique_title_price UNIQUE (title, price),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(createTableQuery);
    console.log('woolworths_product table created successfully.');
  } catch (error) {
    console.error('Error creating woolworths_product table:', error);
  }
}

// Create woolworths_promotions table
async function createWoolworthsPromotionsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS woolworths_promotions (
      id UUID PRIMARY KEY,
      title VARCHAR(255) NOT NULL UNIQUE
    );
  `;

  try {
    await db.query(createTableQuery);
    console.log('woolworths_promotions table created successfully.');
  } catch (error) {
    console.error('Error creating woolworths_promotions table:', error);
  }
}

// Create product_brand table
async function createProductBrandTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS product_brands (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL
    );
  `;

  try {
    await db.query(createTableQuery);
    console.log('product_brand table created successfully.');
  } catch (error) {
    console.error('Error creating product_brand table:', error);
  }
}

// Create checkers_product table
async function createCheckersProductTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS checkers_products (
      id UUID PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      price FLOAT,
      sale_price FLOAT,
      brand VARCHAR(255),
      volume FLOAT NOT NULL,
      unit VARCHAR(255),
      promotion_id UUID,
      card_required BOOLEAN,
      image_url VARCHAR(255),
      category_type VARCHAR(255) NOT NULL,
      high_level_category VARCHAR(255) NOT NULL,
      low_level_category VARCHAR(255) NOT NULL,
      CONSTRAINT unique_title_price UNIQUE (title, price),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(createTableQuery);
    console.log('checkers_product table created successfully.');
  } catch (error) {
    console.error('Error creating checkers_product table:', error);
  }
}

// Create checkers_promotions table
async function createCheckersPromotionsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS checkers_promotions (
      id UUID PRIMARY KEY,
      title VARCHAR(255) UNIQUE NOT NULL,
      valid_until DATE NOT NULL
    );
  `;

  try {
    await db.query(createTableQuery);
    console.log('checkers_promotions table created successfully.');
  } catch (error) {
    console.error('Error creating checkers_promotions table:', error);
  }
}

// Test the connection
async function initiateConnection() {
  try {
    await db.connect();
    await db.query('SELECT 1');
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

async function createTimeTriggerCheckers() {
  const checkExistQuery = ` SELECT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_checkers_products_timestamp'
  );`;

  const createTriggerQuery = `
  CREATE OR REPLACE FUNCTION update_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER update_checkers_products_timestamp
  BEFORE UPDATE ON checkers_products
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
`;

  try {
    const { rows } = await db.query(checkExistQuery);
    if(rows[0].exists) return console.log('Trigger already exists.');
    await db.query(createTriggerQuery);
    console.log('Trigger created successfully.');
  } catch (error) {
    console.error('Error creating trigger:', error);
  }
}

async function createTimeTriggerWoolworths() {
  const checkExistQuery = ` SELECT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_woolworths_products_timestamp'
  );`;
  const createTriggerQuery = `
  CREATE OR REPLACE FUNCTION update_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER update_woolworths_products_timestamp
  BEFORE UPDATE ON woolworths_products
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
`;

  try {
    const { rows } = await db.query(checkExistQuery);
    if(rows[0].exists) return console.log('Trigger already exists.');
    await db.query(createTriggerQuery);
    console.log('Trigger created successfully.');
  } catch (error) {
    console.error('Error creating trigger:', error);
  }
}

async function setupWoolworths() {
  try {
    await initiateConnection();
    await createWoolworthsProductTable();
    await createWoolworthsPromotionsTable();
    await createTimeTriggerWoolworths();
  } catch (error) {
    console.error('Error setting up Woolworths:', error);
  }
}

async function setupCheckers() {
  try {
    await createCheckersProductTable();
    await createCheckersPromotionsTable();
    await createTimeTriggerCheckers();
  } catch (error) {
    console.error('Error setting up Checkers:', error);
  }
}

async function setupDB() {
  try {
    await initiateConnection();
    await createProductBrandTable();
  } catch (error) {
    console.error('Error setting up DB:', error);
  }
}

async function endDB() {
  await db.end();
}

module.exports = {
  db,
  setupDB,
  setupWoolworths,
  setupCheckers,
  endDB,
};
