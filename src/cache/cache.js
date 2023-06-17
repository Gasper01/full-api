import NodeCache from "node-cache";

export let productsCache = {};
export let productSearchCache = {};

export const clearCache = () => {
  productsCache = {};
  productSearchCache = {};
};

export const cache = new NodeCache();

export const clearCacheNode = () => {
  cache.flushAll();
};
