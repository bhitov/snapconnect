
Each normal chat can spawn a private “coach chat” where the user talks to an AI relationship coach (Gottman-style).

Start coach chat – From any 1-to-1 or group conversation, the user can press a “🎓 Coach” icon in the header.
 • If a coach chat doesn’t exist for that user + conversation, the Cloud Function startCoachChat creates one and returns coachCid.
 • The app then navigates to CoachChatScreen.

Coach chat UX – Looks like a normal chat but participants are user + coach (senderId === "coach").
 • Every user message sent in the coach chat triggers coachReply (another callable), which returns the coach’s generated reply.
 • The coach chat should also have an overflow / kebab menu with “Analyze chat”. Choosing that calls coachAnalyze, which posts a multi-paragraph report from the coach as a new message in the coach chat.

Chats list badge – In the main chat list, any conversation that already has a coach chat should show a small stacked-avatar icon; tapping that icon should jump directly to the coach chat (coachCid).

All Cloud Functions (startCoachChat, coachReply, coachAnalyze) are already implemented and reachable at those callable names.


there is a coachService in src/features/chat/services/coachService.ts