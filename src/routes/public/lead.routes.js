import express from "express";
import { LeadController } from "../../controller/public/lead.controller.js";
import validateRequest from "../../middleware/validateRequest.js";
import { LeadValidation } from "../../validation/lead.validation.js";

const router = express.Router();

router.post(
  "/lead",
  validateRequest(LeadValidation.leadZodSchema),
  LeadController.lead
);

export const LeadRoutes = router;
