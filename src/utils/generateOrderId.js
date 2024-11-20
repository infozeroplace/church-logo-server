import { Order } from "../model/order.model.js";

const generateRandomOrderId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";

  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters[randomIndex];
  }

  return id;
};

const generateOrderId = async () => {
  let isUnique = false;
  let id;

  while (!isUnique) {
    id = generateRandomOrderId();

    // Check if the orderId already exists in the collection
    const existingOrder = await Order.findOne({ orderId: id });

    if (!existingOrder) {
      isUnique = true;
    }
  }

  return id;
};

export default generateOrderId;
