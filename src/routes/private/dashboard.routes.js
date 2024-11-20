import express from "express";
import { DashboardController } from "../../controller/private/dashboard.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.get(
  "/dashboard/get-admin-dashboard-data",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  DashboardController.getAdminDashboardData
);

export const DashboardRoutes = router;
