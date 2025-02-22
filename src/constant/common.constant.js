import config from "../config/index.js";

export const corsOptions = {
  origin: [
    ...config.origins,
    "mongodb://churchlogo.info%40gmail.com:churchlogo123456aA%40@185.201.9.31:27017/church_logo",
  ],
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "authorization"],
};
