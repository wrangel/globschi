// src/utils/utils.mjs

/**
 * Extracts ID from file path.
 * @param {string} path - File path.
 * @returns {string} - Extracted ID.
 */
export const getId = (path) =>
  path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
