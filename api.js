const axios = require('axios');


const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function main() {
  const jsonStrings = [];
  const baseUrl =
    'https://www.checkers.co.za/c-66/All-Departments/Food/Fresh-Food/Fresh-Fruit?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=';

  for (let i = 0; i < 1; i++) {
    const url = baseUrl + `${i}`;
    console.log('Hitting page: ', i);
    await paginate(url, jsonStrings);
    await delay(2000)
  }
  // Parse each JSON string to JavaScript object
  console.log(jsonStrings.filter(obj => obj.bundleDealPath));
  console.log(jsonStrings.length);
}

async function paginate(url, jsonStrings) {
  const data = await axios.get(url, {
    params: {
      contentType: 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
  const htmlString = data.data;
  const regex =
    /<div class="item-product ".*?data-product-ga='(.*?)'>.*?<\/div>/gs;

  // Match data-product-ga attributes and extract product information
  let match;
  while ((match = regex.exec(htmlString)) !== null) {
    const productInfo = match[1]; // Extract the JSON string from the attribute
    console.log(productInfo)

    // Parse JSON string to object
    const productData = JSON.parse(productInfo);

    // Extract product information
    const name = productData.name;
    const price = productData.price;
    const unit_sale_price = productData.unit_sale_price;

    // Extract bundle deal path
    if(htmlString.includes('Bundle Deal')) console.log('Bundle Deal')
    const bundleDealPath = htmlString.includes('Bundle Deal')
      ? productData.match(
          /<a href="(.*?)".*?class="item-product__message item-product__message--xs"/
        )[1]
      : null;

    // Check if product-option--xtra-savings exists
    const hasExtraSavings = htmlString.includes('product-option--xtra-savings');

    // Create object with extracted information
    const product = {
      name,
      price,
      unit_sale_price,
      bundleDealPath,
      hasExtraSavings,
    };

    // Push the product object to the products array
    jsonStrings.push(product);
  }
}

main();
