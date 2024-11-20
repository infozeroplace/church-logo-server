import { Server } from "http";
import mongoose from "mongoose";
import app from "./app.js";
import config from "./config/index.js";
import { initSocketIO } from "./utils/socket.js";

process.on("uncaughtException", (error) => {
  console.log(error);
  process.exit(1);
});

let server = Server;

async function bootstrap() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(config.database_url);
    console.log("Database is connected successfully ✅✅✅✅✅");

    server = Server(app); 
    initSocketIO(server);

    server.listen(config.port, () => {
      console.log(`Application listening on port ${config.port} ⚡⚡⚡✨✨✨`);
      // console.log(config.database_url);
    });
  } catch (error) {
    console.log("❌ Failed to connect database", error);
  }
}

process.on("unhandledRejection", (error) => {
  if (server) {
    // Close the server and log the error
    server.close(() => {
      console.log(error);
      process.exit(1);
    });
  } else {
    // If server is not available, exit the process
    process.exit(1);
  }
});

bootstrap();

process.on("SIGTERM", () => {
  console.log("SIGTERM is received");
  if (server) {
    server.close();
  }
});