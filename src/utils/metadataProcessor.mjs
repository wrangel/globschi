// metadataProcessor.mjs

import { Constants } from "./src/utils/constants.mjs";
import { Island } from "./server.mjs";

// Prepare date for website
const prepareDate = (date) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZone: "CET",
    timeZoneName: "short",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

// Adapt metadata to show prettily on the website
export const beautify = async (presignedUrls) => {
  // Get the metadata from MongoDB
  const docs = await Island.find().sort({ dateTime: -1 }).lean();

  // Get the current presigned urls
  return docs.map((doc) => {
    const urls = presignedUrls
      .filter((element) => {
        return element.name === doc.name;
      })
      .map((element) => {
        return element.urls;
      });

    // Prepare the url of the actual image
    const url = new URL(urls[0].actual);
    const url1 = url.origin + url.pathname;
    const url2 = encodeURIComponent(url.search);

    // Prepare output
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
      thumbnailUrl: urls[0].thumbnail,
      actualUrl: url1,
      actualQueryString: url2,
    };
  });
};
