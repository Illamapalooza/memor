import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/services/db/firebase";
import { router } from "expo-router";
import { passwordValidation } from "@/utils/validation";
import { Alert } from "react-native";

type AuthError = {
  code: string;
  message: string;
};

export const useAuthOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    setIsLoading(true);
    try {
      // Create the user but don't maintain session
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update display name
      await updateProfile(userCredential.user, { displayName });

      // Send verification email
      await sendEmailVerification(userCredential.user);

      // Sign out immediately to force proper initialization on first sign in
      await signOut(auth);

      // Redirect to sign in
      router.replace("/sign-in");
      Alert.alert(
        "Account Created",
        "Please check your email to verify your account, then sign in."
      );
    } catch (e) {
      const authError = e as AuthError;
      setError({
        name: authError.code,
        message: authError.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(app)");
    } catch (e: any) {
      console.log(e);
      setError({
        name: e.code,
        message: getErrorMessage(e.code),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      router.replace("/(auth)/sign-in");
    } catch (e: any) {
      setError({
        name: e.code,
        message: getErrorMessage(e.code),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      setError({
        name: e.code,
        message: getErrorMessage(e.code),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
      } else {
        throw new Error("No user is currently signed in");
      }
    } catch (e: any) {
      setError({
        name: e.code || "verification-error",
        message: getErrorMessage(e.code),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    signUp,
    signIn,
    logout,
    resetPassword,
    sendVerificationEmail,
  };
};

function getErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in or use a different email.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled. Please contact support.";
    case "auth/weak-password":
      return "Password must contain at least one letter, one number, and be at least 8 characters long.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/email-verification-failed":
      return "Failed to send verification email. Please try again.";
    case "verification-error":
      return "Unable to verify email at this time. Please try again later.";
    case "auth/invalid-action-code":
      return "The password reset link is invalid or has expired. Please request a new one.";
    case "auth/expired-action-code":
      return "The password reset link has expired. Please request a new one.";
    default:
      return "An error occurred. Please try again.";
  }
}
