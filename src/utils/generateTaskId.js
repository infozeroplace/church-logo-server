import { Task } from "../model/task.model.js";

const generateRandomTaskId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";

  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters[randomIndex];
  }

  return id;
};

const generateTaskId = async () => {
  let isUnique = false;
  let id;

  while (!isUnique) {
    id = generateRandomTaskId();

    // Check if the TaskId already exists in the collection
    const existingTask = await Task.findOne({ taskId: id });

    if (!existingTask) {
      isUnique = true;
    }
  }

  return id;
};

export default generateTaskId;
