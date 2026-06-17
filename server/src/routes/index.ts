import { Router, IRouter } from "express";
import healthRouter from "./health.routes";
import authRouter from "./auth.routes";
import adminRouter from "./admin.routes";
import courseRouter from "./course.routes";
import enrollmentRouter from "./enrollment.routes";

const router: IRouter = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/courses", courseRouter);
router.use("/enrollments", enrollmentRouter);

export default router;
