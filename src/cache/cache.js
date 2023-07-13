export let productsCache = {};
export let productSearchCache = {};
export let userCache = {};
export let motoristasCache = {};
export let cachedDestinations = {};
export let destinationsCache = {};
export let locationCache = {};
export let TotalesCache = {};

export const clearCache = () => {
  productsCache = {};
  productSearchCache = {};
  TotalesCache = {};
};

export const clearCacheUser = () => {
  productsCache = {};
  productSearchCache = {};
  TotalesCache = {};
};

export const clearCacheMotorista = () => {
  motoristasCache = {};
  TotalesCache = {};
};
export const clearCacheDestination = () => {
  cachedDestinations = {};
  destinationsCache = {};
  locationCache = {};
  TotalesCache = {};
};
