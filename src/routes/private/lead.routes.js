import express from "express";
import { LeadController } from "../../controller/private/lead.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.get(
  "/lead/list",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  LeadController.getList
);

export const LeadRoutes = router;
