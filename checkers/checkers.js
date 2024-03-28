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

async function fetchData(url, urlKey, initialPage,endPage) {
  const productData = [];
  const categoryType = categories[urlKey].category;

  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: `./tmp${url[10]}`,
  });

  const page = await browser.newPage();
  let actualEndPage;;
  for (let trials = 0; trials < 2; trials++) {
    try {
      actualEndPage = await navigatePage(
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
  return {productData, endPage: actualEndPage};
}

async function main() {
  await setupDB();
  await setupCheckers();
  for (const url of Object.keys(categories).slice(14)) {
    console.log('Scraping', categories[url].category);
    if (categories[url].iterate) {
      let startPage = 0;
      let trials = 0;
      while (true) {
        const newUrl = url + `${startPage}`;
        const {productData, endPage} = await fetchData(
          newUrl,
          url,
          startPage + 1,
          startPage + 15
        );
        console.log(endPage)
        // Update or insert product data
        await insertData(productData);
        startPage += 16;
        if(endPage && (startPage >= endPage)) break;
        if(!endPage) {
          trials++;
          startPage -= 16;
        }
        if(trials > 2) break;
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
