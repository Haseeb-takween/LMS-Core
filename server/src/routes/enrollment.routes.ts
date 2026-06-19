import { Router, IRouter } from "express";
import {
  requestEnrollment,
  getMyEnrollments,
} from "../controllers/enrollment.controller";
import {
  getEnrollmentSessions,
  getEnrollmentSession,
  submitQuiz,
} from "../controllers/session.controller";
import { getEnrollmentAttendance } from "../controllers/attendance.controller";
import {
  getEnrollmentCertificate,
  downloadCertificate,
} from "../controllers/certificate.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router: IRouter = Router();

router.post("/", authenticate, requestEnrollment);
router.get("/my", authenticate, getMyEnrollments);

router.get("/:id/sessions", authenticate, getEnrollmentSessions);
router.get("/:id/sessions/:sessionId", authenticate, getEnrollmentSession);
router.post("/:id/sessions/:sessionId/quiz/submit", authenticate, submitQuiz);
router.get("/:id/attendance", authenticate, getEnrollmentAttendance);
router.get("/:id/certificate", authenticate, getEnrollmentCertificate);
router.get("/:id/certificate/download", authenticate, downloadCertificate);

export default router;
