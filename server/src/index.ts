import app from "./app";
import env from "./config/env";
import logger from "./utils/logger";

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on http://${env.HOST}:${env.PORT} [${env.NODE_ENV}]`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down gracefully");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  logger.info("SIGINT received — shutting down gracefully");
  server.close(() => process.exit(0));
});
