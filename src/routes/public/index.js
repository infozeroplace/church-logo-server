import express from "express";
import { AuthRoutes } from "./auth.routes.js";
import { BlogRoutes } from "./blog.routes.js";
import { HowToUseChurchLogoRoutes } from "./howToUseChurchLogo.routes.js";
import { ImageRoutes } from "./image.routes.js";
import { LeadRoutes } from "./lead.routes.js";
import { PackageRoutes } from "./package.routes.js";
import { ReviewRoutes } from "./review.routes.js";
import { SystemRoutes } from "./system.routes.js";
import { TestRoutes } from "./test.routes.js";
const router = express.Router();

router.use(TestRoutes);

router.use(HowToUseChurchLogoRoutes);

router.use(BlogRoutes);

router.use(LeadRoutes);

router.use(AuthRoutes);

router.use(ReviewRoutes);

router.use(ImageRoutes);

router.use(PackageRoutes);

router.use(SystemRoutes);

export const PublicRoutes = router;
