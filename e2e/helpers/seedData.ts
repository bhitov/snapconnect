import { Page } from '@playwright/test';

/**
 * Seed data helper for E2E tests
 * Creates realistic test data in Firebase emulator for comprehensive testing
 */

export interface TestUser {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  password: string;
}

export interface TestFriendship {
  user1: string;
  user2: string;
  status: 'pending' | 'accepted' | 'blocked';
  requestedBy: string;
  createdAt: string;
}

export interface TestMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'video';
}

export class SeedDataHelper {
  constructor(private page: Page) {}

  /**
   * Create test users directly in Firebase Auth emulator
   */
  async createTestUsers(count: number = 3): Promise<TestUser[]> {
    const users: TestUser[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < count; i++) {
      const user: TestUser = {
        uid: `test-user-${i}-${timestamp}`,
        email: `testuser${i}-${timestamp}@example.com`,
        username: `testuser${i}_${timestamp.toString().slice(-6)}`,
        displayName: `Test User ${i + 1}`,
        password: 'testpassword123',
      };
      users.push(user);
    }

    // Use Firebase Admin SDK functions to create users
    await this.page.evaluate(usersToCreate => {
      // This runs in the browser context where Firebase is available
      return new Promise(async (resolve, reject) => {
        try {
          // Create users via Firebase Auth emulator REST API
          for (const user of usersToCreate) {
            const response = await fetch(
              'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=test-api-key',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: user.email,
                  password: user.password,
                  returnSecureToken: true,
                }),
              }
            );

            const authData = await response.json();
            console.log(
              `Created test user: ${user.email} with UID: ${authData.localId}`
            );

            // Update the UID with the actual Firebase UID
            user.uid = authData.localId;

            // Create user profile in Firestore
            const db = (
              window as unknown as { firebase?: { firestore?: () => any } }
            ).firebase?.firestore?.();
            if (db) {
              await db
                .collection('users')
                .doc(user.uid)
                .set({
                  username: user.username,
                  displayName: user.displayName,
                  email: user.email,
                  bio: `Hello! I'm ${user.displayName}`,
                  photoURL: '',
                  isProfileComplete: true,
                  createdAt: new Date().toISOString(),
                  lastSeen: new Date().toISOString(),
                });
              console.log(`Created profile for user: ${user.username}`);
            }
          }
          resolve(usersToCreate);
        } catch (error) {
          console.error('Error creating test users:', error);
          reject(error);
        }
      });
    }, users);

    return users;
  }

  /**
   * Create friend relationships between test users
   */
  async createFriendships(
    users: TestUser[],
    relationships: {
      user1Index: number;
      user2Index: number;
      status: 'pending' | 'accepted';
    }[]
  ): Promise<void> {
    await this.page.evaluate(
      friendshipData => {
        const { users, relationships } = friendshipData;

        return new Promise(async (resolve, reject) => {
          try {
            const db = (
              window as unknown as { firebase?: { firestore?: () => any } }
            ).firebase?.firestore?.();
            if (!db) {
              throw new Error('Firestore not available');
            }

            for (const rel of relationships) {
              const user1 = users[rel.user1Index];
              const user2 = users[rel.user2Index];
              if (!user1 || !user2) {
                console.error(
                  'Invalid user indices:',
                  rel.user1Index,
                  rel.user2Index
                );
                continue;
              }
              const friendshipId = `${user1.uid}_${user2.uid}`;

              // Create friendship document
              await db.collection('friendships').doc(friendshipId).set({
                user1Id: user1.uid,
                user2Id: user2.uid,
                status: rel.status,
                requestedBy: user1.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });

              // If accepted, create reverse relationship
              if (rel.status === 'accepted') {
                const reverseFriendshipId = `${user2.uid}_${user1.uid}`;
                await db
                  .collection('friendships')
                  .doc(reverseFriendshipId)
                  .set({
                    user1Id: user2.uid,
                    user2Id: user1.uid,
                    status: 'accepted',
                    requestedBy: user1.uid,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  });
              }

              console.log(
                `Created friendship: ${user1?.username} -> ${user2?.username} (${rel.status})`
              );
            }
            resolve(undefined);
          } catch (error) {
            console.error('Error creating friendships:', error);
            reject(error);
          }
        });
      },
      { users, relationships }
    );
  }

  /**
   * Create test chat messages between users
   */
  async createTestMessages(
    users: TestUser[],
    conversations: {
      user1Index: number;
      user2Index: number;
      messages: {
        senderId: number;
        content: string;
        minutesAgo?: number;
      }[];
    }[]
  ): Promise<void> {
    await this.page.evaluate(
      messageData => {
        const { users, conversations } = messageData;

        return new Promise(async (resolve, reject) => {
          try {
            const db = (
              window as unknown as { firebase?: { firestore?: () => any } }
            ).firebase?.firestore?.();
            if (!db) {
              throw new Error('Firestore not available');
            }

            for (const conv of conversations) {
              const user1 = users[conv.user1Index];
              const user2 = users[conv.user2Index];
              if (!user1 || !user2) {
                console.error(
                  'Invalid user indices:',
                  conv.user1Index,
                  conv.user2Index
                );
                continue;
              }
              const chatId = `${[user1.uid, user2.uid].sort().join('_')}`;

              // Create or update chat document
              await db
                .collection('chats')
                .doc(chatId)
                .set({
                  participants: [user1.uid, user2.uid],
                  participantDetails: {
                    [user1.uid]: {
                      displayName: user1.displayName,
                      username: user1.username,
                      photoURL: '',
                    },
                    [user2.uid]: {
                      displayName: user2.displayName,
                      username: user2.username,
                      photoURL: '',
                    },
                  },
                  lastMessage:
                    conv.messages[conv.messages.length - 1]?.content || '',
                  lastMessageTimestamp: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });

              // Create messages
              for (let i = 0; i < conv.messages.length; i++) {
                const msg = conv.messages[i];
                if (!msg) continue;
                const sender = users[msg.senderId];
                if (!sender) {
                  console.error('Invalid sender index:', msg.senderId);
                  continue;
                }
                const timestamp = new Date();

                // Subtract minutes for older messages
                if (msg.minutesAgo) {
                  timestamp.setMinutes(timestamp.getMinutes() - msg.minutesAgo);
                } else {
                  timestamp.setMinutes(
                    timestamp.getMinutes() - (conv.messages.length - i) * 2
                  );
                }

                const messageId = `msg_${chatId}_${i}_${Date.now()}`;

                await db
                  .collection('chats')
                  .doc(chatId)
                  .collection('messages')
                  .doc(messageId)
                  .set({
                    senderId: sender.uid,
                    senderName: sender.displayName,
                    content: msg.content,
                    type: 'text',
                    timestamp: timestamp.toISOString(),
                    createdAt: timestamp.toISOString(),
                    read: false,
                  });
              }

              console.log(
                `Created chat with ${conv.messages.length} messages: ${user1?.username} <-> ${user2?.username}`
              );
            }
            resolve(undefined);
          } catch (error) {
            console.error('Error creating messages:', error);
            reject(error);
          }
        });
      },
      { users, conversations }
    );
  }

  /**
   * Create a realistic social scenario with multiple users, friendships, and conversations
   */
  async createSocialScenario(): Promise<TestUser[]> {
    console.log('🌱 Creating realistic social scenario...');

    // Create 4 test users
    const users = await this.createTestUsers(4);
    console.log(`Created ${users.length} test users`);

    // Create friendships:
    // User 0 and User 1 are friends
    // User 0 has pending request from User 2
    // User 1 and User 3 are friends
    await this.createFriendships(users, [
      { user1Index: 0, user2Index: 1, status: 'accepted' },
      { user1Index: 2, user2Index: 0, status: 'pending' },
      { user1Index: 1, user2Index: 3, status: 'accepted' },
    ]);
    console.log('Created friendship relationships');

    // Create chat conversations with messages
    await this.createTestMessages(users, [
      {
        user1Index: 0,
        user2Index: 1,
        messages: [
          {
            senderId: 0,
            content: 'Hey! How are you doing? 👋',
            minutesAgo: 30,
          },
          {
            senderId: 1,
            content: "Hi there! I'm doing great, thanks for asking!",
            minutesAgo: 28,
          },
          {
            senderId: 0,
            content: "That's awesome! Want to hang out later?",
            minutesAgo: 25,
          },
          {
            senderId: 1,
            content: 'Sure! What did you have in mind? 🤔',
            minutesAgo: 20,
          },
          {
            senderId: 0,
            content: 'Maybe grab some coffee and catch up?',
            minutesAgo: 15,
          },
        ],
      },
      {
        user1Index: 1,
        user2Index: 3,
        messages: [
          {
            senderId: 3,
            content: 'Check out this cool article I found!',
            minutesAgo: 60,
          },
          {
            senderId: 1,
            content: 'Thanks for sharing! Reading it now',
            minutesAgo: 45,
          },
          {
            senderId: 3,
            content: 'Let me know what you think!',
            minutesAgo: 40,
          },
        ],
      },
    ]);
    console.log('Created chat conversations with messages');

    console.log('✅ Social scenario setup complete!');
    return users;
  }

  /**
   * Clean up test data (optional - emulator resets between test runs)
   */
  async cleanup(): Promise<void> {
    await this.page.evaluate(() => {
      console.log('🧹 Cleaning up test data...');
      // Note: Firebase emulator automatically resets between test runs
      // This is mainly for explicit cleanup if needed
    });
  }
}
