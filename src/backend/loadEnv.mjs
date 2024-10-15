import dotenv from "dotenv";

dotenv.config();

export default function loadEnv() {
  // This function doesn't need to do anything,
  // as dotenv.config() is called when this module is imported
}

// You can add console logs to check if environment variables are loaded
console.log("ACCESS_KEY:", process.env.ACCESS_KEY);
console.log(
  "SECRET_ACCESS_KEY:",
  process.env.SECRET_ACCESS_KEY ? "****" : "undefined"
);
console.log("BUCKET_REGION:", process.env.BUCKET_REGION);
console.log("SITE_BUCKET:", process.env.SITE_BUCKET);
