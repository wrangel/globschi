// src/backend/server.mjs

// src/backend/server.mjs

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import combinedDataRoute from "./routes/combinedDataRoute.mjs";
import { loadEnv } from "./loadEnv.mjs";
import { islandSchema } from "./models/islandModel.mjs";

loadEnv();

console.log("Initializing server...");

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.set("strictQuery", false);

export const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.SERVER}/${process.env.DB}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Create Mongoose Island Model
export const Island = mongoose.model("Island", islandSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/api/test-mongo", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ message: "MongoDB connection successful" });
  } catch (error) {
    console.error("MongoDB connection test failed:", error);
    res.status(500).json({ error: "MongoDB connection test failed" });
  }
});

app.use("/api", combinedDataRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Check if this module is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// Start server if this is the main module
if (isMainModule) {
  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  };

  startServer();
}

export { app };
