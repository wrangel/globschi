// metadataProcessor.mjs

import Constants from "./constants.mjs";

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

export const beautify = async (mongoData, presignedUrls) => {
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
};
