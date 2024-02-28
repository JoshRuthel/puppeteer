const brandData = [];

const {
  categoryTypes,
  sequelize,
  checkersProduct,
  checkersPromotions,
  productBrands,
} = require('./db');

const units = [
  'kg',
  'g',
  'ml',
  'L',
  'l',
  'cm',
  'pack',
  'single',
  'half',
  'quarter',
  'bag',
  'tray',
  'bunch',
  'punnet',
  'piece',
];

async function insertData(productData) {
  console.log(`Inserting ${productData.length} products`);
  for (const product of productData) {
    // Find product by title
    const existingProduct = await checkersProduct.findOne({
      where: { title: product.title },
    });

    if (existingProduct) {
      // Compare fields and update if necessary
      const changedFields = {};
      if (
        product.standardPrice &&
        existingProduct.standardPrice !== product.standardPrice
      ) {
        changedFields.standardPrice = product.standardPrice;
      }
      if (
        product.salePrice &&
        existingProduct.salePrice !== product.salePrice
      ) {
        changedFields.salePrice = product.salePrice;
      }
      if (
        product.promotionId &&
        existingProduct.promotionId !== product.promotionId
      ) {
        changedFields.promotionId = product.promotionId;
      }
      if (
        product.loyaltyCardRequired &&
        existingProduct.loyaltyCardRequired !== product.loyaltyCardRequired
      ) {
        changedFields.loyaltyCardRequired = product.loyaltyCardRequired;
      }

      if (Object.keys(changedFields).length > 0) {
        await existingProduct.update(changedFields);
      }
    } else {
      // Insert new product
      try {
        await checkersProduct.create(product);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

async function insertBrands() {
  for (const brand of brandData) {
    await productBrands.findOrCreate({
      where: { name: brand.name },
      defaults: { name: brand.name, type: brand.type },
    });
  }
}

async function fetchBrands(page, categoryType) {
  const brandContainer = await page.$('div#brand');
  const brandItems = await brandContainer.$$('li');
  for (const brandElement of brandItems) {
    const name = await brandElement.$eval('span.facet__list__text', (el) =>
      el.textContent.trim().split(' ')[0].trim()
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
  const brand = await getBrandName(parsedData.name ?? null, categoryType);
  //Product options
  const extraSavings = await elementHandle.$(
    'div.item-product__options--right > div.product-option--xtra-savings'
  );
  //Volume info
  const [volumeUnit, volume] = getVolume(parsedData.name);

  if (dataProductGa) {
    productData.push({
      title: parsedData.name,
      standardPrice: parsedData.price === '' ? null : parsedData.price,
      salePrice:
        parsedData['unit_sale_price'] === ''
          ? null
          : parsedData['unit_sale_price'],
      brand,
      volume,
      volumeUnit,
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
  const [promotion, _] = await checkersPromotions.findOrCreate({
    where: { title: promotionText.trim() },
    defaults: { title: promotionText.trim(), validUntil },
  });
  return promotion.id;
}

// Tries to match the brand name in the title
async function getBrandName(title, categoryType) {
  const query = `
    SELECT name
    FROM product_brands
    WHERE :title LIKE CONCAT('%', name, '%')`;

  const brands = await sequelize.query(query, {
    replacements: { title: title.trim() },
    type: sequelize.QueryTypes.SELECT,
  });

  if (brands.length) return brands[0].name;
  if (
    categoryType === categoryTypes.fruit ||
    categoryType === categoryTypes.vegetables ||
    categoryType === categoryTypes.salads_herbs
  )
    return 'Freshmark';
  return 'Checkers Housebrand';
}

function getVolume(title) {
  if (title.includes('(Single Item)')) return ['single', 1];
  let fullTitle = title.replace(/\([^)]*\)/g, "").trim().toLowerCase(); //removes any bracket information (not needed usually)
  fullTitle = fullTitle.replace(" tub", "").replace(" bowl", "").replace(">", "").replace("<", "").trim()
  const unitSection = fullTitle.split(' ').pop();
  for (const unit of units) {
    if (unitSection.includes(unit)) {
      //Numberless units
      if (
        [
          'quarter',
          'single',
          'half',
          'bag',
          'tray',
          'bunch',
          'punnet',
        ].includes(unitSection)
      )
        return [unitSection, 1];
      //Volume units
      const volume = fullTitle.replace(unit, '').trim().split(' ').pop();
      //odd kg case
      if (volume === 'per') return [unit, 1];
      volumeNumber = parseFloat(volume);
      // catch any edge cases - where there are no measurements and unit matches title name (not actually a unit match)
      if (isNaN(volumeNumber))
        return ['single', 1];
      //Volume multipliers
      if (fullTitle.includes(' x ')) {
        const volumeSplit = fullTitle.split(' x ');
        const amount = Number(volumeSplit[0].split(' ').pop());
        volumeNumber *= amount;
      }
      return [unit, volumeNumber];
    }
  }
  return ['single', 1];
}

export async function navigatePage(
  page,
  productCount,
  productData,
  initialPage,
  endPage,
  url,
  categoryType
) {
  await page.goto(url);
  await page.setDefaultNavigationTimeout(30000);
  const productCountEl = await page.$('p.total-number-of-results.pull-right');
  productCount = await page.evaluate(
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
    for(let trials = 0; trials < 2; trials++) {
      try {
        await extractProductInfo(pageNumber, page, productData, categoryType, productCount);
        nextPageExists = await clickPaginationButton();
        pageNumber++
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

export async function extractProductInfo(pageNumber, page, productData, categoryType, productCount) {
  for(let trials = 0; trials < 5; trials++) {
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
          await getProductData(
            page,
            elementHandle,
            categoryType,
            productData
          );
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

export async function clickPaginationButton(page,) {
  const paginationButton = await page.$('li.pagination-next'); // Locate the pagination button
  if (paginationButton) {
    await paginationButton.click(); // Click the pagination button
    return true; // Indicate successful click
  }
  return false; // Indicate button not found
}

export const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

module.exports = {
  insertData,
  insertBrands,
  fetchBrands,
  getPromotionData,
  getProductData,
  getPromotionInfo,
};

