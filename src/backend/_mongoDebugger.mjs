import { Island } from "./server.mjs";
import { executeMongoQuery } from "./queryHelpers.mjs";

const docs = await executeMongoQuery(async () => {
  return await Island.find().sort({ dateTime: -1 }).lean();
});

console.log(docs);
