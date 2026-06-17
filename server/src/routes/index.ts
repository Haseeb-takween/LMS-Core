import { Router, IRouter } from "express";
import healthRouter from "./health.routes";

const router: IRouter = Router();

router.use("/health", healthRouter);

export default router;
