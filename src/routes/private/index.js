import express from "express";
import { BlogRoutes } from "./blog.routes.js";
import { ChatRoutes } from "./chat.routes.js";
import { DashboardRoutes } from "./dashboard.routes.js";
import { GalleryRoutes } from "./gallery.routes.js";
import { HowToUseChurchLogoRoutes } from "./howToUseChurchLogo.routes.js";
import { LeadRoutes } from "./lead.routes.js";
import { MembersRoutes } from "./members.routes.js";
import { OrderRoutes } from "./order.routes.js";
import { PackageRoutes } from "./package.routes.js";
import { ProfileRoutes } from "./profile.routes.js";
import { ReviewRoutes } from "./review.routes.js";
import { SystemRoutes } from "./system.routes.js";
import { TaskRoutes } from "./task.routes.js";
import { InvoiceRoutes } from "./invoice.routes.js";
import { UploadRoutes } from "./upload.routes.js";
const router = express.Router();

router.use(UploadRoutes);

router.use(InvoiceRoutes);

router.use(DashboardRoutes);

router.use(TaskRoutes);

router.use(HowToUseChurchLogoRoutes);

router.use(GalleryRoutes);

router.use(BlogRoutes);

router.use(LeadRoutes);

router.use(SystemRoutes);

router.use(OrderRoutes);

router.use(MembersRoutes);

router.use(ChatRoutes);

router.use(ProfileRoutes);

router.use(PackageRoutes);

router.use(ReviewRoutes);

export const PrivateRoutes = router;
