// src/backend/routes/combinedDataRoute.mjs
import express from "express";
import { getCombinedData } from "../dataHandler.mjs";

const router = express.Router();

router.get("/combined-data", async (req, res) => {
  try {
    const combinedData = await getCombinedData();
    res.json(combinedData);
  } catch (error) {
    console.error("Error fetching combined data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
