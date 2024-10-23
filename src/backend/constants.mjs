// src/backend/constants.mjs

/**
 * Constants used throughout the application.
 * @module Constants
 */

/** ID used for actual content */
export const ACTUAL_ID = "actual";

/** Path to author pictures */
export const AUTHOR_PICTURES_PATH = "media/author_pictures/";

/** List of contributors */
export const CONTRIBUTORS = Object.freeze(["wrangel", "beat_maker", "dance"]);

/** Expiration date */
export const EXPIRATION_TIME = 95040; // 1.1 days in seconds

/** Media format extensions */
export const MEDIA_FORMATS = Object.freeze({
  site: ".webp",
  large: ".tif",
  small: ".jpg",
});

/** Types of media pages (MUST be sorted alphabetically) */
export const MEDIA_PAGES = Object.freeze(["hdr", "pan", "wide_angle"]);

/** IDs used in renaming process */
export const RENAME_IDS = Object.freeze(["DJI", "-HDR"]);

/** Components of reverse geocoding address */
export const REVERSE_GEO_ADDRESS_COMPONENTS = Object.freeze([
  "address",
  "postcode",
  "place",
  "region",
  "country",
]);

/** Elements of reverse geocoding URL */
export const REVERSE_GEO_URL_ELEMENTS = Object.freeze([
  "https://api.mapbox.com/geocoding/v5/mapbox.places/",
  ".json?access_token=",
]);

/** ID used for thumbnails */
export const THUMBNAIL_ID = "thumbnails";

// Ensure MEDIA_PAGES is sorted
if (!MEDIA_PAGES.every((v, i, a) => !i || a[i - 1] <= v)) {
  throw new Error("MEDIA_PAGES must be sorted alphabetically");
}
