// src/SentryInit.js
import * as Sentry from "@sentry/react";

const initSentry = () => {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN, // Replace with your actual DSN
    integrations: [
      // Add any integrations you need here
    ],
    tracesSampleRate: 1.0, // Adjust this value in production
  });
};

export default initSentry;
