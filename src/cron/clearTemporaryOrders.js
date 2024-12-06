import cron from "node-cron";
import { TemporaryOrder } from "../model/order.model.js";

export const clearTemporaryOrdersCron = async () => {
  // Runs at midnight every 10th day of the month
  cron.schedule("0 0 */10 * *", async () => {
    try {
      // Calculate the date 10 days ago
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      // Delete orders created more than 10 days ago
      const result = await TemporaryOrder.deleteMany({
        createdAt: { $lt: tenDaysAgo },
      });

      console.log(
        `Deleted ${result.deletedCount} orders older than ${tenDaysAgo}`
      );
    } catch (error) {
      console.error("Error deleting old temporary orders:", error);
    }
  });
};
