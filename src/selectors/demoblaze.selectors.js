// Selectors for https://www.demoblaze.com (demo e-commerce site).
export const demoblazeSelectors = {
    // Target category via its visible text for stability
    categoryLink: (name) => `text=${name}`,
    productTiles: '#tbodyid > div[class*="col-lg-4"]',
    productNameInTile: "a.hrefch",
    productPriceInTile: "h5",
    addToCartButton: "text=Add to cart"
  };
  