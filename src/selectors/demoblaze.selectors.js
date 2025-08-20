// Selectors for https://demoblaze.com (demo e-commerce site).
export const demoblazeSelectors = {
    categoryLink: (name) => `xpath=//a[normalize-space()="${name}"]`,
    productTiles: '#tbodyid > div[class*="col-lg-4"]',
    productNameInTile: 'a.hrefch',
    productPriceInTile: 'h5',
    addToCartButton: 'text=Add to cart'
  };
  