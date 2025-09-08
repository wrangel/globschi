// src/backend/constants.mjs

/**
 * Constants used throughout the application.
 * @module Constants
 */

/**
 * Unit suffix used for altitude measurements from EXIF data.
 * @constant {string}
 */
export const ALTITUDE_UNIT = "m";

/**
 * List of contributors.
 * @constant {ReadonlyArray<string>}
 */
export const CONTRIBUTORS = Object.freeze(["wrangel", "beat_maker", "Anna"]);

/**
 * Map of known drone model codes to their display names.
 * @constant {Object<string, string>}
 */
export const DRONE_MODELS = Object.freeze({
  FC8482: "DJI Mini 4 Pro",
  FC7303: "DJI Mini 2",
});

/**
 * EXIF tag names used in image metadata extraction.
 * @constant {Object<string, string>}
 */
export const EXIF_TAGS = Object.freeze({
  DATE_TIME_ORIGINAL: "DateTimeOriginal",
  MODEL: "Model",
  GPS_LONGITUDE: "GPSLongitude",
  GPS_LATITUDE: "GPSLatitude",
  GPS_ALTITUDE: "GPSAltitude",
});

/**
 * Expiration time in seconds.
 * Represents 1.1 days.
 * @constant {number}
 */
export const EXPIRATION_TIME = 95040; // 1.1 days in seconds

/**
 * Maximum dimension (width or height) for WebP images.
 * @constant {number}
 */
export const MAX_WEBP_DIMENSION = 16383;

/**
 * Types of media pages.
 * Must be sorted alphabetically.
 * @constant {ReadonlyArray<string>}
 */
export const MEDIA_PAGES = Object.freeze(["hdr", "pano", "wide_angle"]);

/**
 * Prefixes for different media types used in naming conventions.
 * @constant {Object<string, string>}
 */
export const MEDIA_PREFIXES = Object.freeze({
  hdr: "hd_",
  pano: "pa_",
  wide_angle: "wa_",
});

/**
 * Quality setting for thumbnails (WebP).
 * @constant {number}
 */
export const THUMBNAIL_QUALITY = 80;

/**
 * Thumbnail image height in pixels.
 * @constant {number}
 */
export const THUMBNAIL_HEIGHT = 1300;

/**
 * Thumbnail image width in pixels.
 * @constant {number}
 */
export const THUMBNAIL_WIDTH = 2000;

/**
 * Temporary PNG filename suffix used during image processing.
 * @constant {string}
 */
export const TEMP_PNG_SUFFIX = "_temp.png";

/**
 * Filename used for thumbnail WebP image.
 * @constant {string}
 */
export const THUMBNAIL_FILENAME = "thumbnail.webp";

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

// Ensure MEDIA_PAGES is sorted alphabetically
if (!MEDIA_PAGES.every((v, i, a) => !i || a[i - 1] <= v)) {
  throw new Error("MEDIA_PAGES must be sorted alphabetically");
}

/**
 * Names of special folders consistently used in media processing.
 */
export const MODIFIED_FOLDER = "modified";
export const ORIGINAL_FOLDER = "original";
export const S3_FOLDER = "S3";

/**
 * String used when certain metadata values are unknown or missing.
 * @constant {string}
 */
export const UNKNOWN_VALUE = "unknown";
