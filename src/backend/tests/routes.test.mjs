// src/backend/tests/routes.test.mjs

import request from "supertest";
import app from "../server.mjs";

describe("Routes", () => {
  it("should return 200 for the home route", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Server is running");
  });

  it("should return 200 for the catch-all route", async () => {
    const response = await request(app).get("/some-random-path");
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
  });

  it("should return 200 for the MongoDB test route", async () => {
    const response = await request(app).get("/api/test-mongo");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("MongoDB connection successful");
  });
});
