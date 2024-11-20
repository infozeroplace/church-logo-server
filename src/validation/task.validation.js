import { z } from "zod";

const attachment = z.object({
  url: z.string().url(),
});

const postComment = z.object({
  body: z.object({
    taskId: z.string({
      required_error: "Task Id is required",
    }),
    userId: z.string({
      required_error: "User Id is required",
    }),
    user: z.string({
      required_error: "User Id is required",
    }),
    attachments: z.array(attachment).optional(),
    text: z.string({
      required_error: "Text is required",
    }),
  }),
});

const createTask = z.object({
  body: z.object({
    orderId: z.string({
      required_error: "Order Id is required",
    }),
    title: z.string({
      required_error: "Title is required",
    }),
    summaryInstructions: z.string({
      required_error: "Summary is required",
    }),
    deadline: z.string({
      required_error: "Deadline is required",
    }),
    status: z.string({
      required_error: "Status is required",
    }),
    priority: z.string({
      required_error: "Priority is required",
    }),
    category: z.string({
      required_error: "Category is required",
    }),
    assignedTo: z.array(z.string()).optional(),
    attachments: z.array(attachment).optional(),
  }),
});

export const TaskValidation = {
  postComment,
  createTask,
};
