import { Router, IRouter } from "express";
import { adminLogin, listUsers, getStats } from "../controllers/admin.controller";
import {
  adminGetEnrollments,
  approveEnrollment,
  rejectEnrollment,
} from "../controllers/enrollment.controller";
import {
  markAttendance,
  updateAttendance,
} from "../controllers/attendance.controller";
import {
  adminGetCertificates,
  approveCertificate,
  rejectCertificate,
} from "../controllers/certificate.controller";
import {
  getCourseRoster,
  adminGetAttendance,
  adminGetQuizResults,
} from "../controllers/adminExtras.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.post("/login", adminLogin);
router.get("/users", authenticate, requireAdmin, listUsers);
router.get("/stats", authenticate, requireAdmin, getStats);

router.get("/enrollments", authenticate, requireAdmin, adminGetEnrollments);
router.patch("/enrollments/:id/approve", authenticate, requireAdmin, approveEnrollment);
router.patch("/enrollments/:id/reject", authenticate, requireAdmin, rejectEnrollment);

router.post("/attendance", authenticate, requireAdmin, markAttendance);
router.patch("/attendance/:id", authenticate, requireAdmin, updateAttendance);

router.get("/certificates", authenticate, requireAdmin, adminGetCertificates);
router.patch("/certificates/:id/approve", authenticate, requireAdmin, approveCertificate);
router.patch("/certificates/:id/reject", authenticate, requireAdmin, rejectCertificate);

router.get("/courses/:courseId/roster", authenticate, requireAdmin, getCourseRoster);
router.get("/attendance", authenticate, requireAdmin, adminGetAttendance);
router.get("/quiz-results", authenticate, requireAdmin, adminGetQuizResults);

export default router;
