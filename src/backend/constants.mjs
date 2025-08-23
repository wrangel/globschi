// src/backend/constants.mjs

/**
 * Constants used throughout the application.
 * @module Constants
 */

/**
 * ID used for actual content.
 * @constant {string}
 */
export const ACTUAL_ID = "actual";

/**
 * List of contributors.
 * @constant {ReadonlyArray<string>}
 */
export const CONTRIBUTORS = Object.freeze(["wrangel", "beat_maker", "Anna"]);

/**
 * List of drones.
 * NOTE: The newest drone must be first in the array.
 * @constant {ReadonlyArray<string>}
 */
export const DRONES = Object.freeze(["DJI Mini 4 Pro", "DJI Mini 2"]);

/**
 * Expiration time in seconds.
 * Represents 1.1 days.
 * @constant {number}
 */
export const EXPIRATION_TIME = 95040; // 1.1 days in seconds

/**
 * Media format extensions used in the application.
 * @constant {{site: string, large: string, small: string}}
 */
export const MEDIA_FORMATS = Object.freeze({
  site: ".webp",
  large: ".tif",
  small: ".jpg",
});

/**
 * Types of media pages.
 * Must be sorted alphabetically.
 * @constant {ReadonlyArray<string>}
 */
export const MEDIA_PAGES = Object.freeze(["hdr", "pan", "wide_angle"]);

/**
 * IDs used in the renaming process.
 * @constant {ReadonlyArray<string>}
 */
export const RENAME_IDS = Object.freeze(["DJI", "-HDR"]);

/**
 * Components used in reverse geocoding addresses.
 * @constant {ReadonlyArray<string>}
 */
export const REVERSE_GEO_ADDRESS_COMPONENTS = Object.freeze([
  "address",
  "postcode",
  "place",
  "region",
  "country",
]);

/**
 * Elements used to construct reverse geocoding URLs.
 * @constant {ReadonlyArray<string>}
 */
export const REVERSE_GEO_URL_ELEMENTS = Object.freeze([
  "https://api.mapbox.com/geocoding/v5/mapbox.places/",
  ".json?access_token=",
]);

/**
 * ID used for thumbnails.
 * @constant {string}
 */
export const THUMBNAIL_ID = "thumbnails";

// Ensure MEDIA_PAGES is sorted alphabetically
if (!MEDIA_PAGES.every((v, i, a) => !i || a[i - 1] <= v)) {
  throw new Error("MEDIA_PAGES must be sorted alphabetically");
}
