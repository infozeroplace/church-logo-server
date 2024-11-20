import { Schema, model } from "mongoose";
import mongoosePlugin from "mongoose-aggregate-paginate-v2";
import { packageCategories } from "../constant/package.constant.js";
import { taskPriorities, taskStatus } from "../constant/task.constant.js";

const taskSchema = Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    taskId: {
      type: String,
      required: [true, "Task Id is required"],
    },
    orderId: {
      type: String,
      required: [true, "Order Id is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    summaryInstructions: {
      type: String,
      required: [true, "Summary is required"],
    },
    deadline: {
      type: String,
      required: [true, "Deadline is required"],
    },
    status: {
      type: String,
      enum: {
        values: taskStatus,
        message: "{VALUE} is not matched",
      },
      required: [true, "Status is required"],
    },
    priority: {
      type: String,
      enum: {
        values: taskPriorities,
        message: "{VALUE} is not matched",
      },
      required: [true, "Priority is required"],
    },
    category: {
      type: String,
      enum: {
        values: packageCategories,
        message: "{VALUE} is not matched",
      },
      required: [true, "Category is required"],
    },
    assignedTo: {
      type: Array,
      required: [true, "Member is required"],
    },
    attachments: {
      type: Array,
      default: [],
    },
    links: {
      type: Array,
      default: [],
    },
    comments: {
      type: [
        {
          taskId: String,
          user: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
          attachments: Array,
          text: String,
          dateTime: Date
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

taskSchema.plugin(mongoosePlugin);

const Task = model("Task", taskSchema);

export { Task };
