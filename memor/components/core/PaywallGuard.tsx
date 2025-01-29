import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/services/auth/AuthProvider";
import { UsageService } from "@/services/usage/usage.service";
import { PaywallModal } from "./PaywallModal";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/db/firebase";
import { UserProfile } from "@/utils/types/db";
import { DEFAULT_USAGE_LIMITS } from "@/utils/defaults";

type PaywallGuardProps = {
  children: React.ReactNode;
  feature?: "aiQueries" | "audioRecordings" | "notes";
  onClose?: () => void;
};

export const PaywallGuard = ({
  children,
  feature,
  onClose,
}: PaywallGuardProps) => {
  const { userProfile: initialProfile } = useAuth();
  const [userProfile, setUserProfile] = React.useState(initialProfile);
  const [showPaywall, setShowPaywall] = React.useState(false);
  const [forceHidePaywall, setForceHidePaywall] = React.useState(false);

  // Listen for real-time updates to user profile
  useEffect(() => {
    if (!initialProfile?.id) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", initialProfile.id),
      (doc) => {
        if (doc.exists()) {
          const updatedProfile = doc.data() as UserProfile;
          // Ensure usageLimits exists with default values
          updatedProfile.usageLimits = {
            ...DEFAULT_USAGE_LIMITS,
            ...updatedProfile.usageLimits,
          };
          setUserProfile(updatedProfile);

          // Check limits whenever profile updates
          if (
            feature &&
            !UsageService.checkUsageLimit(updatedProfile, feature) &&
            !forceHidePaywall
          ) {
            setShowPaywall(true);
          }
        }
      }
    );

    return () => unsubscribe();
  }, [initialProfile?.id, feature, forceHidePaywall]);

  const handleClosePaywall = () => {
    setShowPaywall(false);
    setForceHidePaywall(true);
    onClose?.();
  };

  if (!userProfile) return null;

  return (
    <>
      {children}
      <PaywallModal
        visible={showPaywall}
        onClose={handleClosePaywall}
        feature={feature}
        permanent={
          feature ? !UsageService.checkUsageLimit(userProfile, feature) : false
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    opacity: 0.7,
  },
  button: {
    marginTop: 8,
  },
});
