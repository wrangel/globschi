// src/backend/metadataProcessor.mjs

import logger from "./helpers/logger.mjs";

export const beautify = async (mongoData, presignedUrls) => {
  validateInput(mongoData, presignedUrls);

  const { intersectedData, onlyInMongo, onlyInAWS } = intersectData(
    mongoData,
    presignedUrls
  );

  logBookkeepingInfo(
    mongoData,
    presignedUrls,
    intersectedData,
    onlyInMongo,
    onlyInAWS
  );

  try {
    return intersectedData.map((doc) => processDocument(doc, presignedUrls));
  } catch (error) {
    logger.error("Error in beautify function:", { error });
    throw new Error("Failed to process and beautify data");
  }
};

function validateInput(mongoData, presignedUrls) {
  if (!Array.isArray(mongoData) || !Array.isArray(presignedUrls)) {
    throw new Error(
      "Invalid input: mongoData and presignedUrls must be arrays"
    );
  }
}

function intersectData(mongoData, presignedUrls) {
  const mongoNames = new Set(mongoData.map((item) => item.name));
  const awsNames = new Set(presignedUrls.map((item) => item.name));

  const intersectedData = mongoData.filter((mongoItem) =>
    awsNames.has(mongoItem.name)
  );
  const onlyInMongo = [...mongoNames].filter((name) => !awsNames.has(name));
  const onlyInAWS = [...awsNames].filter((name) => !mongoNames.has(name));

  return { intersectedData, onlyInMongo, onlyInAWS };
}

function processDocument(doc, presignedUrls) {
  const entry = presignedUrls.find((e) => e.name === doc.name);
  const urls = entry?.urls || {};

  const isPano = !!urls.panoPath;

  return {
    id: doc._id.toString(),
    viewer: isPano ? "pano" : "img",
    drone: doc.drone,
    metadata: formatMetadata(doc),
    latitude: doc.latitude,
    longitude: doc.longitude,
    ...(isPano
      ? { panoPath: urls.panoPath }
      : {
          thumbnailUrl: urls.thumbnail || "",
          ...(urls.actual && { actualUrl: urls.actual }),
        }),
  };
}

function formatMetadata(doc) {
  const dateTime = new Date(doc.dateTime);
  const formattedDate = dateTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = dateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });

  const road = doc.road ? doc.road.replace(/^,\s*/, "") : "";
  const formattedRoad = formatRoadWithLineBreaks(road, 29);
  const location1 = `${doc.postalCode || ""} ${doc.location || ""}`.trim();
  const location2 = `${doc.region || ""}, ${doc.country || ""}`.trim();

  return [
    formattedDate,
    formattedTime,
    `${doc.altitude ? doc.altitude.toFixed(1) : ""}m above sea level`,
    formattedRoad,
    location1,
    location2,
    `Author: ${doc.author || ""}`,
    `Drone: ${doc.drone || ""}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatRoadWithLineBreaks(road, maxLength) {
  if (road.length <= maxLength) {
    return road;
  }

  const words = road.split(" ");
  let currentLine = "";
  const lines = [];

  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = "";
      }
      if (word.length > maxLength) {
        for (let i = 0; i < word.length; i += maxLength) {
          lines.push(word.substr(i, maxLength));
        }
      } else {
        currentLine = word;
      }
    } else {
      currentLine += (currentLine ? " " : "") + word;
    }
  }

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines.join("\n");
}

function logBookkeepingInfo(
  mongoData,
  presignedUrls,
  intersectedData,
  onlyInMongo,
  onlyInAWS
) {
  logger.info("Data Processing Summary:");
  logger.info(`  MongoDB elements: ${mongoData.length}`);
  logger.info(`  AWS S3 elements: ${presignedUrls.length}`);
  logger.info(`  Intersected elements: ${intersectedData.length}`);
  logger.info(`  Elements only in MongoDB: ${onlyInMongo.length}`);
  logger.info(`  Elements only in AWS S3: ${onlyInAWS.length}`);

  if (onlyInMongo.length > 0) {
    // logger.info("Elements missing from AWS S3:", onlyInMongo); TODO
  }

  if (onlyInAWS.length > 0) {
    //logger.info("Elements missing from MongoDB:", onlyInAWS); TODO
  }
}
