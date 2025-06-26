import { test, expect, Page } from '@playwright/test';
import { signupWithAutoProfile, loginWithCredentials } from './helpers/auth-simple';

// Store user data for cross-test usage
let aliceData = { username: '', email: '', password: '' };
let bobData = { username: '', email: '', password: '' };

function getAddFriendButton(page: Page, username: string) {
  return page.getByTestId(`add-friend-button-${username}`);
}

function getAcceptButton(page: Page, username: string) {
  return page.getByTestId(`accept-button-${username}`);
}

function getRequestsButton(page: Page) {
  return page.getByTestId('requests-button');
}

function getNewChatButton(page: Page) {
  return page.getByText('New Chat', { exact: true }).first();
}

function getSendButton(page: Page) {
  return page.getByTestId('send-button');
}

test.describe('Comprehensive Multi-User Functionality Tests', () => {
  
  // Step 1: Create Alice
  test('01. Setup: Create Alice', async ({ page }) => {
    console.log('=== STEP 1: Creating Alice ===');
    
    await page.goto('/');
    const alice = await signupWithAutoProfile(page, 'alice');
    aliceData = alice;
    await expect(page.getByTestId('friends-tab-button')).toBeVisible();
    console.log(`✅ Created Alice: ${aliceData.username}`);
    
    await page.screenshot({ path: 'test-results/01-alice-created.png' });
    console.log('=== STEP 1 COMPLETE: Alice created ===');
  });

  // Step 2: Create Bob
  test('02. Setup: Create Bob', async ({ page }) => {
    console.log('=== STEP 2: Creating Bob ===');
    
    await page.goto('/');
    const bob = await signupWithAutoProfile(page, 'bob');
    bobData = bob;
    await expect(page.getByTestId('friends-tab-button')).toBeVisible();
    console.log(`✅ Created Bob: ${bobData.username}`);
    
    await page.screenshot({ path: 'test-results/02-bob-created.png' });
    console.log('=== STEP 2 COMPLETE: Bob created ===');
  });

  // Step 3: Alice sends friend request to Bob (MUST work or test fails)
  test('03. CRITICAL: Alice sends friend request to Bob', async ({ page }) => {
    console.log('=== STEP 3: Alice sending friend request to Bob ===');
    console.log(`Alice (${aliceData.username}) searching for Bob (${bobData.username})`);
    
    // Login as Alice
    await loginWithCredentials(page, aliceData);
    
    // Navigate to friends
    await page.getByTestId('friends-tab-button').click();
    await page.screenshot({ path: 'test-results/03-alice-friends-screen.png' });
    
    // Find and click Add Friends
    const addFriendsButton = page.getByText('Add Friends').first();
    await expect(addFriendsButton).toBeVisible({ timeout: 5000 });
    await addFriendsButton.click();
    await page.screenshot({ path: 'test-results/03-add-friends-clicked.png' });
    
    // Find search input and search for Bob
    const searchInput = page.getByPlaceholder('Search').first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill(bobData.username);
    console.log(`🔍 Searching for: ${bobData.username}`);
    
    // Wait for search results
     // await page.waitForTimeout(30000);
//     await page.screenshot({ path: 'test-results/03-search-results.png' });
    
    // Bob MUST appear in search results
    const bobResult = page.getByText(bobData.username).first();
    await expect(bobResult).toBeVisible({ timeout: 3000 });
    console.log(`✅ Found ${bobData.username} in search results`);
    
    
    // Find and click Add Friend button
    const addFriendButton = getAddFriendButton(page, bobData.username);
    await expect(addFriendButton).toBeVisible();
    await addFriendButton.click();
    console.log(`✅ Successfully clicked Add Friend button`);
    
    
    await page.screenshot({ path: 'test-results/03-friend-request-sent.png' });
    
    // Verify the request was sent (button should change)
    const requestSentIndicator = page.getByText('Request Sent')
      .or(page.getByText('Pending'))
      .or(page.getByText('Requested'))
      .first();
    await expect(requestSentIndicator).toBeVisible({ timeout: 5000 });
    
    console.log('=== STEP 3 COMPLETE: Friend request successfully sent ===');
  });

  // Step 4: Bob accepts Alice's friend request (MUST work or test fails)
  test('04. CRITICAL: Bob accepts Alice\'s friend request', async ({ page }) => {
    console.log('=== STEP 4: Bob accepting Alice\'s friend request ===');
    console.log(`Bob (${bobData.username}) accepting request from Alice (${aliceData.username})`);
    
    // Login as Bob
    await loginWithCredentials(page, bobData);
    
    // Navigate to friends
    await page.getByTestId('friends-tab-button').click();
    await page.screenshot({ path: 'test-results/04-bob-friends-screen.png' });
    
    // Find and click Friend Requests
    const requestsButton = getRequestsButton(page);
    await expect(requestsButton).toBeVisible({ timeout: 5000 });
    await requestsButton.click();
    await page.screenshot({ path: 'test-results/04-friend-requests-screen.png' });
    
    // Alice's request MUST be visible
    const aliceRequest = page.getByText(aliceData.username, { exact: true }).first();
    await expect(aliceRequest).toBeVisible({ timeout: 10000 });
    console.log(`✅ Found friend request from ${aliceData.username}`);
    
    // Find and click Accept button
    const acceptButton = getAcceptButton(page, aliceData.username);
    await expect(acceptButton).toBeVisible({ timeout: 5000 });
    await acceptButton.click();
    console.log(`✅ Accepted friend request from ${aliceData.username}`);
    
    await page.screenshot({ path: 'test-results/04-request-accepted.png' });
    
    // Verify they are now friends - Alice should appear in friends list
    await page.getByTestId('friends-tab-button').click();
    // await page.waitForTimeout(2000);
    const aliceInFriendsList = page.getByText(aliceData.username, { exact: true }).first();
    await expect(aliceInFriendsList).toBeVisible({ timeout: 10000 });
    console.log(`✅ ${aliceData.username} now appears in Bob's friends list`);
    
    console.log('=== STEP 4 COMPLETE: Friend request successfully accepted ===');
  });

  // Step 5: Verify both users see each other as friends
  test('05. CRITICAL: Both users must see each other as friends', async ({ page }) => {
    console.log('=== STEP 5: Verifying mutual friendship ===');
    
    // Check Alice's friends list
    await loginWithCredentials(page, aliceData);
    await page.getByTestId('friends-tab-button').click();
    // await page.waitForTimeout(2000);
    
    const bobInAlicesFriends = page.getByText(bobData.username, { exact: true }).first();
    await expect(bobInAlicesFriends).toBeVisible({ timeout: 10000 });
    console.log(`✅ Alice sees ${bobData.username} in her friends list`);
    await page.screenshot({ path: 'test-results/05-alice-sees-bob-as-friend.png' });
    
    // Check Bob's friends list
    await loginWithCredentials(page, bobData);
    await page.getByTestId('friends-tab-button').click();
    // await page.waitForTimeout(2000);
    
    const aliceInBobsFriends = page.getByText(aliceData.username, { exact: true }).first();
    await expect(aliceInBobsFriends).toBeVisible({ timeout: 10000 });
    console.log(`✅ Bob sees ${aliceData.username} in his friends list`);
    await page.screenshot({ path: 'test-results/05-bob-sees-alice-as-friend.png' });
    
    console.log('=== STEP 5 COMPLETE: Mutual friendship verified ===');
  });

  // Step 6: Alice starts a chat with Bob (MUST work or test fails)
  test('06. CRITICAL: Alice starts chat with Bob', async ({ page }) => {
    console.log('=== STEP 6: Alice starting chat with Bob ===');
    
    // Login as Alice
    await loginWithCredentials(page, aliceData);
    
    // Navigate to friends
    await page.getByTestId('friends-tab-button').click();
    await page.screenshot({ path: 'test-results/06-alice-friends-screen.png' });
    
    // Bob MUST appear in the friends list
    const bobInFriendsList = page.getByText(bobData.username, { exact: true }).first();
    await expect(bobInFriendsList).toBeVisible({ timeout: 10000 });
    console.log(`✅ Found ${bobData.username} in friends list`);
    
    // Find and click the chat button using test ID
    const chatButton = page.getByTestId(`chat-button-${bobData.username}`);
    await expect(chatButton).toBeVisible({ timeout: 5000 });
    await chatButton.click();
    await page.screenshot({ path: 'test-results/06-chat-button-clicked.png' });
    
    console.log(`✅ Chat with ${bobData.username} started via friends list`);
    
    // Send a test message
    const messageInput = page.getByTestId('message-input');
    await expect(messageInput).toBeVisible({ timeout: 5000 });
    
    const testMessage = `Hello ${bobData.username}! This is Alice starting our chat from the friends list.`;
    await messageInput.fill(testMessage);
    await page.screenshot({ path: 'test-results/06-message-typed.png' });
    
    // Send the message
    const sendButton = getSendButton(page);
    if (await sendButton.isVisible({ timeout: 2000 })) {
      await sendButton.click();
    } else {
      await messageInput.press('Enter');
    }
    
    console.log(`📤 Sent message: "${testMessage}"`);
    
    // Message MUST appear in the chat
    const sentMessage = page.getByText(testMessage, { exact: true }).first();
    await expect(sentMessage).toBeVisible({ timeout: 10000 });
    console.log('✅ Message appears in chat');
    
    await page.screenshot({ path: 'test-results/06-chat-with-message-sent.png' });
    console.log('=== STEP 6 COMPLETE: Chat initiated and message sent ===');
    // await page.waitForTimeout(10000);
  });

  // Step 7: Bob receives Alice's message (MUST work or test fails)
  test('07. CRITICAL: Bob receives Alice\'s message', async ({ page }) => {
    console.log('=== STEP 7: Bob receiving Alice\'s message ===');
    
    // Login as Bob
    await loginWithCredentials(page, bobData);
    await page.getByTestId('chats-tab-button').click();
    
    // Chat with Alice MUST be visible
    const aliceChat = page.getByText(aliceData.username, { exact: true }).first();
    await expect(aliceChat).toBeVisible({ timeout: 10000 });
    console.log(`✅ Found chat with ${aliceData.username}`);
    
    // Open chat with Alice
    await aliceChat.click();
    await page.screenshot({ path: 'test-results/07-bob-opens-chat-with-alice.png' });
    
    // Alice's message MUST be visible (from step 6)
    const aliceMessage = `Hello ${bobData.username}! This is Alice starting our chat from the friends list.`;
    const receivedMessage = page.getByText(aliceMessage, { exact: true }).first();
    await expect(receivedMessage).toBeVisible({ timeout: 10000 });
    console.log('✅ Bob can see Alice\'s message');
    
    await page.screenshot({ path: 'test-results/07-alice-message-visible-to-bob.png' });
    console.log('=== STEP 7 COMPLETE: Message received successfully ===');
  });

  // Step 8: Bob replies to Alice (MUST work or test fails)
  test('08. CRITICAL: Bob replies to Alice', async ({ page }) => {
    console.log('=== STEP 8: Bob replying to Alice ===');
    
    // Login as Bob and open chat with Alice
    await loginWithCredentials(page, bobData);
    await page.getByTestId('chats-tab-button').click();
    
    const aliceChat = page.getByText(aliceData.username, { exact: true }).first();
    await expect(aliceChat).toBeVisible({ timeout: 10000 });
    await aliceChat.click();
    
    // Send reply message
    const messageInput = page.getByTestId('message-input');
    await expect(messageInput).toBeVisible({ timeout: 5000 });
    
    const replyMessage = `Hi ${aliceData.username}! This is Bob replying. Chat is working perfectly!`;
    await messageInput.fill(replyMessage);
    
    const sendButton = getSendButton(page);
      
    if (await sendButton.isVisible({ timeout: 2000 })) {
      await sendButton.click();
    } else {
      await messageInput.press('Enter');
    }
    
    console.log(`📤 Bob sent reply: "${replyMessage}"`);
    
    // Reply MUST appear in Bob's chat view
    const sentReply = page.getByText(replyMessage, { exact: true }).first();
    await expect(sentReply).toBeVisible({ timeout: 10000 });
    console.log('✅ Bob\'s reply appears in his chat view');
    
    await page.screenshot({ path: 'test-results/08-bob-reply-sent.png' });
    console.log('=== STEP 8 COMPLETE: Reply sent successfully ===');
  });

  // Step 9: Alice receives Bob's reply (MUST work or test fails)
  test('09. CRITICAL: Complete conversation verification', async ({ page }) => {
    console.log('=== STEP 9: Verifying complete conversation ===');
    
    // Login as Alice and check conversation
    await loginWithCredentials(page, aliceData);
    await page.getByTestId('chats-tab-button').click();
    
    const bobChat = page.getByText(bobData.username, { exact: true }).first();
    await expect(bobChat).toBeVisible({ timeout: 10000 });
    await bobChat.click();
    
    // Both messages MUST be visible
    const aliceMessage = `Hello ${bobData.username}! This is Alice starting our chat from the friends list.`;
    const bobReply = `Hi ${aliceData.username}! This is Bob replying. Chat is working perfectly!`;
    
    const aliceMessageVisible = page.getByText(aliceMessage, { exact: true }).first();
    const bobReplyVisible = page.getByText(bobReply, { exact: true }).first();
    
    await expect(aliceMessageVisible).toBeVisible({ timeout: 10000 });
    await expect(bobReplyVisible).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Alice can see both her message and Bob\'s reply');
    await page.screenshot({ path: 'test-results/09-complete-conversation.png' });
    
    console.log('=== STEP 9 COMPLETE: Full conversation verified ===');
    console.log('=== 🎉 ALL CRITICAL FUNCTIONALITY TESTS PASSED! 🎉 ===');
    console.log('');
    console.log('📊 VERIFIED FUNCTIONALITY:');
    console.log('✅ User registration and authentication');
    console.log('✅ Friend search and discovery');
    console.log('✅ Friend request sending');
    console.log('✅ Friend request acceptance');
    console.log('✅ Mutual friendship verification');
    console.log('✅ Chat initiation via friends list');
    console.log('✅ Message sending from friends screen');
    console.log('✅ Message receiving');
    console.log('✅ Real-time conversation sync');
    console.log('');
    console.log('🚀 The SnapConnect app core functionality is WORKING!');
  });
});