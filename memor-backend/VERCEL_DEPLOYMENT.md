# Vercel Deployment Guide

## Deployment Steps

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the following environment variables in your Vercel project settings:

```
# Server Configuration
NODE_ENV=production

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX=your_pinecone_index

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# CORS Configuration
CORS_ORIGIN=https://yourfrontend.com,https://your-other-frontend.com

# Logging
LOG_LEVEL=info
```

4. Make sure to override the build command in Vercel if necessary:

   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install --include=dev`

5. Deploy your project

## Troubleshooting

If you encounter build errors:

1. Make sure TypeScript is installed as a dependency (not just a devDependency)
2. Ensure your build command is using `npx tsc` instead of just `tsc`
3. Check that the vercel.json file is properly configured
