import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/services/db/firebase";
import { db } from "@/services/db/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile } from "@/utils/types/db";
import { subscriptionService } from "@/services/subscription/subscription.service";
import { updateDoc } from "firebase/firestore";
import { UserOnboarding } from "@/utils/types/db";

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  isEmailVerified: boolean;
  resetPasswordEmail: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  error: null,
  isEmailVerified: false,
  resetPasswordEmail: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState<string | null>(
    null
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);

          // Get or create user profile
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // Create initial user profile
            const newUserProfile: UserProfile = {
              id: user.uid,
              email: user.email || "",
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
              createdAt: new Date(),
              emailVerified: user.emailVerified,
              subscription: {
                tier: "basic",
                status: "active",
              },
              usageLimits: {
                aiQueriesUsed: 0,
                audioRecordingsUsed: 0,
                notesCreated: 0,
              },
              settings: {
                theme: "system",
                notificationsEnabled: true,
              },
            };

            await setDoc(userDocRef, newUserProfile);
            setUserProfile(newUserProfile);
          } else {
            setUserProfile(userDoc.data() as UserProfile);
          }

          // Check if this is first time sign in
          const onboardingRef = doc(db, "userOnboarding", user.uid);
          const onboardingDoc = await getDoc(onboardingRef);

          if (!onboardingDoc.exists()) {
            // First time sign in - initialize onboarding
            const onboardingData: UserOnboarding = {
              userId: user.uid,
              hasCompletedOnboarding: false,
              firstSignInAt: new Date(),
              lastSignInAt: new Date(),
              onboardingSteps: {
                welcomeScreen: false,
                featureTour: false,
                createFirstNote: false,
              },
            };
            await setDoc(onboardingRef, onboardingData);
          } else {
            await updateDoc(onboardingRef, {
              lastSignInAt: new Date(),
            });
          }

          setIsEmailVerified(user.emailVerified);
        } else {
          setUser(null);
          setUserProfile(null);
          setIsEmailVerified(false);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const contextValue = {
    user,
    userProfile,
    isLoading,
    error,
    isEmailVerified,
    resetPasswordEmail,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
