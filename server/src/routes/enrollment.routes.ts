import { Router, IRouter } from "express";
import {
  requestEnrollment,
  getMyEnrollments,
} from "../controllers/enrollment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router: IRouter = Router();

router.post("/", authenticate, requestEnrollment);
router.get("/my", authenticate, getMyEnrollments);

export default router;
