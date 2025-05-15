import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import path from "path";

// Initialize Firebase Admin
const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, "../../service-account.json");

const app = initializeApp({
  credential: cert(serviceAccountPath),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

// Get Firebase Storage instance
export const storage = getStorage(app);
export const bucket = storage.bucket();
