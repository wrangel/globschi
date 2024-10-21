// src/backend/constants.mjs
export const ACTUAL_ID = "actual";
export const THUMBNAIL_ID = "thumbnails";
export const AUTHOR_PICTURES_PATH = "media/author_pictures/";
export const CONTRIBUTORS = new Array("wrangel", "beat_maker", "dance");
export const MEDIA_FORMATS = { site: ".webp", large: ".tif", small: ".jpg" };
export const MEDIA_PAGES = ["hdr", "pan", "wide_angle"]; // MUST be sorted alphabetically
export const RENAME_IDS = ["DJI", "-HDR"];
export const REVERSE_GEO_ADDRESS_COMPONENTS = new Array(
  "address",
  "postcode",
  "place",
  "region",
  "country"
);
export const REVERSE_GEO_URL_ELEMENTS = new Array(
  "https://api.mapbox.com/geocoding/v5/mapbox.places/",
  ".json?access_token="
);
