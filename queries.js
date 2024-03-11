const fetchBrandsQuery = 
`SELECT name
FROM product_brands
WHERE $1 LIKE CONCAT('%', name, '%')`;

const insertDataQuery = `
INSERT INTO checkers_products (title, price, volume, volumeUnit, brand, promotionId, isVitality, isWList, categoryType, highLevelCategory, lowLevelCategory)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
ON CONFLICT (title) DO UPDATE
SET 
    price = EXCLUDED.price,
    promotionId = EXCLUDED.promotionId,
    isVitality = EXCLUDED.isVitality,
    isWList = EXCLUDED.isWList,
`;
