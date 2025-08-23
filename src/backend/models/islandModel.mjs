// src/backend/models/islandModel.mjs

/**
 * Island model schema for MongoDB
 *
 * Represents a drone photo or panorama location with related metadata,
 * including geographic coordinates, date/time, author info, and media type.
 *
 * @module models/islandModel
 */

import mongoose from "mongoose";
import { CONTRIBUTORS, MEDIA_PAGES, DRONES } from "../constants.mjs";

const islandSchema = new mongoose.Schema({
  /**
   * Unique name identifier for the island photo or panorama.
   */
  name: {
    type: String,
    required: true,
    unique: true,
  },

  /**
   * Media page type, restricted to allowed media pages.
   */
  type: {
    required: true,
    type: String,
    enum: MEDIA_PAGES,
  },

  /**
   * Author or photographer of the media.
   */
  author: {
    type: String,
    required: true,
    enum: CONTRIBUTORS,
  },

  /**
   * Drone model used to capture the media.
   */
  drone: {
    type: String,
    required: true,
    enum: DRONES,
  },

  /**
   * Date and time as a formatted string.
   * Used for human-readable display.
   */
  dateTimeString: {
    required: true,
    type: String,
  },

  /**
   * Date and time as a JavaScript Date object.
   * Used for sorting, querying, filtering.
   */
  dateTime: {
    required: true,
    type: Date,
  },

  /**
   * Geographic latitude of capture location.
   */
  latitude: {
    required: true,
    type: Number,
  },

  /**
   * Geographic longitude of capture location.
   */
  longitude: {
    required: true,
    type: Number,
  },

  /**
   * Altitude above sea level (meters).
   */
  altitude: {
    required: true,
    type: Number,
  },

  /**
   * Country name.
   */
  country: {
    required: true,
    type: String,
  },

  /**
   * Region, state, or province name.
   */
  region: {
    required: true,
    type: String,
  },

  /**
   * Location/city name.
   */
  location: {
    required: true,
    type: String,
  },

  /**
   * Postal or ZIP code (optional).
   */
  postalCode: {
    type: String,
  },

  /**
   * Road or street name (optional).
   */
  road: String,

  /**
   * Number of views or visits of this media's page.
   */
  noViews: {
    required: true,
    type: Number,
    min: 0,
  },
});

export const Island = mongoose.model("Island", islandSchema);
