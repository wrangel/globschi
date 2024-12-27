// src/backend/cache.mjs

import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 }); // Cache TTL of 60 seconds

export const getCachedData = (key) => {
  return cache.get(key);
};

export const setCachedData = (key, value) => {
  cache.set(key, value);
};

export const invalidateCache = (key) => {
  cache.del(key);
};
