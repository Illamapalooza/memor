import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Environment
export const NODE_ENV = process.env.NODE_ENV || "development";
export const IS_PRODUCTION = NODE_ENV === "production";

// Server
export const PORT = process.env.PORT || 3000;

// API URL (for frontend reference)
export const API_URL = IS_PRODUCTION
  ? process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api`
    : process.env.API_URL || "https://memor-backend.vercel.app/api"
  : `http://localhost:${PORT}/api`;

// CORS settings
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Export all other config as needed
