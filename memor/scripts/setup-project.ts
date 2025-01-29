import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const directories = [
  // App routes
  "app/(auth)",
  "app/(tabs)",
  // Features
  "features/notes/components",
  "features/notes/hooks",
  // Core components
  "components/core",
  "components/ui",
  // Services
  "services/auth",
  "services/db",
  // Utils
  "utils/types",
  "utils/constants",
];

async function setupProject() {
  try {
    for (const dir of directories) {
      await mkdir(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }

    console.log("Project structure created successfully!");
  } catch (error) {
    console.error("Error setting up project structure:", error);
  }
}

setupProject();
