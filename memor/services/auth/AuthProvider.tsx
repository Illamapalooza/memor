import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithCredential,
  getAdditionalUserInfo,
} from "firebase/auth";
import { auth } from "@/services/db/firebase";
import { db } from "@/services/db/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { UserProfile } from "@/utils/types/db";
import { subscriptionService } from "@/services/subscription/subscription.service";
import { UserOnboarding } from "@/utils/types/db";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  isEmailVerified: boolean;
  resetPasswordEmail: string | null;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  error: null,
  isEmailVerified: false,
  resetPasswordEmail: null,
  updateUserProfile: async () => {},
  signInWithGoogle: async () => {},
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

  useEffect(() => {
    // Configure Google Sign In
    GoogleSignin.configure({
      iosClientId:
        "319369146329-b12r8r6mmlfc3h1j141ffj68qubpv3t8.apps.googleusercontent.com",
      webClientId:
        "319369146329-dc97rcl1eqv59tmga8e7ul10r2re8qj9.apps.googleusercontent.com",
    });
  }, []);

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("No user logged in");

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, updates);

      // Update local state
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.data?.idToken) {
        const credential = GoogleAuthProvider.credential(response.data.idToken);
        const userCredential = await signInWithCredential(auth, credential);

        // Check if this is a new user
        const isNewUser = getAdditionalUserInfo(userCredential)?.isNewUser;

        if (isNewUser) {
          // Create initial user profile
          const newUserProfile: UserProfile = {
            id: userCredential.user.uid,
            email: userCredential.user.email || "",
            displayName: userCredential.user.displayName || "",
            photoURL: userCredential.user.photoURL || "",
            createdAt: new Date(),
            emailVerified: true, // Google accounts are always verified
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

          const userDocRef = doc(db, "users", userCredential.user.uid);
          await setDoc(userDocRef, newUserProfile);

          // Initialize onboarding data
          const onboardingRef = doc(
            db,
            "userOnboarding",
            userCredential.user.uid
          );
          const onboardingData: UserOnboarding = {
            userId: userCredential.user.uid,
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
        }
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Operation is in progress already");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available");
      } else {
        console.error("Other error:", error);
        setError(error);
      }
    }
  };

  const contextValue = {
    user,
    userProfile,
    isLoading,
    error,
    isEmailVerified,
    resetPasswordEmail,
    updateUserProfile,
    signInWithGoogle,
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
