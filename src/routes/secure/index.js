import express from "express";
import { OrderRoutes } from "./order.routes.js";
import { ProfileRoutes } from "./profile.routes.js";
import { ChatRoutes } from "./chat.routes.js";
const router = express.Router();

router.use(ChatRoutes);

router.use(OrderRoutes);

router.use(ProfileRoutes);

export const SecureRoutes = router;
