import express from "express";
import { SystemController } from "../../controller/public/system.controller.js";

const router = express.Router();

router.get("/system", SystemController.getSystemConfig);

export const SystemRoutes = router;