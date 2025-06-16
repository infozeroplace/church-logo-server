import express from "express";
import { TestController } from "../../controller/public/test.controller.js";

const router = express.Router();

router.post("/test", TestController.test);

export const TestRoutes = router;
