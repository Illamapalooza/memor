import { useState, useRef } from "react";
import { API_URL } from "@/utils/config";
import { useAuth } from "@/services/auth/AuthProvider";

type AIResponse = {
  answer: string;
  relevantNotes: {
    content: string;
    metadata: {
      noteId: string;
      title: string;
      userId: string;
    };
  }[];
};

export const useAIQuery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelQuery = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const queryAI = async (query: string): Promise<AIResponse | null> => {
    if (!user) {
      setError("You must be logged in to use AI features");
      return null;
    }

    setIsLoading(true);
    setError(null);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const idToken = await user.getIdToken();

      const response = await fetch(`${API_URL}/rag/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ query }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Query was cancelled");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
      return null;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return {
    queryAI,
    isLoading,
    error,
    cancelQuery,
  };
};
