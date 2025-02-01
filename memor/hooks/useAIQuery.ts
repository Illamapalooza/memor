import { useState } from "react";
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

  const queryAI = async (query: string): Promise<AIResponse | null> => {
    if (!user) {
      setError("You must be logged in to use AI features");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const idToken = await user.getIdToken();

      const response = await fetch(`${API_URL}/rag/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    queryAI,
    isLoading,
    error,
  };
};
