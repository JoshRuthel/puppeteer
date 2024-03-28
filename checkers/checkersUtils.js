const brandData = [];
const { getVolume, delay } = require('../utils//utilFunctions');
const { db } = require('../db/db');
const { categoryTypes } = require('../db/resources');
const { downloadImage } = require('../utils/utilFunctions');
const { v4: uuid } = require('uuid');

// Tries to match the brand name in the title
async function getCBrandName(title, categoryType) {
  const query = `SELECT name
  FROM product_brands
  WHERE $1 LIKE CONCAT('%', name, '%')
  AND type = $2`;

  try {
    const { rows: brands } = await db.query(query, [title, categoryType]);
    if (brands && brands.length) return brands[0].name;
    if (
      categoryType === categoryTypes.fruit ||
      categoryType === categoryTypes.vegetables ||
      categoryType === categoryTypes.salads_herbs
    )
      return 'Freshmark';
    return 'Checkers Housebrand';
  } catch (e) {
    console.error('Error getting brand:', e);
  }
}

//Checks if brand exists and will insert it if it does not
async function insertBrands() {
  for (const brand of brandData) {
    try {
      const query = 'SELECT name FROM product_brands WHERE name = $1';
      const { rows: brands } = await db.query(query, [brand.name]);
      if (brands && brands.length) continue;
      else {
        const insertQuery =
          'INSERT INTO product_brands(id, name, type) VALUES($1, $2, $3)';
        await db.query(insertQuery, [uuid(), brand.name, brand.type]);
      }
    } catch (e) {
      console.error('Error inserting brand:', e);
    }
  }
}

async function insertData(productData) {
  console.log(`Inserting ${productData.length} products`);
  for (const product of productData) {
    // Find product by title
    const checkQuery = 'SELECT id FROM checkers_products WHERE title = $1 AND price = $2';
    const { rows: check } = await db.query(checkQuery, [product.title, product.standardPrice]);
    console.log(check)
    if (check.length) {
      const updateQuery = `UPDATE checkers_products
      SET 
          price = $1,
          sale_price = $2,
          promotion_id = $3,
          card_required = $4
      WHERE id = $5;`;
      try {
        await db.query(updateQuery, [
          product.standardPrice,
          product.salePrice,
          product.promotionId,
          product.loyaltyCardRequired,
          check[0].id,
        ]);
      } catch (e) {
        console.error('Error updating product:', e);
      }
    } else {
      const imageURL = await downloadImage(product.imageURL, product.id);
      const insertQuery = `INSERT INTO checkers_products (id, title, price, sale_price, volume, unit, brand, promotion_id, card_required, image_url, category_type, high_level_category, low_level_category)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`
      try {
        await db.query(insertQuery, [
          product.id,
          product.title,
          product.standardPrice,
          product.salePrice,
          product.volume,
          product.volumeUnit,
          product.brand,
          product.promotionId,
          product.loyaltyCardRequired,
          imageURL,
          product.categoryType,
          product.highLevelCategory,
          product.lowLevelCategory,
        ]);
        console.log('Inserted image', imageURL);
      } catch (e) {
        console.error('Error inserting product:', e);
      }
    }
  }
}

async function fetchBrands(page, categoryType) {
  const brandContainer = await page.$('div#brand');
  const brandItems = await brandContainer.$$('li');
  for (const brandElement of brandItems) {
    const name = await brandElement.$eval('span.facet__list__text', (el) =>
      el.textContent.trim().split(' ').slice(0, -1).join(' ').trim()
    );
    brandData.push({
      name,
      type: categoryType,
    });
  }
}

async function getPromotionData(promotion, productData, page) {
  await page.goto(promotion.promotionLink);
  await page.setDefaultNavigationTimeout(30000);
  const promotionTitle = await page.$eval('h1.bonus-buy__title', (el) =>
    el.textContent.trim()
  );
  const validUntil = await page.$eval('span.bonus-buy__valid-date', (el) =>
    el.innerText.trim()
  );
  const promotionId = await addOrFindPromotion(promotionTitle, validUntil);
  productData[promotion.productIndex].promotionId = promotionId;
}

async function getProductData(page, elementHandle, categoryType, productData) {
  const dataProductGa = await page.evaluate((element) => {
    return element.getAttribute('data-product-ga');
  }, elementHandle);
  const parsedData = JSON.parse(dataProductGa);
  // Product promotion
  //Product brand
  const brand = await getCBrandName(parsedData.name ?? null, categoryType);
  //Product options
  const extraSavings = await elementHandle.$(
    'div.item-product__options--right > div.product-option--xtra-savings'
  );
  //Volume info
  const [volumeUnit, volume] = getVolume(parsedData.name);

  const id = uuid();

  if (dataProductGa) {
    productData.push({
      id,
      title: parsedData.name,
      standardPrice: parsedData.price === '' ? null : parsedData.price,
      salePrice:
        parsedData['unit_sale_price'] === ''
          ? null
          : parsedData['unit_sale_price'],
      brand,
      volume,
      volumeUnit,
      imageURL: parsedData.product_image_url,
      promotionId: null,
      loyaltyCardRequired: extraSavings ? true : false,
      categoryType,
      highLevelCategory: '',
      lowLevelCategory: '',
    });
  }
}

async function getPromotionInfo(elementHandle, page, promotionLinks, i) {
  const promotionElement = await elementHandle.$(
    'span.js-item-product__message > a'
  );
  if (promotionElement) {
    const hrefLink = await page.evaluate((element) => {
      return element.getAttribute('href');
    }, promotionElement);
    const promotionLink = 'https://www.checkers.co.za/' + hrefLink;
    promotionLinks.push({
      promotionLink,
      productIndex: i,
    });
  }
}

// Finds promotionId for the title, otherwise inserts as new entry into the table
async function addOrFindPromotion(promotionText, validUntil) {
  // Will search for already existing promotion or create a new entry and return the id
  try {
    const selectQuery = `SELECT id FROM checkers_promotions WHERE title = $1`;
    const { rows: promotion } = await db.query(selectQuery, [promotionText.trim()]);
    if (promotion && promotion.length) return promotion[0].id;
    else {
      const insertQuery = `INSERT INTO checkers_promotions (id, title, valid_until) VALUES ($1, $2, $3) RETURNING id`;
      const text = promotionText.trim();
      const date = new Date(validUntil.replace('Valid until ', '').trim());
      const id = uuid();
      const { rows: promotion } = await db.query(insertQuery, [id, text, date]);
      return promotion[0].id;
    }
  } catch (e) {
    console.error('Error adding or finding promotion:', e);
  }
}

async function navigatePage(
  page,
  productData,
  initialPage,
  endPage,
  url,
  categoryType
) {
  await page.goto(url);
  await page.setDefaultNavigationTimeout(30000);
  const productCountEl = await page.$('p.total-number-of-results.pull-right');
  const productCount = await page.evaluate(
    (el) => parseInt(el.innerText.trim().replace(',', '').split(' items')[0]),
    productCountEl
  );
  let nextPageExists = true;
  let pageNumber = initialPage ?? 1;
  let lastPage = Math.min(Math.ceil(productCount / 20), endPage ?? 100000);
  while (
    nextPageExists &&
    productData.length < productCount &&
    pageNumber <= lastPage
  ) {
    console.log(`Scraping page ${pageNumber} of ${lastPage}`);
    for (let trials = 0; trials < 2; trials++) {
      try {
        await extractProductInfo(
          pageNumber,
          page,
          productData,
          categoryType,
          productCount
        );
        nextPageExists = await clickPaginationButton(page);
        pageNumber++;
        break;
      } catch (e) {
        console.error(e);
        console.log('Trying page scrape again');
        await delay(10000);
      }
    }
  }
  console.log('Finished', categoryType);
  return Math.ceil(productCount / 20);
}

async function extractProductInfo(
  pageNumber,
  page,
  productData,
  categoryType,
  productCount
) {
  for (let trials = 0; trials < 5; trials++) {
    try {
      const promotionLinks = [];
      await page.waitForSelector('div.product-frame.product-ga');
      const products = await page.$$('div.product-frame.product-ga');
      const currentUrl = page.url();

      if (pageNumber < 2) {
        //Fetch brand data
        await fetchBrands(page, categoryType);
        //Update product brands table
        await insertBrands();
      }

      //Product information capture
      for (let i = 0; i < products.length; i++) {
        const elementHandle = products[i];
        if (productData.length < productCount) {
          await getProductData(page, elementHandle, categoryType, productData);
          await getPromotionInfo(elementHandle, page, promotionLinks, i);
        } else break;
      }

      //Promotion info capture
      for (const promotion of promotionLinks) {
        await getPromotionData(promotion, productData, page);
      }
      await page.goto(currentUrl);
      return;
    } catch (e) {
      console.log(`Failed at ${page.url()}`);
      console.error('Error:', e);
      console.log('Trying product scrape again');
      await delay(10000);
    }
  }
  return;
}

async function clickPaginationButton(page) {
  const paginationButton = await page.$('li.pagination-next'); // Locate the pagination button
  if (paginationButton) {
    await paginationButton.click(); // Click the pagination button
    return true; // Indicate successful click
  }
  return false; // Indicate button not found
}

module.exports = {
  insertData,
  navigatePage,
};
