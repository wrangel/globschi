// testCache.js

import axios from "axios";

const API_BASE = "http://localhost:8081/api";

async function testCache() {
  try {
    console.log("Starting testCache...");
    console.log("Request 1: Expect cache MISS and fetch fresh data");
    let res = await axios.get(`${API_BASE}/combined-data`);
    console.log("Status:", res.status);
    console.log("Data count:", res.data.length);

    console.log("\nRequest 2: Expect cache HIT and fast response");
    res = await axios.get(`${API_BASE}/combined-data`);
    console.log("Status:", res.status);
    console.log("Data count:", res.data.length);

    console.log("\nTriggering cache invalidation via update endpoint...");
    res = await axios.post(`${API_BASE}/update-data`);
    console.log("Update response:", res.data);

    console.log(
      "\nRequest 3: After invalidation, expect cache MISS and fresh fetch"
    );
    res = await axios.get(`${API_BASE}/combined-data`);
    console.log("Status:", res.status);
    console.log("Data count:", res.data.length);

    console.log("\nTest completed!");
  } catch (error) {
    console.error("Test error:", error.message || error);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

testCache();
