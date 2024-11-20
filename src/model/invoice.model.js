import { Schema, model } from "mongoose";
import mongoosePlugin from "mongoose-aggregate-paginate-v2";

const InvoiceSchema = Schema(
  {
    date: String,
    invoiceId: String,
    orderId: String,
    packageId: String,
    name: String,
    email: String,
    phone: String,
    country: String,
    packageTitle: String,
    type: String,
    items: Array,
    subtotal: Number,
    packagePrice: Number,
    total: Number,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

InvoiceSchema.plugin(mongoosePlugin);

const Invoice = model("Invoice", InvoiceSchema);

export { Invoice };
