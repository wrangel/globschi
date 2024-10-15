// metadataProcessor.mjs

import Constants from "./constants.mjs";
import { prepareDate } from "./helpers.mjs";

export const beautify = async (mongoData, presignedUrls) => {
  try {
    return mongoData.map((doc) => {
      const urls =
        presignedUrls.find((element) => element.name === doc.name)?.urls || {};

      const url = new URL(urls.actual || "");
      const url1 = url.origin + url.pathname;
      const url2 = encodeURIComponent(url.search);

      return {
        name: doc.name,
        type: doc.type,
        viewer: doc.type === Constants.MEDIA_PAGES[1] ? "pano" : "img",
        author: Constants.AUTHOR_PICTURES_PATH + doc.author + ".svg",
        dateTime: prepareDate(doc.dateTime),
        latitude: doc.latitude,
        longitude: doc.longitude,
        altitude: doc.altitude.toFixed(1) + "m",
        country: doc.country,
        region: doc.region,
        location: doc.location,
        postalCode: doc.postalCode,
        road: doc.road === undefined ? "" : ", above " + doc.road,
        noViews: 0,
        thumbnailUrl: urls.thumbnail || "",
        actualUrl: url1,
        actualQueryString: url2,
      };
    });
  } catch (error) {
    console.error("Error in beautify function:", error);
    throw error; // Re-throw the error to be handled by the calling function
  }
};
