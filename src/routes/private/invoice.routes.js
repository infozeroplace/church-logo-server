import express from "express";
import { InvoiceController } from "../../controller/private/invoice.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.get(
  "/invoice/invoice-list",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  InvoiceController.getInvoiceList
);

router.get(
  "/invoice/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  InvoiceController.getInvoice
);

export const InvoiceRoutes = router;
