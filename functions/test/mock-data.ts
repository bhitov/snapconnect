import type { TextMessage } from '../src/db';
import type { FetchedData } from '../src/types';
import type { ConversationStats } from '../src/pinecone';

interface MockScenario {
  data: FetchedData;
  context: {
    stats: ConversationStats;
    parentMessages?: TextMessage[];
  };
}

const mockData = {
  BALANCED_ROMANTIC: {
    data: {
      uid: 'test-user-1',
      coachCid: 'coach-123',
      parentCid: 'parent-456',
      displayName: 'Alex Johnson',
      username: 'alexj'
    },
    context: {
      stats: { 
        ratio: '5.0',
        horsemen: { criticism: 1, contempt: 0, defensiveness: 1, stonewalling: 0 },
        positive: 25,
        negative: 5,
        neutral: 10,
        totalMessages: 40
      },
      parentMessages: [
        { id: '1', senderId: 'Alex', text: 'I really appreciated how you handled that situation with my parents', createdAt: Date.now() - 6000, conversationId: 'parent-456' },
        { id: '2', senderId: 'Sarah', text: 'Thanks, I was nervous but I think it went well', createdAt: Date.now() - 5000, conversationId: 'parent-456' },
        { id: '3', senderId: 'Alex', text: 'You were amazing, I\'m so proud of you', createdAt: Date.now() - 4000, conversationId: 'parent-456' },
        { id: '4', senderId: 'Sarah', text: 'That means a lot to me', createdAt: Date.now() - 3000, conversationId: 'parent-456' },
        { id: '5', senderId: 'Alex', text: 'I do wish you had told me about the dinner plans earlier', createdAt: Date.now() - 2000, conversationId: 'parent-456' },
        { id: '6', senderId: 'Sarah', text: 'You\'re right, I should have communicated better', createdAt: Date.now() - 1000, conversationId: 'parent-456' }
      ] as TextMessage[]
    }
  } as const,

  STRUGGLING_ROMANTIC: {
    data: {
      uid: 'test-user-2',
      coachCid: 'coach-789',
      parentCid: 'parent-012',
      displayName: 'Sam Miller',
      username: 'smiller'
    },
    context: {
      stats: { 
        ratio: '1.5',
        horsemen: { criticism: 5, contempt: 3, defensiveness: 4, stonewalling: 2 },
        positive: 15,
        negative: 10,
        neutral: 5,
        totalMessages: 30
      },
      parentMessages: [
        { id: '1', senderId: 'Sam', text: 'You never listen to what I\'m saying', createdAt: Date.now() - 6000, conversationId: 'parent-012' },
        { id: '2', senderId: 'Jordan', text: 'That\'s because you\'re always complaining about something', createdAt: Date.now() - 5000, conversationId: 'parent-012' },
        { id: '3', senderId: 'Sam', text: 'See, this is exactly what I mean - you dismiss everything I say', createdAt: Date.now() - 4000, conversationId: 'parent-012' },
        { id: '4', senderId: 'Jordan', text: 'Whatever, I don\'t have time for this', createdAt: Date.now() - 3000, conversationId: 'parent-012' },
        { id: '5', senderId: 'Sam', text: 'Fine, just walk away like you always do', createdAt: Date.now() - 2000, conversationId: 'parent-012' },
        { id: '6', senderId: 'Jordan', text: 'At least I\'m not constantly nagging', createdAt: Date.now() - 1000, conversationId: 'parent-012' }
      ] as TextMessage[]
    }
  } as const,

  HIGH_CONFLICT_ROMANTIC: {
    data: {
      uid: 'test-user-3',
      coachCid: 'coach-345',
      parentCid: 'parent-678',
      displayName: 'Taylor Brown',
      username: 'tbrown'
    },
    context: {
      stats: { 
        ratio: '0.5',
        horsemen: { criticism: 8, contempt: 6, defensiveness: 7, stonewalling: 5 },
        positive: 5,
        negative: 10,
        neutral: 5,
        totalMessages: 20
      },
      parentMessages: [
        { id: '1', senderId: 'Taylor', text: 'You\'re so selfish, you only think about yourself', createdAt: Date.now() - 10000, conversationId: 'parent-678' },
        { id: '2', senderId: 'Morgan', text: 'Look who\'s talking - you\'re the most self-centered person I know', createdAt: Date.now() - 9000, conversationId: 'parent-678' },
        { id: '3', senderId: 'Taylor', text: 'I can\'t believe I wasted so much time with you', createdAt: Date.now() - 8000, conversationId: 'parent-678' },
        { id: '4', senderId: 'Morgan', text: 'The feeling is mutual', createdAt: Date.now() - 7000, conversationId: 'parent-678' },
        { id: '5', senderId: 'Taylor', text: '[no response for 2 hours]', createdAt: Date.now() - 6000, conversationId: 'parent-678' },
        { id: '6', senderId: 'Morgan', text: 'Typical, running away from problems as usual', createdAt: Date.now() - 1000, conversationId: 'parent-678' }
      ] as TextMessage[]
    }
  } as const,

  SUPERFICIAL_ROMANTIC: {
    data: {
      uid: 'test-user-4',
      coachCid: 'coach-901',
      parentCid: 'parent-234',
      displayName: 'Casey Davis',
      username: 'cdavis'
    },
    context: {
      stats: { 
        ratio: '10.0',
        horsemen: { criticism: 0, contempt: 0, defensiveness: 0, stonewalling: 0 },
        positive: 30,
        negative: 3,
        neutral: 17,
        totalMessages: 50
      },
      parentMessages: [
        { id: '1', senderId: 'Casey', text: 'How was your day?', createdAt: Date.now() - 7000, conversationId: 'parent-234' },
        { id: '2', senderId: 'Riley', text: 'Good, yours?', createdAt: Date.now() - 6000, conversationId: 'parent-234' },
        { id: '3', senderId: 'Casey', text: 'Good too', createdAt: Date.now() - 5000, conversationId: 'parent-234' },
        { id: '4', senderId: 'Riley', text: 'What should we have for dinner?', createdAt: Date.now() - 4000, conversationId: 'parent-234' },
        { id: '5', senderId: 'Casey', text: 'Whatever you want', createdAt: Date.now() - 3000, conversationId: 'parent-234' },
        { id: '6', senderId: 'Riley', text: 'Pizza sounds good', createdAt: Date.now() - 2000, conversationId: 'parent-234' },
        { id: '7', senderId: 'Casey', text: 'Sure, that works', createdAt: Date.now() - 1000, conversationId: 'parent-234' }
      ] as TextMessage[]
    }
  } as const
};

export { mockData };