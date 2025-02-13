# Memor - AI-Powered Note Taking App

A mobile-first note-taking application with RAG (Retrieval Augmented Generation) capabilities.

## Overview

Memor is a sophisticated note-taking application that combines traditional note-taking features with advanced AI capabilities. The app prioritizes local-first architecture while maintaining cloud sync capabilities.

## Tech Stack

### Core Technologies

- **Framework**: Expo SDK 52+
- **Language**: TypeScript
- **Platform Priority**: Android first, iOS second

### Backend Infrastructure

- **Server**: Express.js with TypeScript
- **API Architecture**: RESTful
- **Hosting**: To be determined
- **Environment**: Node.js

### Note Features

- **Note Editor**: Markdown

### Authentication & Database

- **Auth Provider**: Firebase Auth
- **Database**: Firebase Firestore
- **Local Storage**: Firebase with local-first operators

Offline persistence snippets

```typescript
// Memory cache is the default if no config is specified.
initializeFirestore(app);

// This is the default behavior if no persistence is specified.
initializeFirestore(app, { localCache: memoryLocalCache() });

// Defaults to single-tab persistence if no tab manager is specified.
initializeFirestore(app, { localCache: persistentLocalCache(/*settings*/ {}) });

// Same as `initializeFirestore(app, {localCache: persistentLocalCache(/*settings*/{})})`,
// but more explicit about tab management.
initializeFirestore(app, {
  localCache: persistentLocalCache(
    /*settings*/ { tabManager: persistentSingleTabManager() }
  ),
});

// Use multi-tab IndexedDb persistence.
initializeFirestore(app, {
  localCache: persistentLocalCache(
    /*settings*/ { tabManager: persistentMultipleTabManager() }
  ),
});
```

```typescript
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";

const firestoreDb = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});
```

listening to offline data

```typescript
import { collection, onSnapshot, where, query } from "firebase/firestore";

const q = query(collection(db, "cities"), where("state", "==", "CA"));
onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      console.log("New city: ", change.doc.data());
    }

    const source = snapshot.metadata.fromCache ? "local cache" : "server";
    console.log("Data came from " + source);
  });
});
```

Code sample Snippets

### Firebase Initialization

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  FIREBASE_CONFIGURATION,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
```

### Offline Persistence

```typescript
// Memory cache is the default if no config is specified.
initializeFirestore(app);

// This is the default behavior if no persistence is specified.
initializeFirestore(app, {localCache: memoryLocalCache()});

// Defaults to single-tab persistence if no tab manager is specified.
initializeFirestore(app, {localCache: persistentLocalCache(/_settings_/{})});

// Same as `initializeFirestore(app, {localCache: persistentLocalCache(/*settings*/{})})`,
// but more explicit about tab management.
initializeFirestore(app,
{localCache:
persistentLocalCache(/_settings_/{tabManager: persistentSingleTabManager()})
});

// Use multi-tab IndexedDb persistence.
initializeFirestore(app,
{localCache:
persistentLocalCache(/_settings_/{tabManager: persistentMultipleTabManager()})
});
```

Add data

```typescript
import { collection, addDoc } from "firebase/firestore";

try {
  const docRef = await addDoc(collection(db, "users"), {
    first: "Ada",
    last: "Lovelace",
    born: 1815,
  });
  console.log("Document written with ID: ", docRef.id);
} catch (e) {
  console.error("Error adding document: ", e);
}
```

### Payment Processing

- **Provider**: Stripe
- **Products**:
  - Free: Basic note-taking, limited AI queries (5) Show Paywall
  - Trial subscription: 7 days
  - Monthly subscription: $9.99/month
  - Annual subscription: $99/year
- **Features by Tier**:
  - Free: Basic note-taking, limited AI queries (5) lifetime Show Paywall, 10 notes per month
  - Pro: 24 queries per day, 10 gigabytes of storage, advanced RAG features

### ASK AI FEATURE

- Audio recording for query
- Text for query
- Response from AI - text and audio
- Have premade questions for AI to answer

### AI & Machine Learning

- **AI Provider**: OpenAI
- **Vector Database**: Pinecone
- **RAG Implementation**: LangChain
- **Audio Transcription**: OpenAI Whisper

### UI Framework

- **Design System**: React Native Paper
- **Styling**: React Native StyleSheet
- **List Virtualization**: Shopify FlashList

## Theming

Fonts

- **Primary Font**: Nunito
- **Secondary Font**: Inter

Colors

- **Background Color**: #FFFDFA
- **Primary Color**: #CA6853
- **Secondary Color**: #8590C8
- **Text Color**: #403B36
- **Destructive Color**: #E64A19

```typescript
const colors = {
  babyPowder: {
    DEFAULT: "#fffdfa",
    100: "#653d00",
    200: "#ca7900",
    300: "#ffac30",
    400: "#ffd595",
    500: "#fffdfa",
    600: "#fffdfb",
    700: "#fffefc",
    800: "#fffefd",
    900: "#fffffe",
  },
  jasper: {
    DEFAULT: "#ca6853",
    100: "#2c130d",
    200: "#57261b",
    300: "#833928",
    400: "#af4c36",
    500: "#ca6853",
    600: "#d58776",
    700: "#dfa598",
    800: "#eac3ba",
    900: "#f4e1dd",
  },
  vistaBlue: {
    DEFAULT: "#8590c8",
    100: "#15192e",
    200: "#29325b",
    300: "#3e4a89",
    400: "#5666b3",
    500: "#8590c8",
    600: "#9ca6d3",
    700: "#b5bcde",
    800: "#ced2e9",
    900: "#e6e9f4",
  },
  blackOlive: {
    DEFAULT: "#403b36",
    100: "#0d0c0b",
    200: "#191716",
    300: "#262320",
    400: "#332f2b",
    500: "#403b36",
    600: "#6a625a",
    700: "#938980",
    800: "#b7b0aa",
    900: "#dbd8d5",
  },
  flame: {
    DEFAULT: "#e64a19",
    100: "#2e0f05",
    200: "#5c1d0a",
    300: "#8a2c0f",
    400: "#b83a14",
    500: "#e64a19",
    600: "#eb6d47",
    700: "#f09275",
    800: "#f5b6a3",
    900: "#fadbd1",
  },
};
```

## File Architecture

memor
├── app/
│ ├── (auth)/
│ │ ├── sign-in.tsx
│ │ └── sign-up.tsx
│ ├── (app)/
│ │ ├── index.tsx
│ │ ├── note/
│ │ │ ├── index.tsx
│ │ │ ├── [id].tsx
│ │ │ └── create.tsx
│ │ ├── record/
│ │ │ └── index.tsx
│ │ └── ai/
│ │ └── index.tsx
│ ├── \_layout.tsx
│ └── +not-found.tsx
├── assets/
│ ├── images/
│ ├── icons/
│ └── fonts/
├── components/
│ ├── core/
│ │ ├── ThemedText.tsx
│ │ ├── ThemedView.tsx
│ │ ├── ExternalLink.tsx
│ │ └── Collapsible.tsx
│ ├── navigation/
│ │ └── TabBar.tsx
│ ├── ui/
│ │ ├── IconSymbol.tsx
│ │ ├── IconSymbol.ios.tsx
│ │ ├── TabBarBackground.tsx
│ │ └── TabBarBackground.ios.tsx
│ └── animations/
│ └── HelloWave.tsx
├── features/
│ ├── notes/
│ │ ├── contexts/
│ │ │ └── Notes.Context.ts
│ │ ├── hooks/
│ │ │ └── useAutoSave.ts
│ │ │ └── useNotes.ts
│ ├── audio/
│ │ ├── api/
│ │ ├── components/
│ │ ├── hooks/
│ │ └── types/
│ └── ai/
│ ├── api/
│ ├── components/
│ ├── hooks/
│ └── types/
├── services/
│ ├── firebase/
│ │ ├── auth/
│ │ │ ├── AuthProvider.tsx
│ │ ├── db/
│ │ │ ├── firebase.ts
│ │ │ └── firestore.utils.ts
│ │ │ └── notes.ts
│ │ ├── subscription/
│ │ │ ├── subscription.service.ts
│ │ └── storage/
│ │ └── async-storage.ts
├── hooks/
├── utils/
│ ├── types/
│ └── constants/

memor-backend
├── src/
│ ├── controllers/
│ ├── middleware/
│ ├── routes/
│ ├── services/
│ ├── utils/
│ └── index.ts
└── package.json

## Backend Architecture

### API Structure

// API Routes
/api
/auth // Authentication endpoints
/subscription // Subscription management
/ai // AI processing endpoints
/notes // Note CRUD operations
/search // Search endpoints

### Backend Dependencies

json
{
"dependencies": {
"express": "latest",
"stripe": "latest",
"openai": "latest",
"@pinecone-database/pinecone": "latest",
"langchain": "latest",
"firebase-admin": "latest",
"cors": "latest",
"helmet": "latest",
"express-rate-limit": "latest"
}
}

### Payment Flow

1. **Subscription Creation**

   ```typescript
   // Client-side flow
   1. User selects subscription plan
   2. App creates payment intent via backend
   3. Stripe Sheet opens for payment
   4. On success, update user subscription status
   ```

2. **Webhook Handling**
   ```typescript
   // Server-side webhook events
   -subscription.created -
     subscription.updated -
     subscription.deleted -
     payment_intent.succeeded -
     payment_intent.failed;
   ```

### AI Implementation

#### RAG Pipeline Architecture

// 1. Document Processing
interface DocumentProcessor {
chunk: (text: string) => Promise<string[]>;
embed: (chunks: string[]) => Promise<number[][]>;
store: (embeddings: number[][], metadata: any) => Promise<void>;
}
// 2. Query Processing
interface QueryProcessor {
processQuery: (query: string) => Promise<string>;
retrieveContext: (embedding: number[]) => Promise<string[]>;
generateResponse: (query: string, context: string[]) => Promise<string>;
}
// 3. Response Generation
interface ResponseGenerator {
generate: (query: string, context: string[]) => Promise<string>;
stream: (query: string, context: string[]) => Promise<ReadableStream>;
}

#### AI Rate Limiting

// Rate limiting configuration
{
free: {
queries_per_day: 5,
tokens_per_query: 1000
},
pro: {
queries_per_day: 100,
tokens_per_query: 4000
},
enterprise: {
queries_per_day: 1000,
tokens_per_query: 8000
}
}

## Mobile Implementation

### Required Libraries (Additional)

{
"dependencies": {
// Payment Processing
"@stripe/stripe-react-native": "latest",
// State Management for Subscriptions
"@tanstack/react-query": "latest",
// Secure Storage
"expo-secure-store": "latest",
// API Client
"axios": "latest"
}
}

### Subscription Management

// Subscription Types
type SubscriptionTier = 'free' | 'pro' | 'enterprise';
interface SubscriptionFeatures {
aiQueriesPerDay: number;
maxNotesCount: number;
maxAttachmentSize: number;
advancedFeatures: boolean;
}
// Subscription State Management
interface SubscriptionState {
tier: SubscriptionTier;
features: SubscriptionFeatures;
expiryDate: Date;
autoRenew: boolean;
}

## Security Considerations

### API Security

- JWT-based authentication
- Rate limiting per user/IP
- Request validation middleware
- CORS configuration
- Helmet security headers
- API key rotation strategy

### Payment Security

- PCI compliance through Stripe
- Secure webhook handling
- Payment intent verification
- Subscription status verification

### AI Security

- API key encryption
- Request/Response sanitization
- Token usage monitoring
- Rate limiting per user
- Input validation and sanitization

## Error Handling

### Payment Errors

enum PaymentError {
CARD_DECLINED = 'card_declined',
INSUFFICIENT_FUNDS = 'insufficient_funds',
EXPIRED_CARD = 'expired_card',
PROCESSING_ERROR = 'processing_error'
}

enum AIError {
RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
CONTEXT_TOO_LONG = 'context_too_long',
INVALID_QUERY = 'invalid_query',
PROCESSING_ERROR = 'processing_error'
}

## Monitoring and Analytics

- Stripe Dashboard for payment metrics
- OpenAI usage monitoring
- Firebase Analytics for user behavior
- Custom analytics for AI query patterns
- Error tracking and reporting

## Testing Strategy

- Unit tests for payment processing
- Integration tests for AI features
- E2E tests for subscription flows
- Load testing for AI endpoints
- Security penetration testing
