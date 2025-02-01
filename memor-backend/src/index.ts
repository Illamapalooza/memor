import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";

import { errorHandler } from "./middleware/error.middleware";
import { logger } from "./utils/logger";
import { subscriptionRoutes } from "./routes/subscription.routes";
import { customerRoutes } from "./routes/customer.routes";
import { ragRoutes } from "./routes/rag.routes";
import { NoteVectorizationService } from "./services/note-vectorization.service";

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(
  // cors({
  //   origin:
  //     process.env.NODE_ENV === "development"
  //       ? ["http://localhost:19006", "exp://localhost:19000"]
  //       : process.env.CORS_ORIGIN,
  //   credentials: true,
  // })
  cors()
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Use JSON parser for all routes except /api/subscriptions/webhook
app.use((req, res, next) => {
  if (req.originalUrl === "/api/subscriptions/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Create a raw body parser for webhook route
app.post(
  "/api/subscriptions/webhook",
  express.raw({ type: "application/json" }),
  subscriptionRoutes
);

// Initialize note vectorization service
NoteVectorizationService.getInstance();

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/rag", ragRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
