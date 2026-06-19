import { Router, IRouter } from "express";
import { adminLogin, getStats } from "../controllers/admin.controller";
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
const admin = [authenticate, requireAdmin] as const;

router.post("/login", adminLogin);
router.get("/stats", ...admin, getStats);

router.get("/enrollments", ...admin, adminGetEnrollments);
router.patch("/enrollments/:id/approve", ...admin, approveEnrollment);
router.patch("/enrollments/:id/reject", ...admin, rejectEnrollment);

router.post("/attendance", ...admin, markAttendance);
router.patch("/attendance/:id", ...admin, updateAttendance);
router.get("/attendance", ...admin, adminGetAttendance);

router.get("/certificates", ...admin, adminGetCertificates);
router.patch("/certificates/:id/approve", ...admin, approveCertificate);
router.patch("/certificates/:id/reject", ...admin, rejectCertificate);

router.get("/quiz-results", ...admin, adminGetQuizResults);
router.get("/courses/:courseId/roster", ...admin, getCourseRoster);

export default router;
