import { Platform } from "react-native";

export const API_URL =
  Platform.OS === "ios"
    ? "http://localhost:3000/api"
    : "http://10.0.2.2:3000/api";
