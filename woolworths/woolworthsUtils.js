const { db } = require('../db/db');
const { getVolume, delay, downloadImage } = require('../utils/utilFunctions');
const { v4: uuid } = require('uuid');

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
  const productCountEl = await page.$('label.product-records__count');
  const productCount = await page.evaluate(
    (el) => parseInt(el.innerText.split(' Items')[0]),
    productCountEl
  );

  let nextPageExists = true;
  let pageNumber = initialPage ?? 1;
  let lastPage = Math.min(Math.ceil(productCount / 24), endPage ?? 100000);
  while (
    nextPageExists &&
    productData.length < productCount &&
    pageNumber <= lastPage
  ) {
    console.log(`Scraping page ${pageNumber} of ${lastPage}`);
    for (let trials = 0; trials < 2; trials++) {
      try {
        await extractProductInfo(page, productData, categoryType, productCount);
        await delay(2000);
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
}

async function scrollPage(page) {
  // Function to scroll by a small distance
  const scrollBy = async (distance) => {
    await page.evaluate((distance) => {
      window.scrollBy(0, distance);
    }, distance);
  };

  // Scroll down slowly in small increments
  const scrollDistance = 100; // Adjust this value as needed
  const scrollDelay = 100; // Adjust this value to control the delay between each scroll action

  for (let i = 0; i < 30; i++) {
    // Adjust the number of iterations to scroll further
    await scrollBy(scrollDistance);
    await delay(scrollDelay);
  }
}

async function extractProductInfo(
  page,
  productData,
  categoryType,
  productCount
) {
  for (let trials = 0; trials < 5; trials++) {
    try {
      await scrollPage(page);
      await delay(1000);
      await page.waitForSelector('div.product-list__item');
      const products = await page.$$('div.product-list__item');

      //Product information capture
      for (let i = 0; i < products.length; i++) {
        const elementHandle = products[i];
        if (productData.length < productCount) {
          await getProductData(page, elementHandle, categoryType, productData);
        } else break;
      }
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

// Finds promotionId for the title, otherwise inserts as new entry into the table
async function addOrFindPromotion(promotionText) {
  if (!promotionText) return null;
  try {
    const text = promotionText.trim();
    const selectQuery = `SELECT * FROM woolworths_promotions WHERE title = $1`;
    const { rows: promotion } = await db.query(selectQuery, [text]);
    if (promotion && promotion.length) return promotion[0].id;
    else {
      const insertQuery = `INSERT INTO woolworths_promotions (id, title) VALUES ($1, $2) RETURNING id`;
      const { rows: promotion } = await db.query(insertQuery, [uuid(), text]);
      return promotion[0].id;
    }
  } catch (e) {
    console.error('Error adding or finding promotion:', e);
  }
}

async function fetchProductData(element) {
  // Fetch product title
  let titleElement = await element.querySelector('a.range--title');
  if (!titleElement)
    titleElement = await element.querySelector('h2.product-card__name');
  // Product price
  const priceElement = await element.querySelector('strong.price');
  //Product promotion
  const promotionElement = await element.querySelector('div.product__special');
  let promotionId = null;
  //Fetch promotion info
  if (promotionElement) promotionId = promotionElement.innerText.trim();
  // Product vitality and wlist attributes
  const productIndicator = await element.querySelector('div.prod-indicator');
  let wlist = false;
  let vitality = false;
  if (productIndicator)
    wlist = await productIndicator.querySelector('div.wlist');
  vitality = await productIndicator.querySelector('div.vitality');
  return {
    title: titleElement ? titleElement.innerText.trim() : 'N/A',
    price: priceElement ? priceElement.innerText.trim() : 'N/A',
    imageURL: '',
    promotionId,
    isVitality: vitality ? true : false,
    isWList: wlist ? true : false,
    highLevelCategory: '',
    lowLevelCategory: '',
  };
}

async function getProductData(page, elementHandle, categoryType, productData) {
  const productInfo = await page.evaluate(fetchProductData, elementHandle);
  const imageElement = await elementHandle.$('img');
  const imageURL = await page.evaluate((el) => el.src, imageElement);
  const brand = await getWBrandName(productInfo.title, categoryType);
  const [volumeUnit, volume] = getVolume(productInfo.title);
  const id = uuid();

  const promotionId = await addOrFindPromotion(productInfo.promotionId);
  const price = productInfo.price.replace('R', '').trim();
  productData.push({
    id,
    ...productInfo,
    imageURL,
    price,
    brand,
    volume,
    volumeUnit: volumeUnit === 'pk' ? 'pack' : volumeUnit,
    promotionId,
    categoryType,
  });
}

async function clickPaginationButton(page) {
  const paginationButtons = await page.$$('.pagination__nav'); // Locate the pagination button
  const nextButton = paginationButtons[1];
  if (paginationButtons) {
    try {
      await nextButton.click();
      return true; // Indicate successful click
    } catch (e) {
      return false;
    } // Click the pagination button
  }
  return false; // Indicate button not found
}

// Tries to match the brand name in the title
async function getWBrandName(title, categoryType) {
  const query = `
    SELECT name
    FROM product_brands
    WHERE $1 LIKE CONCAT('%', name, '%')
    AND type = $2`;
  const { rows: brands } = await db.query(query, [title, categoryType]);
  if (brands.length) return brands[0].name;
  return 'Woolworths Housebrand';
}

async function insertData(productData) {
  console.log(`Inserting ${productData.length} products`);
  for (const product of productData) {
    // Find product by title
    const query = `
    INSERT INTO woolworths_products (id, title, price, volume, unit, brand, promotion_id, is_vitality, is_wlist, image_url, category_type, high_level_category, low_level_category)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (title, price) DO UPDATE
    SET 
        price = EXCLUDED.price,
        promotion_id = EXCLUDED.promotion_id
  `;
    try {
      const { rows } = await db.query(query, [
        product.id,
        product.title,
        product.price,
        product.volume,
        product.volumeUnit,
        product.brand,
        product.promotionId,
        product.isVitality,
        product.isWList,
        'temp',
        product.categoryType,
        product.highLevelCategory,
        product.lowLevelCategory,
      ]);
      if (rows.length) continue;
      const imageURL = await downloadImage(product.imageURL, product.id);
      const updateURLQuery = `UPDATE woolworths_products SET image_url = $1 WHERE id = $2`;
      try {
        await db.query(updateURLQuery, [imageURL, product.id]);
      } catch (e) {
        console.error('Error updating imageUrl:', e);
      }
    } catch (e) {
      console.error('Error inserting product:', e);
    }
  }
}

module.exports = {
  insertData,
  navigatePage,
};
