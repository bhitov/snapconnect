# SnapConnect

A relationship-focused messaging app that combines ephemeral snaps with persistent text messaging and AI-powered relationship coaching.

## Running the app on a real android devie

install expo go on an android phone

download the `.env.local` file and put it in the root directory
install packages `npm install`
run `npm run start:firebase`. scan the qr code in expo go. sometimes you have to hit the `r` key too? might as well to be safe


## Running the app with firebase emulators and android emulators (fallback if first method doesn't work)

download the `.env.local` file and put it in the root directory
install packages `npm install`
build the firebase functions `cd functions. npm install. npm run build.`
run the firebase emulator `npm run emulator` or `npm run emulator:persist` if you want the data to be stored when you close the emulator
simultaneously, run expo go `npm run start`, then hit `a` to open up the android emulator.


use the example data:

healthy relationship:
alex_chen@example.com
emma_davis@example.com

unhealthy relationship:
jason_miller@example.com
sarah_jones@example.com

all passwords are `pass123word`

*[Instructions for running the app will be added here]*


## Purpose

SnapConnect brings together the best of both worlds: the fun, spontaneous nature of disappearing snaps and the reliability of traditional text messaging. What makes it unique is the integrated AI relationship coach powered by the Gottman Method, helping users build stronger, healthier relationships through real-time analysis and personalized guidance.

## Key Features

- **Hybrid Messaging**: Send both ephemeral photo/video snaps and persistent text messages
- **AI Relationship Coach**: Get personalized advice based on Gottman Method principles
- **Group Chats**: Stay connected with friends and family
- **Real-time Analysis**: Conversation sentiment tracking and relationship insights
- **Love Map Questions**: Deepen your connection with thoughtful conversation starters

## User Stories

### Social Connection
**As a college student**, I want to stay connected with my group of friends through a shared group chat where we can send both disappearing snaps of our daily moments and persistent messages for planning events, so that we can maintain our friendships despite busy schedules.

### Romance Coach Features
**As someone in a new relationship**, I want access to an AI coach that can analyze my conversations and provide insights about our communication patterns, so that I can understand how to build a healthier relationship from the start.

**As a couple going through a rough patch**, I want to receive personalized questions and conversation starters based on what topics we haven't explored together, so that we can reconnect and deepen our understanding of each other.

**As a partner who wants to improve communication**, I want to understand our positive-to-negative interaction ratio and receive specific advice on how to increase positive interactions, so that we can build a more supportive and loving relationship.

### Future Features
**As someone seeking to improve platonic friendships** *(coming soon)*, I want relationship coaching that helps me navigate friend dynamics and resolve conflicts, so that I can maintain healthier long-term friendships.

**As a group chat member** *(coming soon)*, I want AI-powered insights about group dynamics and suggestions for improving communication within our friend group, so that we can avoid misunderstandings and strengthen our collective bond.

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase Realtime Database & Cloud Functions
- **AI**: OpenAI
- **Search**: Pinecone vector database for conversation analysis
- **Authentication**: Firebase Auth

## Contributing

This project implements research-backed relationship advice from the Gottman Institute, focusing on evidence-based approaches to improving communication and relationship satisfaction.