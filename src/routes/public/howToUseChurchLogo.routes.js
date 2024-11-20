import express from "express";
import { HowToUseChurchLogoController } from "../../controller/public/howToUseChurchLogo.controller.js";

const router = express.Router();

router.get("/how-to-use-church-logo/list", HowToUseChurchLogoController.list);

router.get("/how-to-use-church-logo/:id", HowToUseChurchLogoController.getOne);

export const HowToUseChurchLogoRoutes = router;
