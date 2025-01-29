export type Note = {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  isPinned: boolean;
  tags: string[];
};

export type SubscriptionTier = "free" | "basic" | "trial" | "pro";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "incomplete";

export type UsageLimits = {
  aiQueriesUsed: number;
  audioRecordingsUsed: number;
  notesCreated: number;
  lastPaywallShow?: number; // timestamp for paywall display timing
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  stripeCustomerId?: string;
  subscription: {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    trialEnd?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    stripeSubscriptionId?: string;
  };
  usageLimits: {
    aiQueriesUsed: number;
    audioRecordingsUsed: number;
    notesCreated: number;
    lastAiQuery?: number;
    lastAudioRecording?: number;
    lastPaywallShow?: number;
  };
  settings: {
    theme: "light" | "dark" | "system";
    notificationsEnabled: boolean;
  };
  emailVerified: boolean;
};

export type UserOnboarding = {
  userId: string;
  hasCompletedOnboarding: boolean;
  firstSignInAt: Date | null;
  lastSignInAt: Date;
  onboardingSteps: {
    welcomeScreen: boolean;
    featureTour: boolean;
    createFirstNote: boolean;
    // Add more steps as needed
  };
};
