const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const {
  setupDB,
  setupCheckers,
  endDB,
} = require('../db/db');

const { insertData, navigatePage } = require('./checkersUtils');
const { delay } = require('../utils/utilFunctions');
const { categories } = require('./checkersCategories');

puppeteer.use(StealthPlugin());

async function fetchData(url, urlKey, initialPage, endPage) {
  const productData = [];
  const categoryType = categories[urlKey].category;

  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: `./tmp${url[10]}`,
  });

  const page = await browser.newPage();

  for (let trials = 0; trials < 2; trials++) {
    try {
      await navigatePage(
        page,
        productData,
        initialPage,
        endPage,
        url,
        categoryType
      );
      break;
    } catch (e) {
      console.error(`Error navigating ${url}`);
      console.error(e);
      console.log('Trying page navigation again');
      await delay(10000);
    }
  }
  await browser.close();
  await delay(5000);
  return productData;
}

async function main() {
  await setupDB();
  await setupCheckers();
  for (const url of Object.keys(categories).slice(14)) {
    console.log('Scraping', categories[url].category);
    if (categories[url].iterate) {
      let startPage = 0;
      while (true) {
        const newUrl = url + `${startPage}`;
        const productData = await fetchData(
          newUrl,
          url,
          startPage + 1,
          startPage + 16 > categories[url].endPage
            ? categories[url].endPage
            : startPage + 15
        );
        // Update or insert product data
        await insertData(productData);
        if (startPage + 15 > categories[url].endPage) break; //would have scraped to the end already
        startPage += 15;
      }
    } else {
      const productData = await fetchData(url, url);
      // Update or insert product data
      await insertData(productData);
    }
  }
  await endDB();
}

main();
