import { Invoice } from "../model/invoice.model.js";

const generateRandomInvoiceId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";

  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters[randomIndex];
  }

  return id;
};

const generateInvoiceId = async () => {
  let isUnique = false;
  let id;

  while (!isUnique) {
    id = generateRandomInvoiceId();

    const existingInvoice = await Invoice.findOne({ invoiceId: id });

    if (!existingInvoice) {
      isUnique = true;
    }
  }

  return id;
};

export default generateInvoiceId;
