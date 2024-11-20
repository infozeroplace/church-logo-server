import express from "express";
import { ImageController } from "../../controller/public/image.controller.js";

const router = express.Router();

router.get("/image/gallery", ImageController.getGalleryImage);

export const ImageRoutes = router;
