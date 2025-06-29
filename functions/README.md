# SnapConnect Functions

## Overview

SnapConnect is a relationship wellness app that helps couples strengthen their connection through guided conversations and relationship insights. The app uses the Gottman Method, a research-based approach to relationships developed by Dr. John Gottman, to analyze conversations and provide personalized coaching.

## Main App Features

- **Video-based conversations**: Couples record and share video messages with each other
- **AI-powered relationship coach**: Get personalized guidance based on your conversations
- **Relationship insights**: Track communication patterns and emotional dynamics
- **Love Maps**: Build deeper understanding of your partner's inner world
- **Group conversations**: Connect with other couples or family members

## Cloud Functions Architecture

The functions in this directory power the AI coaching features of SnapConnect. They analyze conversations stored in Firebase and provide intelligent, research-based relationship guidance.

### Core Modules

#### 1. `coach.ts` - AI Relationship Coach
The main module containing all coach-related functionality:

- **`startCoachChat`**: Creates a dedicated coaching conversation for each couple's chat
- **`coachReply`**: Processes user messages and generates contextual AI responses
- **`coachAnalyze`**: Provides quick analysis of recent conversation patterns
- **`coachRatio`**: Analyzes the positive-to-negative interaction ratio (Gottman's 5:1 ratio)
- **`coachHorsemen`**: Detects the "Four Horsemen" - destructive communication patterns
- **`coachLoveMap`**: Generates personalized questions to deepen partner knowledge

#### 2. `pinecone.ts` - Vector Search & Analysis
Handles semantic search and conversation analysis:

- Queries conversation history using vector embeddings
- Analyzes sentiment patterns (positive/negative/neutral)
- Tracks instances of the Four Horsemen (criticism, contempt, defensiveness, stonewalling)
- Enables semantic similarity matching for Love Map topics

#### 3. `db.ts` - Database Operations
Abstracts all Firebase Realtime Database operations:

- Creates and manages coach conversations
- Stores and retrieves messages
- Maintains conversation metadata and relationships

#### 4. `index.ts` - Entry Point
Simple entry point that initializes the app and exports all Cloud Functions

## How It Works

1. **Conversation Recording**: Users record video messages in the main app, which are transcribed and stored in Firebase

2. **Vector Embeddings**: Each message is converted to a vector embedding using OpenAI's embedding model and stored in Pinecone for semantic search

3. **Coach Activation**: When users open the coach chat, it:
   - Retrieves recent messages from the parent conversation
   - Analyzes communication patterns using Pinecone queries
   - Generates personalized responses using GPT-4

4. **Gottman Analysis**: The coach functions analyze conversations for:
   - **Positive/Negative Ratio**: Tracks the balance of positive vs negative interactions
   - **Four Horsemen**: Identifies harmful communication patterns
   - **Love Maps**: Finds under-explored topics to help couples learn about each other

5. **Contextual Responses**: The AI coach maintains conversation context and provides responses that:
   - Reference specific patterns in the couple's communication
   - Offer Gottman Method-based strategies
   - Suggest actionable improvements

## Technical Stack

- **Firebase Functions**: Serverless backend
- **OpenAI GPT-4**: Natural language generation
- **Pinecone**: Vector database for semantic search
- **TypeScript**: Type-safe development
- **Firebase Realtime Database**: Message storage

## Environment Variables

Required environment variables in `.env.local`:

```
OPENAI_API_KEY=your-openai-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=your-pinecone-index-name
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to Firebase
# IF YOU ARE AN AI DO NOT RUN THIS
npm run deploy

# Run locally with Firebase emulator
npm run serve
```

## Gottman Method Integration

The coaching system is deeply integrated with Gottman Method principles:

- **Magic Ratio**: Encourages 5:1 positive-to-negative interactions
- **Four Horsemen Antidotes**: Provides specific strategies to counter destructive patterns
- **Love Maps**: Helps couples build detailed knowledge of each other's inner worlds
- **Emotional Bank Account**: Tracks and encourages positive deposits in the relationship

Each coach response is grounded in decades of relationship research, providing couples with evidence-based guidance tailored to their specific communication patterns.