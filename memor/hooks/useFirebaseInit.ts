import { useEffect, useState } from "react";
import { app } from "@/services/db/firebase";

export function useFirebaseInit() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (app) {
      setIsInitialized(true);
    }
  }, []);

  return isInitialized;
}
