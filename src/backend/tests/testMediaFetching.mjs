// src/backend/tests/testMediaFetching.mjs

import fetch from "node-fetch";

const testMediaFetching = async () => {
  const baseUrl = "http://localhost:8081/media"; // Replace with your backend URL

  // List of filenames to test (replace with actual filenames in your shared folder)
  const filenames = [
    "wide_angle/100_0177.webp",
    "pan/100_0082_20240407132938.webp",
    "hdr/100_0450.webp",
  ];

  for (const filename of filenames) {
    const url = `${baseUrl}/${filename}`;
    console.log(`Testing URL: ${url}`);

    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`✅ File accessible: ${filename}`);
      } else {
        console.error(
          `❌ File not accessible: ${filename} - Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error(`❌ Error accessing file: ${filename} - Error:`, error);
    }
  }
};

testMediaFetching();
