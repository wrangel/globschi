// helpers.mjs

// Get current outdated media
export async function getCurrentStatus() {
  // 1) List elements on bucket Saint Patrick Island (which are the original files)
  const originalMedia = (
    await s3Client.send(
      new ListObjectsCommand({ Bucket: process.env.ORIGINALS_BUCKET })
    )
  ).Contents.map((originalFile) => {
    let path = originalFile.Key;
    return { key: getId(path), path: path };
  });

  // 2) Get elements on bucket Melville Island (which are used on the web site)
  const siteMedia = (
    await s3Client.send(
      new ListObjectsCommand({ Bucket: process.env.SITE_BUCKET })
    )
  ).Contents.map((siteFile) => {
    let path = siteFile.Key;
    return { key: getId(path), path: path };
  });

  // Get actual image Site files
  const actualSiteMedia = siteMedia.filter(
    (siteFile) => siteFile.path.indexOf(Constants.THUMBNAIL_ID) == -1
  );

  // Get thumbnail image Site files
  const thumbnailSiteMedia = siteMedia.filter(
    (siteFile) => siteFile.path.indexOf(Constants.THUMBNAIL_ID) > -1
  );

  // Await Island collection entries (for outdated entries)
  await connectDB();
  const islandDocs = (await Island.find({}, "name -_id").lean()).map(
    (doc) => doc.name
  );

  /////////
  console.log(originalMedia.slice(0, 5));
  console.log(siteMedia.slice(0, 5));
  console.log(actualSiteMedia.slice(0, 5));
  console.log(thumbnailSiteMedia.slice(0, 5));
  console.log(islandDocs);
  process.exit(0);
  /////////

  return Promise.all([
    originalMedia,
    actualSiteMedia,
    thumbnailSiteMedia,
    islandDocs,
  ]);
}

export const getId = (path) => {
  return path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
};

export const prepareDate = (date) => {
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
