import express from "express";
import { TaskController } from "../../controller/private/task.controller.js";
import { ENUM_USER_ROLE } from "../../enum/user.js";
import auth from "../../middleware/auth.js";
import validateRequest from "../../middleware/validateRequest.js";
import { TaskValidation } from "../../validation/task.validation.js";

const router = express.Router();

router.post(
  "/task/add-comment",
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MODERATOR
  ),
  validateRequest(TaskValidation.postComment),
  TaskController.addComment
);

router.put(
  "/task/update-task",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  TaskController.updateTask
);

router.delete(
  "/task/delete-tasks",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  TaskController.deleteTasks
);

router.get(
  "/task/task-list",
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MODERATOR
  ),
  TaskController.getTaskList
);

router.post(
  "/task/create-task",
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(TaskValidation.createTask),
  TaskController.createTask
);

router.get(
  "/task/:id",
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MODERATOR
  ),
  TaskController.getTask
);

router.delete(
  "/task/delete-task/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  TaskController.deleteTask
);

export const TaskRoutes = router;
