// src/backend/utils/utils.mjs

/**
 * Extracts the ID (filename without extension) from a file path.
 *
 * Given a file path, returns the substring between the last slash (/) and the last dot (.),
 * effectively extracting just the filename without its extension.
 *
 * @param {string} path - Full file path or filename with extension.
 * @returns {string} Extracted ID (filename without extension).
 *
 * @example
 * getId('/path/to/file/12345.webp'); // returns '12345'
 */
export const getId = (path) =>
  path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
