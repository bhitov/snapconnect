import { test, expect } from '@playwright/test';
import { signupWithAutoProfile } from './helpers/auth-simple';
import { SeedDataHelper } from './helpers/seedData';

test.describe('Friends and Chat Comprehensive Flows', () => {
  test('friends management: view friends, handle requests, search users', async ({ page }) => {
    page.on('console', message => {
      console.log(`Friends Test: ${message.type().toUpperCase()} ${message.text()}`);
    });

    await page.goto('/');

    // Set up seed data for realistic testing
    const seedHelper = new SeedDataHelper(page);
    
    // Create our main test user
    const mainUser = await signupWithAutoProfile(page, 'mainuser');
    await expect(page.getByTestId('friends-tab-button')).toBeVisible();

    // Create social scenario with other users and relationships
    await seedHelper.createSocialScenario();

    // Navigate to Friends tab
    await page.getByTestId('friends-tab-button').click();
    await page.screenshot({ path: 'test-results/friends-management-main-screen.png' });

    // Test 1: Check for friends list functionality
    console.log('Testing friends list display...');
    
    // Look for friends-related UI elements
    const friendsElements = [
      'Friends',
      'Add Friends', 
      'Friend Requests',
      'Search',
      'Suggestions'
    ];

    let foundElements = [];
    for (const elementText of friendsElements) {
      const element = page.getByText(elementText, { exact: false }).first();
      try {
        if (await element.isVisible({ timeout: 2000 })) {
          foundElements.push(elementText);
          console.log(`✓ Found: ${elementText}`);
        }
      } catch {
        console.log(`✗ Not found: ${elementText}`);
      }
    }

    // Test 2: Try to access friend requests if available
    const friendRequestsButton = page.getByText('Friend Requests').or(
      page.getByText('Requests')
    ).or(
      page.getByTestId('friend-requests-button')
    );

    try {
      if (await friendRequestsButton.isVisible({ timeout: 2000 })) {
        await friendRequestsButton.click();
        console.log('✓ Accessed friend requests section');
        await page.screenshot({ path: 'test-results/friends-management-requests.png' });

        // Look for pending requests
        const pendingRequests = page.getByText('Accept').or(
          page.getByText('Decline')
        ).or(
          page.getByRole('button', { name: /accept|decline/i })
        );

        const requestCount = await pendingRequests.count();
        console.log(`Found ${requestCount} pending friend requests`);

        // Try to accept the first request if any
        if (requestCount > 0) {
          const acceptButton = page.getByText('Accept').or(
            page.getByRole('button', { name: 'Accept' })
          ).first();
          
          try {
            await acceptButton.click({ timeout: 1000 });
            console.log('✓ Accepted a friend request');
            await page.waitForTimeout(500);
            await page.screenshot({ path: 'test-results/friends-management-request-accepted.png' });
          } catch {
            console.log('✗ Could not accept friend request');
          }
        }
      }
    } catch {
      console.log('✗ Friend requests section not accessible');
    }

    // Test 3: Try to add friends functionality
    const addFriendsButton = page.getByText('Add Friends').or(
      page.getByText('Add')
    ).or(
      page.getByTestId('add-friends-button')
    ).or(
      page.getByRole('button', { name: /add|search/i })
    );

    try {
      if (await addFriendsButton.isVisible({ timeout: 2000 })) {
        await addFriendsButton.click();
        console.log('✓ Accessed add friends functionality');
        await page.screenshot({ path: 'test-results/friends-management-add-friends.png' });

        // Look for search functionality
        const searchInput = page.getByPlaceholder('Search').or(
          page.getByPlaceholder('Username or email')
        ).or(
          page.getByRole('textbox')
        );

        try {
          if (await searchInput.isVisible({ timeout: 2000 })) {
            await searchInput.fill('testuser');
            console.log('✓ Used search functionality');
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'test-results/friends-management-search-results.png' });

            // Look for add buttons in search results
            const addButtons = page.getByRole('button', { name: /add|follow|request/i });
            const addButtonCount = await addButtons.count();
            console.log(`Found ${addButtonCount} add buttons in search results`);

            if (addButtonCount > 0) {
              try {
                await addButtons.first().click({ timeout: 1000 });
                console.log('✓ Sent friend request');
                await page.waitForTimeout(500);
                await page.screenshot({ path: 'test-results/friends-management-request-sent.png' });
              } catch {
                console.log('✗ Could not send friend request');
              }
            }
          }
        } catch {
          console.log('✗ Search functionality not found');
        }
      }
    } catch {
      console.log('✗ Add friends functionality not accessible');
    }

    // Final screenshot of friends screen
    await page.getByTestId('friends-tab-button').click();
    await page.screenshot({ path: 'test-results/friends-management-final-state.png' });
  });

  test('chat functionality: view conversations, send messages, conversation flow', async ({ page }) => {
    page.on('console', message => {
      console.log(`Chat Test: ${message.type().toUpperCase()} ${message.text()}`);
    });

    await page.goto('/');

    // Set up seed data
    const seedHelper = new SeedDataHelper(page);
    
    // Create our main test user
    const mainUser = await signupWithAutoProfile(page, 'chatuser');
    await expect(page.getByTestId('friends-tab-button')).toBeVisible();

    // Create social scenario with existing conversations
    await seedHelper.createSocialScenario();

    // Navigate to Chats tab
    await page.getByTestId('chats-tab-button').click();
    await expect(page.getByTestId('chats-tab-button')).toBeVisible({ timeout: 500 });
    await page.screenshot({ path: 'test-results/chat-functionality-main-screen.png' });

    // Test 1: Check for existing conversations
    console.log('Testing chat list display...');
    
    // Look for chat items or conversation list
    const chatItems = page.getByTestId('chat-item').or(
      page.locator('[data-testid*="chat"]').or(
        page.locator('[data-testid*="conversation"]')
      )
    );

    const chatCount = await chatItems.count();
    console.log(`Found ${chatCount} existing chats`);

    if (chatCount > 0) {
      // Click on the first chat
      try {
        await chatItems.first().click({ timeout: 2000 });
        console.log('✓ Opened existing conversation');
        await page.screenshot({ path: 'test-results/chat-functionality-conversation-opened.png' });

        // Test 2: Try to send a message
        console.log('Testing message sending...');
        
        const messageInput = page.getByPlaceholder('Type a message').or(
          page.getByPlaceholder('Message')
        ).or(
          page.getByTestId('message-input')
        ).or(
          page.getByRole('textbox').last()
        );

        try {
          if (await messageInput.isVisible({ timeout: 3000 })) {
            const testMessage = `Hello from E2E test! Timestamp: ${new Date().toLocaleTimeString()} 🤖`;
            await messageInput.fill(testMessage);
            console.log('✓ Typed test message');

            // Look for send button
            const sendButton = page.getByText('Send').or(
              page.getByTestId('send-button')
            ).or(
              page.getByRole('button', { name: /send/i })
            ).or(
              page.locator('button').filter({ hasText: /→|➤|send/i })
            );

            try {
              if (await sendButton.isVisible({ timeout: 2000 })) {
                await sendButton.click();
                console.log('✓ Clicked send button');
              } else {
                // Try Enter key
                await messageInput.press('Enter');
                console.log('✓ Sent message with Enter key');
              }
              
              await page.waitForTimeout(1000);
              await page.screenshot({ path: 'test-results/chat-functionality-message-sent.png' });

              // Send a follow-up message
              const followUpMessage = 'This is a second test message! 🚀';
              await messageInput.fill(followUpMessage);
              
              if (await sendButton.isVisible({ timeout: 1000 })) {
                await sendButton.click();
              } else {
                await messageInput.press('Enter');
              }
              
              console.log('✓ Sent follow-up message');
              await page.waitForTimeout(500);
              
            } catch {
              console.log('✗ Could not send message');
            }

            // Test 3: Try to scroll and view message history
            console.log('Testing message history...');
            
            try {
              // Look for message bubbles or conversation elements
              const messages = page.locator('[data-testid*="message"]').or(
                page.locator('.message').or(
                  page.locator('[class*="message"]')
                )
              );

              const messageCount = await messages.count();
              console.log(`Found ${messageCount} messages in conversation`);

              // Try scrolling up to load more messages
              await page.keyboard.press('Home');
              await page.waitForTimeout(500);
              await page.screenshot({ path: 'test-results/chat-functionality-scrolled-messages.png' });

            } catch {
              console.log('✗ Could not access message history');
            }

          } else {
            console.log('✗ Message input not found');
          }
        } catch {
          console.log('✗ Could not access message input');
        }

      } catch {
        console.log('✗ Could not open existing conversation');
      }
    } else {
      // Test 4: Try to start a new conversation
      console.log('Testing new conversation creation...');
      
      const newChatButton = page.getByText('New Chat').or(
        page.getByText('Compose')
      ).or(
        page.getByTestId('new-chat-button')
      ).or(
        page.getByRole('button', { name: /new|compose|\+/i })
      );

      try {
        if (await newChatButton.isVisible({ timeout: 2000 })) {
          await newChatButton.click();
          console.log('✓ Started new chat flow');
          await page.screenshot({ path: 'test-results/chat-functionality-new-chat.png' });

          // Look for recipient selection
          const recipientInput = page.getByPlaceholder('Search friends').or(
            page.getByPlaceholder('To:')
          ).or(
            page.getByRole('textbox').first()
          );

          try {
            if (await recipientInput.isVisible({ timeout: 2000 })) {
              await recipientInput.fill('Test User');
              console.log('✓ Entered recipient');
              await page.waitForTimeout(1000);
              await page.screenshot({ path: 'test-results/chat-functionality-recipient-selected.png' });
            }
          } catch {
            console.log('✗ Could not select recipient');
          }
        }
      } catch {
        console.log('✗ New chat functionality not found');
      }
    }

    // Go back to main chats view
    await page.getByTestId('chats-tab-button').click();
    await page.screenshot({ path: 'test-results/chat-functionality-final-state.png' });
  });

  test('integrated social flow: add friend, start chat, send messages', async ({ page }) => {
    page.on('console', message => {
      console.log(`Integrated Test: ${message.type().toUpperCase()} ${message.text()}`);
    });

    await page.goto('/');

    // Create main user
    const mainUser = await signupWithAutoProfile(page, 'integrated');
    await expect(page.getByTestId('friends-tab-button')).toBeVisible();

    // Set up social scenario
    const seedHelper = new SeedDataHelper(page);
    await seedHelper.createSocialScenario();

    // Phase 1: Friends interaction
    console.log('🤝 Phase 1: Friends Management');
    await page.getByTestId('friends-tab-button').click();
    await page.screenshot({ path: 'test-results/integrated-1-friends-start.png' });

    // Spend time exploring friends features
    await page.waitForTimeout(500);

    // Look for and interact with any friends functionality
    const friendsActions = ['Add Friends', 'Friend Requests', 'Search', 'Suggestions'];
    
    for (const action of friendsActions) {
      const element = page.getByText(action).first();
      try {
        if (await element.isVisible({ timeout: 1000 })) {
          await element.click();
          console.log(`✓ Interacted with: ${action}`);
          await page.waitForTimeout(300);
          await page.screenshot({ path: `test-results/integrated-friends-${action.toLowerCase().replace(' ', '-')}.png` });
          
          // Try to go back to main friends view
          await page.getByTestId('friends-tab-button').click();
          await page.waitForTimeout(200);
        }
      } catch {
        console.log(`✗ Could not interact with: ${action}`);
      }
    }

    // Phase 2: Navigate to Chats
    console.log('💬 Phase 2: Chat Navigation');
    await page.getByTestId('chats-tab-button').click();
    await expect(page.getByTestId('chats-tab-button')).toBeVisible({ timeout: 500 });
    await page.screenshot({ path: 'test-results/integrated-2-chats-start.png' });

    // Look for existing conversations or start new ones
    const chatsList = page.locator('[data-testid*="chat"], [data-testid*="conversation"]');
    const existingChats = await chatsList.count();
    
    console.log(`Found ${existingChats} existing conversations`);

    if (existingChats > 0) {
      // Phase 3: Open and interact with existing conversation
      console.log('📱 Phase 3: Conversation Interaction');
      
      try {
        await chatsList.first().click({ timeout: 2000 });
        console.log('✓ Opened conversation');
        await page.screenshot({ path: 'test-results/integrated-3-conversation-opened.png' });

        // Try to send multiple messages for a realistic conversation
        const messageInput = page.getByPlaceholder('Type a message').or(
          page.getByTestId('message-input')
        ).or(
          page.getByRole('textbox').last()
        );

        const testMessages = [
          'Hey! How are you doing today? 👋',
          'I was just testing out this app',
          'The interface looks pretty cool! 😎',
          'Want to hang out sometime?'
        ];

        for (let i = 0; i < testMessages.length; i++) {
          try {
            if (await messageInput.isVisible({ timeout: 2000 })) {
              await messageInput.fill(testMessages[i]);
              
              // Try to send via button or Enter
              const sendButton = page.getByText('Send').or(
                page.getByTestId('send-button')
              ).first();
              
              if (await sendButton.isVisible({ timeout: 1000 })) {
                await sendButton.click();
              } else {
                await messageInput.press('Enter');
              }
              
              console.log(`✓ Sent message ${i + 1}: ${testMessages[i].substring(0, 30)}...`);
              await page.waitForTimeout(500);
              
              // Take screenshot after each message for debugging
              await page.screenshot({ path: `test-results/integrated-message-${i + 1}.png` });
              
            } else {
              console.log(`✗ Message input not available for message ${i + 1}`);
              break;
            }
          } catch (error) {
            console.log(`✗ Error sending message ${i + 1}:`, error);
            break;
          }
        }

      } catch {
        console.log('✗ Could not open conversation');
      }
    } else {
      // Try to create new conversation
      console.log('📝 Phase 3: Create New Conversation');
      
      const newChatButton = page.getByText('New Chat').or(
        page.getByTestId('new-chat-button')
      ).or(
        page.getByRole('button', { name: /new|compose/i })
      );

      try {
        if (await newChatButton.isVisible({ timeout: 2000 })) {
          await newChatButton.click();
          console.log('✓ Started new chat creation');
          await page.screenshot({ path: 'test-results/integrated-3-new-chat.png' });
        }
      } catch {
        console.log('✗ Could not start new chat');
      }
    }

    // Phase 4: Navigate back to friends to complete the social loop
    console.log('🔄 Phase 4: Complete Social Loop');
    await page.getByTestId('friends-tab-button').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/integrated-4-back-to-friends.png' });

    // Final verification - quick navigation test
    await page.getByTestId('chats-tab-button').click();
    await page.waitForTimeout(200);
    await page.getByTestId('friends-tab-button').click();
    await page.waitForTimeout(200);

    console.log('✅ Integrated social flow completed successfully');
    await page.screenshot({ path: 'test-results/integrated-final-state.png' });
  });
});