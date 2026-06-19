import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import env from "./config/env";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import routes from "./routes";

const app: Express = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
