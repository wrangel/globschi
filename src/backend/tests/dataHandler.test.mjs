// src/backend/tests/dataHandler.test.mjs

import { getCombinedData } from "../dataHandler.mjs";
import { Island } from "../models/islandModel.mjs";
import { getUrls } from "../signedUrlServer.mjs";
import { beautify } from "../metadataProcessor.mjs";
import logger from "../utils/logger.mjs";

jest.mock("../models/islandModel.mjs");
jest.mock("../signedUrlServer.mjs");
jest.mock("../metadataProcessor.mjs");
jest.mock("../utils/logger.mjs");

describe("getCombinedData", () => {
  it("should fetch and combine data successfully", async () => {
    const mockMongoData = [{ dateTime: new Date(), name: "Island1" }];
    const mockPresignedUrls = ["url1", "url2"];
    const mockCombinedData = [{ name: "Island1", url: "url1" }];

    Island.find.mockResolvedValue(mockMongoData);
    getUrls.mockResolvedValue(mockPresignedUrls);
    beautify.mockResolvedValue(mockCombinedData);

    const result = await getCombinedData();
    expect(result).toEqual(mockCombinedData);
  });

  it("should throw an error if MongoDB data is empty", async () => {
    Island.find.mockResolvedValue([]);
    getUrls.mockResolvedValue(["url1", "url2"]);

    await expect(getCombinedData()).rejects.toThrow("No data found in MongoDB");
  });

  it("should throw an error if AWS S3 URLs are empty", async () => {
    Island.find.mockResolvedValue([{ dateTime: new Date(), name: "Island1" }]);
    getUrls.mockResolvedValue([]);

    await expect(getCombinedData()).rejects.toThrow("No presigned URLs found in AWS S3");
  });

  it("should log an error if an exception occurs", async () => {
    Island.find.mockRejectedValue(new Error("MongoDB error"));

    await expect(getCombinedData()).rejects.toThrow("Failed to fetch or process combined data");
    expect(logger.error).toHaveBeenCalledWith("Error in getCombinedData:", expect.any(Error));
  });
});