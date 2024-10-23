// metadataProcessor.mjs

import { AUTHOR_PICTURES_PATH, MEDIA_PAGES } from "./constants.mjs";
import { prepareDate } from "./helpers/helpers.mjs";

export const beautify = async (mongoData, presignedUrls) => {
  // Create an intersection based on the 'name' property
  const intersectedData = mongoData.filter((mongoItem) =>
    presignedUrls.some((urlItem) => urlItem.name === mongoItem.name)
  );

  // Perform bookkeeping
  const mongoNames = new Set(mongoData.map((item) => item.name));
  const awsNames = new Set(presignedUrls.map((item) => item.name));
  const onlyInMongo = [...mongoNames].filter((name) => !awsNames.has(name));
  const onlyInAWS = [...awsNames].filter((name) => !mongoNames.has(name));

  console.log("Number of elements in mongoData:", mongoData.length);
  console.log("Number of elements in presignedUrls:", presignedUrls.length);
  console.log("Number of elements after intersection:", intersectedData.length);
  console.log("Elements only in MongoDB:", onlyInMongo);
  console.log("Elements only in AWS:", onlyInAWS);

  try {
    return intersectedData.map((doc) => {
      const urls =
        presignedUrls.find((element) => element.name === doc.name)?.urls || {};

      return {
        id: doc._id.toString(), // Convert ObjectId to string
        name: doc.name,
        type: doc.type,
        viewer: doc.type === MEDIA_PAGES[1] ? "pano" : "img",
        author: AUTHOR_PICTURES_PATH + doc.author + ".svg",
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
        actualUrl: urls.actual || "",
      };
    });
  } catch (error) {
    console.error("Error in beautify function:", error);
    throw error; // Re-throw the error to be handled by the calling function
  }
};
