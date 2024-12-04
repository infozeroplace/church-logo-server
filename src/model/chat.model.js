import { Schema, model } from "mongoose";
import mongoosePlugin from "mongoose-aggregate-paginate-v2";
import { messageTypes } from "../constant/chat.constant.js";

const messageSchema = Schema(
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
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
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
    isCustomOffer: {
      type: Boolean,
      default: false,
    },
    customOffer: {},
    text: String,
    messageType: {
      type: String,
      enum: {
        values: messageTypes,
        message: "{VALUE} is not matched",
      },
    },
    action: {
      type: String,
      enum: {
        values: ["accepted", "declined"],
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

messageSchema.index({
  sender: 1,
  receiver: 1,
  conversationId: 1,
  messageType: 1,
});

messageSchema.plugin(mongoosePlugin);

const Message = model("Message", messageSchema);

const ConversationSchema = Schema(
  {
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
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
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
        values: messageTypes,
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

ConversationSchema.index({ creator: 1, participant: 1, messageType: 1 });

ConversationSchema.plugin(mongoosePlugin);

const Conversation = model("Conversation", ConversationSchema);

export { Conversation, Message };
