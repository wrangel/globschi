// src/backend/models/islandModel.mjs

import mongoose from "mongoose";
import { CONTRIBUTORS, MEDIA_PAGES, DRONE } from "../constants.mjs";

const islandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    required: true,
    type: String,
    enum: MEDIA_PAGES,
  },
  author: {
    type: String,
    required: true,
    enum: CONTRIBUTORS,
  },
  drone: {
    type: String,
    required: true,
    enum: DRONE,
  },
  dateTimeString: {
    required: true,
    type: String,
  },
  dateTime: {
    required: true,
    type: Date,
  },
  latitude: {
    required: true,
    type: Number,
  },
  longitude: {
    required: true,
    type: Number,
  },
  altitude: {
    required: true,
    type: Number,
  },
  country: {
    required: true,
    type: String,
  },
  region: {
    required: true,
    type: String,
  },
  location: {
    required: true,
    type: String,
  },
  postalCode: {
    type: String,
  },
  road: String,
  noViews: {
    required: true,
    type: Number,
    min: 0,
  },
});

export const Island = mongoose.model("Island", islandSchema);
