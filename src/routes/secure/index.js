import express from "express";
import { ChatRoutes } from "./chat.routes.js";
import { OrderRoutes } from "./order.routes.js";
import { PaymentRoutes } from "./payment.routes.js";
import { ProfileRoutes } from "./profile.routes.js";
const router = express.Router();

router.use(PaymentRoutes);

router.use(ChatRoutes);

router.use(OrderRoutes);

router.use(ProfileRoutes);

export const SecureRoutes = router;
