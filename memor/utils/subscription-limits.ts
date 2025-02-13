export type BaseLimits = {
  storageLimit: number;
  attachmentSizeLimit: number;
};

export type TotalLimits = BaseLimits & {
  aiQueriesTotal: number;
  audioRecordingsTotal: number;
};

export type DailyLimits = BaseLimits & {
  aiQueriesPerDay: number;
  audioRecordingsPerDay: number;
};

export const subscriptionLimits: {
  free: TotalLimits;
  basic: TotalLimits;
  trial: DailyLimits;
  pro: DailyLimits;
} = {
  free: {
    storageLimit: 5 * 1024 * 1024, // 5MB in bytes
    aiQueriesTotal: 10, // lifetime limit
    audioRecordingsTotal: 10, // lifetime limit
    attachmentSizeLimit: 5 * 1024 * 1024, // 5MB
  },
  basic: {
    storageLimit: 5 * 1024 * 1024, // 5MB
    aiQueriesTotal: 10, // lifetime limit
    audioRecordingsTotal: 10, // lifetime limit
    attachmentSizeLimit: 5 * 1024 * 1024, // 5MB
  },
  trial: {
    storageLimit: 50 * 1024 * 1024, // 50MB
    aiQueriesPerDay: 5,
    audioRecordingsPerDay: 5,
    attachmentSizeLimit: 5 * 1024 * 1024, // 5MB
  },
  pro: {
    storageLimit: 1024 * 1024 * 1024, // 1GB
    aiQueriesPerDay: 24,
    audioRecordingsPerDay: 24,
    attachmentSizeLimit: Number.MAX_SAFE_INTEGER, // unlimited
  },
} as const;
