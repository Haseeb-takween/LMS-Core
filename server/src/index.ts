import app from "./app";
import env from "./config/env";
import { connectDB } from "./config/db";
import logger from "./utils/logger";

connectDB()
  .then(() => {
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
  })
  .catch((err: unknown) => {
    logger.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
