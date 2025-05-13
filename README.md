# Memor

Memor is an AI-powered note-taking application that combines traditional note management capabilities with advanced artificial intelligence features. Using Retrieval Augmented Generation (RAG), Memor enables users to interact with their notes through natural language queries, receive contextually relevant responses, and manage information efficiently with a local-first architecture that maintains cloud synchronization.

## Features

- Local-first note-taking with cloud synchronization
- AI-powered queries using RAG technology
- Voice notes with transcription
- Subscription-based model with tiered access
- Cross-platform support (Android/iOS)

## Project Structure

The project consists of two main components:

- **Frontend**: React Native/Expo mobile application
- **Backend**: Node.js/Express.js server for AI processing and data management

### Directory Structure

- `memor/` - Frontend application (React Native with Expo)
- `memor-backend/` - Backend server (Express.js)

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI
- Firebase account
- OpenAI API key
- Pinecone account (for vector database)
- Stripe account (for subscription management)

## Setup Instructions

### Frontend Setup

1. Install dependencies:

   ```
   cd memor
   npx expo install
   ```

2. Create configuration:

   - Set up a Firebase project and obtain configuration details
   - Update configuration in app.json

3. Start the development server and use development build:

   ```
   npx expo start
   ```

4. Run on device or emulator:

   ```
   npm run android  # For Android
   ```

   For ios:

   ```
   npx expo start
   ```

   and press "s" to switch to development build and run IOS simulator

### Backend Setup

1. Install dependencies:

   ```
   cd memor-backend
   npm install
   ```

2. Set up environment variables:

   - Copy the sample.env file to .env
   - Fill in your API keys and configuration details

3. Start the development server:

   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   npm run start
   ```

## Environment Variables

The backend requires the following environment variables:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `OPENAI_API_KEY`: OpenAI API key
- Firebase configuration variables
- Pinecone configuration for vector database
- Stripe configuration for subscriptions

## Technologies Used

### Frontend

- React Native with Expo
- TypeScript
- React Native Paper for UI
- Firebase for authentication and data storage
- Expo Router for navigation
- React Context API and TanStack Query for state management

### Backend

- Node.js with Express
- TypeScript
- Firebase Admin SDK
- OpenAI and LangChain for AI features
- Pinecone for vector database
- Stripe for subscription management
- Winston for logging
