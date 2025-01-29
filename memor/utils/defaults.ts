export const DEFAULT_USAGE_LIMITS = {
  aiQueriesUsed: 0,
  audioRecordingsUsed: 0,
  notesCreated: 0,
  lastAiQuery: 0,
  lastAudioRecording: 0,
  lastPaywallShow: 0,
};

export const DEFAULT_SUBSCRIPTION = {
  tier: "basic" as const,
  status: "active" as const,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeSubscriptionId: null,
  trialEnd: null,
};
