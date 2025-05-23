import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import { errorHandler } from "./middleware/error.middleware";
import { logger } from "./utils/logger";
import { PORT, CORS_ORIGIN, IS_PRODUCTION } from "./utils/config";
import { subscriptionRoutes } from "./routes/subscription.routes";
import { customerRoutes } from "./routes/customer.routes";
import { ragRoutes } from "./routes/rag.routes";
import { NoteVectorizationService } from "./services/note-vectorization.service";
import { transcriptionRoutes } from "./routes/transcription.routes";
import { ttsRoutes } from "./routes/tts.routes";
import { imageAnalysisRoutes } from "./routes/image-analysis.routes";
import { ImageAnalysisService } from "./services/image-analysis.service";

const app = express();

// Configure trust proxy for proper IP detection behind proxies
// Use a more specific setting than 'true' for better security
// For AWS Lambda behind API Gateway, setting to 1 is typically appropriate
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Increased limit for testing with multiple devices
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

app.post(
  "/api/subscriptions/webhook",
  express.raw({ type: "application/json" }),
  subscriptionRoutes
);

// Initialize services
NoteVectorizationService.getInstance();
ImageAnalysisService.getInstance();

app.get("/api/test", (req, res) => {
  res.json({ message: "Test route is working!" });
});

app.use("/api/customers", customerRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/transcription", transcriptionRoutes);
app.use("/api/tts", ttsRoutes);
app.use("/api/image-analysis", imageAnalysisRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(
    `Server running on port ${PORT} in ${
      IS_PRODUCTION ? "production" : "development"
    } mode`
  );
});

export default app;
