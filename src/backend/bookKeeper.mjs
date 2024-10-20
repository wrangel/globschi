import ExifReader from "exifreader";
import Constants from "./constants.mjs";
import { connectDB, Island } from "./server.mjs";

/*  Converts the timestamp string into a GMT / Local date (that is what exifr is doing wrong!)
    https://stackoverflow.com/questions/43083993/javascript-how-to-convert-exif-date-time-data-to-timestamp
*/
const getDate = (str) => {
  const [year, month, date, hour, min, sec] = str.split(/\D/);
  return new Date(year, month - 1, date, hour, min, sec);
};

// Converts the altitude into meter-above-sea
const getAltitude = (altitudeString) => {
  let altitude;
  if (altitudeString.endsWith("m")) {
    altitude = parseFloat(altitudeString.replace("m", ""));
  } else {
    const components = altitudeString
      .split("/")
      .map((component) => parseFloat(component));
    altitude = components[0] / components[1];
  }
  return altitude;
};

// Convert GPS, if string is returned
const getCoordinates = (coordString) => {
  let coordinate = parseFloat(coordString);
  const orientation = coordString.toString().match(/[a-zA-Z]+/g);
  if (orientation != null && ["S", "W"].indexOf(orientation[0]) > -1) {
    coordinate = -coordinate;
  }
  return coordinate;
};

// Save the data to the db
async function save(media) {
  // Get exif data for the new files
  const base = await Promise.all(
    media.map(async (medium) => {
      const exif = await ExifReader.load(medium.sigUrl); // Slow, but reliable (exifr is fast, but omits timezone offset)
      return {
        key: medium.key,
        target: medium.targets[0], // use actual file info
        exif_datetime: exif.DateTimeOriginal.description,
        exif_longitude: getCoordinates(exif.GPSLongitude.description),
        exif_latitude: getCoordinates(exif.GPSLatitude.description),
        exif_altitude: getAltitude(exif.GPSAltitude.description),
      };
    })
  );

  console.log(base);

  // Get the urls for the reverse engineering call
  const reverseUrls = base.map(
    (exif) =>
      Constants.REVERSE_GEO_URL_ELEMENTS[0] +
      exif.exif_longitude +
      ", " +
      exif.exif_latitude +
      Constants.REVERSE_GEO_URL_ELEMENTS[1] +
      Constants.REVERSE_GEO_ACCESS_TOKEN
  );

  // Get the jsons from the reverse engineering call (Wait on all promises to be resolved)
  const jsons = await Promise.all(
    reverseUrls.map(async (reverseUrl) => {
      const resp = await fetch(reverseUrl);
      return await resp.json();
    })
  );

  // Get the reverse geocoding data
  const reverseGeocodingData = jsons.map((json) => {
    let data = {};
    Constants.REVERSE_GEO_ADDRESS_COMPONENTS.forEach((addressComponent) => {
      data[addressComponent] = json.features
        .filter((doc) => doc.id.startsWith(addressComponent))
        .map((doc) => doc.text)[0];
    });
    return data;
  });

  // Combine everything into the Mongoose compatible metadata (one for each document)
  const newIslands = base.map(function (b, i) {
    const rgcd = reverseGeocodingData[i];
    return new Island({
      name: b.key,
      type: b.target.substring(0, b.target.indexOf("/")),
      dateTimeString: b.exif_datetime,
      dateTime: getDate(b.exif_datetime),
      latitude: b.exif_latitude,
      longitude: b.exif_longitude,
      altitude: b.exif_altitude,
      country: rgcd.country,
      region: rgcd.region,
      location: rgcd.place,
      postalCode: rgcd.postcode,
      road: rgcd.address,
      noViews: 0,
    });
  });

  // Promise to save document to DB
  const mongoDbCall1 = Island.insertMany(newIslands);

  // Promise to update the author on the DB
  const mongoDbCall2 = Island.aggregate([
    {
      $lookup: {
        from: "authors",
        localField: "name",
        foreignField: "name",
        as: "author",
      },
    },
    {
      $unwind: "$author",
    },
    {
      $replaceRoot: { newRoot: { $mergeObjects: ["$author", "$$ROOT"] } },
    },
    {
      $addFields: { author: "$author.author" },
    },
    { $merge: "islands" },
  ]).exec();

  // Return the Promises
  return Promise.all([mongoDbCall1, mongoDbCall2]);
}

export { save };
