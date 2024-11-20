export const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://churchlogo.co",
    "https://admin.churchlogo.co",
    "https://www.churchlogo.co",
    "https://www.admin.churchlogo.co",
  ],
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "authorization"],
};