import httpStatus from "http-status";
import { invoiceFilterableField } from "../../constant/invoice.constant.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { InvoiceService } from "../../service/private/invoice.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const getInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await InvoiceService.getInvoice(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice retrieved successfully",
    meta: null,
    data: result,
  });
});

const getInvoiceList = catchAsync(async (req, res) => {
  const filters = pick(req.query, invoiceFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await InvoiceService.getInvoiceList(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice list retrieved successfully",
    meta,
    data,
  });
});

export const InvoiceController = {
  getInvoiceList,
  getInvoice,
};
