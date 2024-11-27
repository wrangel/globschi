// src/SentryInit.js

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

const initSentry = () => {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN, // Your actual DSN from Sentry
    integrations: [
      new BrowserTracing({
        // Adjust this to your needs
        tracePropagationTargets: [
          "localhost",
          /^https:\/\/yourserver\.io\/api/,
        ],
      }),
    ],
    tracesSampleRate: 1.0, // Adjust this value in production
    replaysSessionSampleRate: 0.1, // Capture replay for 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Capture replay for all sessions with an error
    environment: process.env.NODE_ENV || "development", // Set the environment
  });
};

export default initSentry;
