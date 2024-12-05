import { Schema, model } from "mongoose";
import mongoosePlugin from "mongoose-aggregate-paginate-v2";
import { orderStatus, paymentStatus } from "../constant/order.constant.js";

const orderMessageSchema = Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "OrderConversation",
      index: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    review: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      index: true,
    },
    attachment: [
      {
        type: String,
      },
    ],
    isRead: {
      type: Boolean,
      index: true,
      default: false,
    },
    text: String,
    messageType: {
      type: String,
      enum: {
        values: ["order"],
        message: "{VALUE} is not matched",
      },
      default: "order",
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    isReview: {
      type: Boolean,
      default: false,
    },
    action: {
      type: String,
      enum: {
        values: ["completed", "revision"],
        message: "{VALUE} is not matched",
      },
    },
    dateTime: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

orderMessageSchema.index({
  sender: 1,
  receiver: 1,
  conversationId: 1,
  messageType: 1,
});

orderMessageSchema.plugin(mongoosePlugin);

const OrderMessage = model("OrderMessage", orderMessageSchema);

// ................................................................
// ................................................................

const OrderConversationSchema = Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      index: true,
      required: [true, "order is missing"],
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: [true, "creator is missing"],
    },
    participant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: [true, "participant is missing"],
    },
    lastUpdated: {
      type: Date,
      index: true,
      required: [true, "last updated is missing"],
    },
    attachments: {
      type: Array,
      default: [],
    },
    links: {
      type: Array,
      default: [],
    },
    messageType: {
      type: String,
      enum: {
        values: ["order"],
        message: "{VALUE} is not matched",
      },
      index: true,
      required: [true, "message type is missing"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

OrderConversationSchema.index({ creator: 1, participant: 1, messageType: 1 });

OrderConversationSchema.plugin(mongoosePlugin);

const OrderConversation = model("OrderConversation", OrderConversationSchema);

// ................................................................
// ................................................................

const OrderSchema = Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "OrderConversation",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "Package",
    },
    contactDetails: {
      firstName: String,
      lastName: String,
      phone: String,
      country: String,
    },
    transactionId: Array,
    invoiceId: Array,
    orderId: String,
    packageId: String,
    userId: String,
    category: String,
    email: String,
    paymentCurrency: String,
    thumbnail: String,
    customFeatures: Array,
    orderType: {
      type: String,
      enum: {
        values: ["general", "custom"],
        message: "{VALUE} is not matched",
      },
      default: "general",
    },
    orderStatus: {
      type: String,
      enum: {
        values: orderStatus,
        message: "{VALUE} is not matched",
      },
    },
    paymentStatus: {
      type: String,
      enum: {
        values: paymentStatus,
        message: "{VALUE} is not matched",
      },
      default: "pending",
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    additionalEmail: String,
    referredImages: Array,
    requirements: Array,
    preferredDesigns: Array,
    preferredColors: Array,
    additionalFeature: Array,
    additionalRevision: Array,
    additionalDeliveryTime: Array,
    additionalProgrammingLang: Array,
    totalRevision: Number,
    usedRevision: Number,
    packagePrice: Number,
    totalPrice: Number,
    orderDateUTC: Date,
    orderDateString: String,
    deliveryDateUTC: Date,
    deliveryDateString: String,
    paymentDateString: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

OrderSchema.plugin(mongoosePlugin);

const Order = model("Order", OrderSchema);

const TemporaryOrderSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "Package",
    },
    contactDetails: {
      firstName: String,
      lastName: String,
      phone: String,
      country: String,
    },
    orderType: {
      type: String,
      enum: {
        values: ["general", "custom"],
        message: "{VALUE} is not matched",
      },
      default: "general",
    },
    orderStatus: {
      type: String,
      enum: {
        values: orderStatus,
        message: "{VALUE} is not matched",
      },
    },
    paymentStatus: {
      type: String,
      enum: {
        values: paymentStatus,
        message: "{VALUE} is not matched",
      },
      default: "pending",
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    transactionId: Array,
    invoiceId: Array,
    orderId: String,
    messageId: String,
    packageId: String,
    userId: String,
    category: String,
    email: String,
    paymentCurrency: String,
    thumbnail: String,
    customFeatures: Array,
    additionalEmail: String,
    referredImages: Array,
    requirements: Array,
    preferredDesigns: Array,
    preferredColors: Array,
    additionalFeature: Array,
    additionalRevision: Array,
    additionalDeliveryTime: Array,
    additionalProgrammingLang: Array,
    totalRevision: Number,
    usedRevision: Number,
    packagePrice: Number,
    totalPrice: Number,
    orderDateUTC: Date,
    orderDateString: String,
    deliveryDateUTC: Date,
    deliveryDateString: String,
    paymentDateString: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

const TemporaryOrder = model("TemporaryOrder", TemporaryOrderSchema);

export { Order, OrderConversation, OrderMessage, TemporaryOrder };
