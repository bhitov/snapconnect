import type { TextMessage, TextMessageWithUserInfo } from '../src/db';
import type { FetchedData } from '../src/types';
import type { ConversationStats } from '../src/pinecone';

interface MockScenario {
  data: FetchedData;
  context: {
    stats: ConversationStats;
    parentMessages?: TextMessageWithUserInfo[];
  };
}

const mockData = {
  BALANCED_ROMANTIC: {
    data: {
      uid: 'test-user-1',
      coachCid: 'coach-123',
      parentCid: 'parent-456',
      displayName: 'Alex Johnson',
      username: 'alexj',
      coachMessages: [
        {
          id: 'c1',
          senderId: 'coach',
          text: "Hi! I'm your relationship coach. Ask me anything or choose an option from the menu.",
          createdAt: Date.now() - 50000,
          conversationId: 'coach-123',
        },
        {
          id: 'c2',
          senderId: 'test-user-1',
          text: "I'd like some help understanding our communication patterns",
          createdAt: Date.now() - 45000,
          conversationId: 'coach-123',
        },
        {
          id: 'c3',
          senderId: 'coach',
          text: "I'd be happy to help analyze your communication patterns. Based on Dr. Gottman's research, healthy relationships maintain a 5:1 ratio of positive to negative interactions. Let me analyze your recent conversations.",
          createdAt: Date.now() - 40000,
          conversationId: 'coach-123',
        },
        {
          id: 'c4',
          senderId: 'test-user-1',
          text: "That sounds helpful. Sometimes I feel like we're doing well but other times we struggle",
          createdAt: Date.now() - 35000,
          conversationId: 'coach-123',
        },
        {
          id: 'c5',
          senderId: 'coach',
          text: "That's completely normal. All relationships have ups and downs. What matters is how you handle conflicts and maintain connection. Would you like me to analyze your recent conversations or discuss specific challenges?",
          createdAt: Date.now() - 30000,
          conversationId: 'coach-123',
        },
      ] as TextMessage[],
      parentMessages: [
        {
          id: '1',
          senderId: 'test-user-1',
          text: 'I really appreciated how you handled that situation with my parents',
          createdAt: Date.now() - 6000,
          conversationId: 'parent-456',
          senderInfo: { displayName: 'Alex Johnson', username: 'alexj' },
        },
        {
          id: '2',
          senderId: 'test-user-partner-1',
          text: 'Thanks, I was nervous but I think it went well',
          createdAt: Date.now() - 5000,
          conversationId: 'parent-456',
          senderInfo: { displayName: 'Sarah Johnson', username: 'sarahj' },
        },
        {
          id: '3',
          senderId: 'test-user-1',
          text: "You were amazing, I'm so proud of you",
          createdAt: Date.now() - 4000,
          conversationId: 'parent-456',
          senderInfo: { displayName: 'Alex Johnson', username: 'alexj' },
        },
        {
          id: '4',
          senderId: 'test-user-partner-1',
          text: 'That means a lot to me',
          createdAt: Date.now() - 3000,
          conversationId: 'parent-456',
          senderInfo: { displayName: 'Sarah Johnson', username: 'sarahj' },
        },
        {
          id: '5',
          senderId: 'test-user-1',
          text: 'I do wish you had told me about the dinner plans earlier',
          createdAt: Date.now() - 2000,
          conversationId: 'parent-456',
          senderInfo: { displayName: 'Alex Johnson', username: 'alexj' },
        },
        {
          id: '6',
          senderId: 'test-user-partner-1',
          text: "You're right, I should have communicated better",
          createdAt: Date.now() - 1000,
          conversationId: 'parent-456',
          senderInfo: { displayName: 'Sarah Johnson', username: 'sarahj' },
        },
      ] as TextMessageWithUserInfo[],
    },
    context: {
      stats: {
        ratio: '5.0',
        horsemen: {
          criticism: 1,
          contempt: 0,
          defensiveness: 1,
          stonewalling: 0,
        },
        positive: 25,
        negative: 5,
        neutral: 10,
        totalMessages: 40,
      },
    },
  } as const,

  STRUGGLING_ROMANTIC: {
    data: {
      uid: 'test-user-2',
      coachCid: 'coach-789',
      parentCid: 'parent-012',
      displayName: 'Sam Miller',
      username: 'smiller',
      parentMessages: [
        {
          id: '1',
          senderId: 'test-user-2',
          text: "You never listen to what I'm saying",
          createdAt: Date.now() - 6000,
          conversationId: 'parent-012',
          senderInfo: { displayName: 'Sam Miller', username: 'smiller' },
        },
        {
          id: '2',
          senderId: 'test-user-partner-2',
          text: "That's because you're always complaining about something",
          createdAt: Date.now() - 5000,
          conversationId: 'parent-012',
          senderInfo: { displayName: 'Jordan Miller', username: 'jmiller' },
        },
        {
          id: '3',
          senderId: 'test-user-2',
          text: 'See, this is exactly what I mean - you dismiss everything I say',
          createdAt: Date.now() - 4000,
          conversationId: 'parent-012',
          senderInfo: { displayName: 'Sam Miller', username: 'smiller' },
        },
        {
          id: '4',
          senderId: 'test-user-partner-2',
          text: "Whatever, I don't have time for this",
          createdAt: Date.now() - 3000,
          conversationId: 'parent-012',
          senderInfo: { displayName: 'Jordan Miller', username: 'jmiller' },
        },
        {
          id: '5',
          senderId: 'test-user-2',
          text: 'Fine, just walk away like you always do',
          createdAt: Date.now() - 2000,
          conversationId: 'parent-012',
          senderInfo: { displayName: 'Sam Miller', username: 'smiller' },
        },
        {
          id: '6',
          senderId: 'test-user-partner-2',
          text: "At least I'm not constantly nagging",
          createdAt: Date.now() - 1000,
          conversationId: 'parent-012',
          senderInfo: { displayName: 'Jordan Miller', username: 'jmiller' },
        },
      ] as TextMessageWithUserInfo[],
    },
    context: {
      stats: {
        ratio: '1.5',
        horsemen: {
          criticism: 5,
          contempt: 3,
          defensiveness: 4,
          stonewalling: 2,
        },
        positive: 15,
        negative: 10,
        neutral: 5,
        totalMessages: 30,
      },
    },
  } as const,

  HIGH_CONFLICT_ROMANTIC: {
    data: {
      uid: 'test-user-3',
      coachCid: 'coach-345',
      parentCid: 'parent-678',
      displayName: 'Taylor Brown',
      username: 'tbrown',
      coachMessages: [
        {
          id: 'c1',
          senderId: 'coach',
          text: "Hi! I'm your relationship coach. Ask me anything or choose an option from the menu.",
          createdAt: Date.now() - 50000,
          conversationId: 'coach-345',
        },
        {
          id: 'c2',
          senderId: 'test-user-3',
          text: 'We keep having the same fights over and over',
          createdAt: Date.now() - 45000,
          conversationId: 'coach-345',
        },
        {
          id: 'c3',
          senderId: 'coach',
          text: "I hear how frustrating that must be. Repetitive conflicts often indicate deeper unresolved issues. Dr. Gottman's research shows that 69% of relationship problems are perpetual. The key is learning to manage them constructively.",
          createdAt: Date.now() - 40000,
          conversationId: 'coach-345',
        },
        {
          id: 'c4',
          senderId: 'test-user-3',
          text: 'It feels hopeless sometimes. We just end up hurting each other',
          createdAt: Date.now() - 35000,
          conversationId: 'coach-345',
        },
        {
          id: 'c5',
          senderId: 'coach',
          text: "Your feelings are valid, and it takes courage to seek help. When couples hurt each other repeatedly, it's often due to what Gottman calls the 'Four Horsemen' - criticism, contempt, defensiveness, and stonewalling. Let's work on replacing these with healthier patterns.",
          createdAt: Date.now() - 30000,
          conversationId: 'coach-345',
        },
      ] as TextMessage[],
      parentMessages: [
        {
          id: '1',
          senderId: 'test-user-3',
          text: "You're so selfish, you only think about yourself",
          createdAt: Date.now() - 10000,
          conversationId: 'parent-678',
          senderInfo: { displayName: 'Taylor Brown', username: 'tbrown' },
        },
        {
          id: '2',
          senderId: 'test-user-partner-3',
          text: "Look who's talking - you're the most self-centered person I know",
          createdAt: Date.now() - 9000,
          conversationId: 'parent-678',
          senderInfo: { displayName: 'Morgan Brown', username: 'mbrown' },
        },
        {
          id: '3',
          senderId: 'test-user-3',
          text: "I can't believe I wasted so much time with you",
          createdAt: Date.now() - 8000,
          conversationId: 'parent-678',
          senderInfo: { displayName: 'Taylor Brown', username: 'tbrown' },
        },
        {
          id: '4',
          senderId: 'test-user-partner-3',
          text: 'The feeling is mutual',
          createdAt: Date.now() - 7000,
          conversationId: 'parent-678',
          senderInfo: { displayName: 'Morgan Brown', username: 'mbrown' },
        },
        {
          id: '5',
          senderId: 'test-user-3',
          text: '[no response for 2 hours]',
          createdAt: Date.now() - 6000,
          conversationId: 'parent-678',
          senderInfo: { displayName: 'Taylor Brown', username: 'tbrown' },
        },
        {
          id: '6',
          senderId: 'test-user-partner-3',
          text: 'Typical, running away from problems as usual',
          createdAt: Date.now() - 1000,
          conversationId: 'parent-678',
          senderInfo: { displayName: 'Morgan Brown', username: 'mbrown' },
        },
      ] as TextMessageWithUserInfo[],
    },
    context: {
      stats: {
        ratio: '0.5',
        horsemen: {
          criticism: 8,
          contempt: 6,
          defensiveness: 7,
          stonewalling: 5,
        },
        positive: 5,
        negative: 10,
        neutral: 5,
        totalMessages: 20,
      },
    },
  } as const,

  SUPERFICIAL_ROMANTIC: {
    data: {
      uid: 'test-user-4',
      coachCid: 'coach-901',
      parentCid: 'parent-234',
      displayName: 'Casey Davis',
      username: 'cdavis',
      parentMessages: [
        {
          id: '1',
          senderId: 'test-user-4',
          text: 'How was your day?',
          createdAt: Date.now() - 7000,
          conversationId: 'parent-234',
          senderInfo: { displayName: 'Casey Davis', username: 'cdavis' },
        },
        {
          id: '2',
          senderId: 'test-user-partner-4',
          text: 'Good, yours?',
          createdAt: Date.now() - 6000,
          conversationId: 'parent-234',
          senderInfo: { displayName: 'Riley Davis', username: 'rdavis' },
        },
        {
          id: '3',
          senderId: 'test-user-4',
          text: 'Good too',
          createdAt: Date.now() - 5000,
          conversationId: 'parent-234',
          senderInfo: { displayName: 'Casey Davis', username: 'cdavis' },
        },
        {
          id: '4',
          senderId: 'test-user-partner-4',
          text: 'What should we have for dinner?',
          createdAt: Date.now() - 4000,
          conversationId: 'parent-234',
          senderInfo: { displayName: 'Riley Davis', username: 'rdavis' },
        },
        {
          id: '5',
          senderId: 'test-user-4',
          text: 'Whatever you want',
          createdAt: Date.now() - 3000,
          conversationId: 'parent-234',
          senderInfo: { displayName: 'Casey Davis', username: 'cdavis' },
        },
        {
          id: '6',
          senderId: 'test-user-partner-4',
          text: 'Pizza sounds good',
          createdAt: Date.now() - 2000,
          conversationId: 'parent-234',
          senderInfo: { displayName: 'Riley Davis', username: 'rdavis' },
        },
        {
          id: '7',
          senderId: 'test-user-4',
          text: 'Sure, that works',
          createdAt: Date.now() - 1000,
          conversationId: 'parent-234',
          senderInfo: { displayName: 'Casey Davis', username: 'cdavis' },
        },
      ] as TextMessageWithUserInfo[],
    },
    context: {
      stats: {
        ratio: '10.0',
        horsemen: {
          criticism: 0,
          contempt: 0,
          defensiveness: 0,
          stonewalling: 0,
        },
        positive: 30,
        negative: 3,
        neutral: 17,
        totalMessages: 50,
      },
    },
  } as const,
};

export { mockData };
