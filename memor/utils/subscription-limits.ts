export const subscriptionLimits = {
  free: {
    notesPerMonth: 50,
    aiQueriesPerDay: 5,
    audioRecordingsPerDay: 5,
    attachmentSizeLimit: 5 * 1024 * 1024, // 5MB
  },
  basic: {
    notesPerMonth: 50,
    aiQueriesPerDay: 5,
    audioRecordingsPerDay: 5,
    attachmentSizeLimit: 5 * 1024 * 1024, // 5MB
  },
  trial: {
    notesPerMonth: 100,
    aiQueriesPerDay: 20,
    audioRecordingsPerDay: 20,
    attachmentSizeLimit: 10 * 1024 * 1024, // 10MB
  },
  pro: {
    notesPerMonth: Infinity,
    aiQueriesPerDay: Infinity,
    audioRecordingsPerDay: Infinity,
    attachmentSizeLimit: 100 * 1024 * 1024, // 100MB
  },
} as const;
