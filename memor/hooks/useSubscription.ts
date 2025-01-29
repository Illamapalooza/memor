import { useEffect, useState } from "react";
import { auth } from "@/services/db/firebase";
import { db } from "@/services/db/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { UserSubscription } from "../services/subscription/subscription.service";

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        setIsLoading(false);
        const data = doc.data();
        if (data?.subscription) {
          setSubscription(data.subscription as UserSubscription);
        } else {
          setSubscription(null);
        }
      },
      (error) => {
        console.error("Error fetching subscription:", error);
        setError(error as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    subscription,
    isLoading,
    error,
    isSubscribed:
      subscription?.status === "active" || subscription?.status === "trialing",
    isTrialing: subscription?.status === "trialing",
    isCanceled: subscription?.status === "canceled",
    willExpire: subscription?.cancelAtPeriodEnd,
  };
}
