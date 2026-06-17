import { Router, IRouter } from "express";
import { getCourses, getCourse } from "../controllers/course.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router: IRouter = Router();

router.get("/", authenticate, getCourses);
router.get("/:id", authenticate, getCourse);

export default router;
