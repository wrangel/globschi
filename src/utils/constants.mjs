export default {
  /// Web App
  REVERSE_GEO_ADDRESS_COMPONENTS: new Array(
    "address",
    "postcode",
    "place",
    "region",
    "country"
  ),
  REVERSE_GEO_URL_ELEMENTS: new Array(
    "https://api.mapbox.com/geocoding/v5/mapbox.places/",
    ".json?access_token="
  ),
  AUTHOR_PICTURES_PATH: "media/author_pictures/",
  MEDIA_PAGES: new Array("hdr", "pan", "wide_angle"), // MUST be sorted alphabetically
  MEDIA_FORMATS: { site: ".webp", large: ".tif", small: ".jpg" },

  /// Helper App
  RENAME_IDS: ["DJI", "-HDR"],
  REPLACEMENT: "100",
  CONTRIBUTORS: new Array("wrangel", "beat_maker", "dance"),
};
