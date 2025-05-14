import { Platform } from "react-native";

// Define environment configurations
const ENV = {
  dev: {
    apiUrl:
      Platform.OS === "ios"
        ? "http://localhost:3000/api"
        : "http://10.0.2.2:3000/api",
  },
  prod: {
    apiUrl: "https://memor-backend.vercel.app/api",
  },
};

// Get the current environment
const getEnvironment = () => {
  // You can customize this logic based on how you build your app
  // For example, checking __DEV__ which is available in React Native
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

const environment = getEnvironment();
export const API_URL = environment.apiUrl;
