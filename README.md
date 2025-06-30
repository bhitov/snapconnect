# BondSnap

BondSnap mixes Snapchat-style snaps with regular chat, then layers on an AI relationship coach. Tap the 🎓 button in any conversation to open a private “coach chat,” where GPT-4 trained on Gottman Method research reviews recent messages, measuring the 5 : 1 positivity ratio, detecting the Four Horsemen, surfacing Love-Map gaps, and more. It returns real-time, plain-English advice, follow-up questions, and optional multi-paragraph analyses, plus extras like balance meters and group-energy checks to suggest concrete next steps or activities—all visible only to you and your partner or group.

A relationship-focused messaging app that combines ephemeral snaps with persistent text messaging and AI-powered relationship coaching.

## quick start

### a) through expo go. the app behaves better but it is more complicated

install expo go on your android device

`npm install`
`mv env.local.bak .env.local`
`npm run start:firebase`

open expo go and scan the qr code on the screen

### b) with an apk. easier, a moderately more glitchy

https://drive.google.com/file/d/1791-wdE2-fIMm7dyYJ9CnuM1IcSvVZjI/view?usp=sharing


### c) not recommended. Running the app with firebase emulators and android emulators

`npm install`
`mv env.local.bak .env.local`
download the `.env.local` file and put it in the root directory
build the firebase functions `cd functions. npm install. npm run build.`
run the firebase emulator `npm run emulator` or `npm run emulator:persist` if you want the data to be stored when you close the emulator
simultaneously, run expo go `npm run start`, then hit `a` to open up the android emulator.


## Sample data

I pregenerated a bunch of data to test out my AI responses. alex and emma are in a healthy relationship and jason and sarah are in an unhealthy relationship. Useful for making sure the ai responses are at least directionally correct

use the example data:

healthy relationship:
alex_chen@example.com
emma_davis@example.com

unhealthy relationship:
jason_miller@example.com
sarah_jones@example.com

all passwords are `pass123word`

## User Stories

### Social Connection
**As a college student**, I want to stay connected with my group of friends through a shared group chat where we can send both disappearing snaps of our daily moments and persistent messages for planning events, so that we can maintain our friendships despite busy schedules.

### Romance Coach Features
**As someone in a new relationship**, I want access to an AI coach that can analyze my conversations and provide insights about our communication patterns, so that I can understand how to build a healthier relationship from the start.

**As a couple going through a rough patch**, I want to receive personalized questions and conversation starters based on what topics we haven't explored together, so that we can reconnect and deepen our understanding of each other.

**As a partner who wants to improve communication**, I want to understand our positive-to-negative interaction ratio and receive specific advice on how to increase positive interactions, so that we can build a more supportive and loving relationship.

### Future Features
**As someone seeking to improve platonic friendships**  I want relationship coaching that helps me navigate friend dynamics and resolve conflicts, so that I can maintain healthier long-term friendships.

**As a group chat member** I want AI-powered insights about group dynamics and suggestions for improving communication within our friend group, so that we can avoid misunderstandings and strengthen our collective bond.

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase Realtime Database & Cloud Functions
- **AI**: OpenAI
- **Search**: Pinecone vector database for conversation analysis
- **Authentication**: Firebase Auth