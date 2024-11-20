import express from "express";
import { PackageController } from "../../controller/public/package.controller.js";
const router = express.Router();

router.get("/package/list", PackageController.getPackageList);

router.get("/package/:id", PackageController.getOnePackage);

export const PackageRoutes = router;