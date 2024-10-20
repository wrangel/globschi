// src/backend/bookKeeper.mjs

const helpers = await import("./helpers.mjs");
const { getCurrentStatus } = helpers;

const a = getCurrentStatus();
