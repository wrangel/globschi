import { GetObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./awsConfigurator.mjs";
import { THUMBNAIL_ID, ACTUAL_ID } from "./constants.mjs";
import { loadEnv } from "./loadEnv.mjs";
loadEnv();

const helpers = await import("./helpers.mjs");
const { getId } = helpers;

export async function getUrls() {
  // Wait for Promise to resolve to get all the files in the bucket
  const array0 = (
    await s3Client.send(
      new ListObjectsCommand({ Bucket: process.env.SITE_BUCKET })
    )
  ).Contents;

  // Provide Promises to get presigned urls
  const array1 = await Promise.all(
    array0.map(async (content) => {
      const key = content.Key;
      const type =
        key.substring(0, key.indexOf("/")) === THUMBNAIL_ID
          ? THUMBNAIL_ID
          : ACTUAL_ID;
      return {
        id: getId(key),
        type,
        // Allow access for 1.1 days
        sigUrl: await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: process.env.SITE_BUCKET,
            Key: key,
          }),
          { expiresIn: 95040 }
        ),
      };
    })
  );

  // Reduce the info on the id
  const array2 = array1.reduce((acc, d) => {
    const found = acc.find((a) => a.id === d.id);
    const value = { type: d.type, sigUrl: d.sigUrl };
    if (!found) {
      acc.push({ id: d.id, data: [value] });
    } else {
      found.data.push(value);
    }
    return acc;
  }, []);

  // Sort urls based on type (first: actual, second: thumbnail)
  const array3 = array2.map((r) => {
    const sorted = r.data.sort((a, b) => {
      if (a.type < b.type) return -1;
      if (a.type > b.type) return 1;
      return 0;
    });
    return { id: r.id, data: sorted };
  });

  // Create new key value pair
  return array3.map((elem) => {
    let actual_url = elem.data[0].sigUrl;
    let thumbnail_url = elem.data[1]?.sigUrl;
    return {
      name: elem.id,
      urls: { actual: actual_url, thumbnail: thumbnail_url },
    };
  });
}
