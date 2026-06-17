import { Router, IRouter } from "express";
import { register, login, logout, me } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router: IRouter = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, me);

export default router;
