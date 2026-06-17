import { Router, IRouter } from "express";
import { adminLogin, listUsers, getStats } from "../controllers/admin.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.post("/login", adminLogin);
router.get("/users", authenticate, requireAdmin, listUsers);
router.get("/stats", authenticate, requireAdmin, getStats);

export default router;
