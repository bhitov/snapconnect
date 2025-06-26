import { Page, expect } from '@playwright/test';
import { storeUser, getStoredUser, StoredUser } from './user-storage';

export async function createUser(page: Page, userKey: string, baseUsername: string): Promise<StoredUser> {
  const timestamp = Date.now();
  const user: StoredUser = {
    email: `${baseUsername}${timestamp}@test.com`,
    password: 'testpass123',
    username: `${baseUsername}${timestamp}`
  };

  await page.goto('/');
  
  // Navigate to registration
  const signupButton = page.getByText('Sign Up').or(page.getByTestId('signup-button'));
  if (await signupButton.isVisible({ timeout: 3000 })) {
    await signupButton.click();
  }

  // Fill registration form using test IDs to avoid ambiguity
  await page.getByTestId('email-input').fill(user.email);
  await page.getByTestId('password-input').fill(user.password);
  
  const submitButton = page.getByRole('button', { name: 'Sign Up' })
    .or(page.getByRole('button', { name: 'Register' }))
    .or(page.getByTestId('register-submit'));
    
  await submitButton.click();

  // Complete profile setup if needed
  try {
    const profileSetupTitle = page.getByText('Complete Your Profile').or(page.getByText('Profile Setup'));
    if (await profileSetupTitle.isVisible({ timeout: 3000 })) {
      await page.getByPlaceholder('Display Name').fill(user.username);
      
      const completeButton = page.getByRole('button', { name: 'Complete Profile' })
        .or(page.getByRole('button', { name: 'Save' }))
        .or(page.getByTestId('complete-profile'));
        
      await completeButton.click();
    }
  } catch {
    // Profile setup might be automatic
  }

  // Wait for successful signup
  await expect(page.getByTestId('friends-tab-button')).toBeVisible({ timeout: 10000 });
  
  // Store user for later tests
  storeUser(userKey, user);
  console.log(`Created user: ${userKey} -> ${user.username}`);
  
  return user;
}

export async function loginUser(page: Page, userKey: string): Promise<StoredUser> {
  const user = getStoredUser(userKey);
  if (!user) {
    throw new Error(`User ${userKey} not found. Make sure to create the user first.`);
  }

  await page.goto('/');
  
  // Wait for auth state to settle
  await page.waitForTimeout(1000);
  
  // Check if already on login screen or need to navigate
  try {
    const loginButton = page.getByText('Login').or(page.getByTestId('login-button'));
    if (await loginButton.isVisible({ timeout: 2000 })) {
      await loginButton.click();
    }
  } catch {
    // Already on login screen or different flow
  }

  // Fill login form using test IDs to avoid ambiguity
  await page.getByTestId('email-input').fill(user.email);
  await page.getByTestId('password-input').fill(user.password);
  
  // Submit login
  const submitButton = page.getByRole('button', { name: 'Sign In' })
    .or(page.getByRole('button', { name: 'Login' }))
    .or(page.getByTestId('login-submit'));
  
  await submitButton.click();
  
  // Wait for successful login
  await expect(page.getByTestId('friends-tab-button')).toBeVisible({ timeout: 10000 });
  
  console.log(`Logged in user: ${user.username}`);
  return user;
}

export async function sendFriendRequest(page: Page, targetUsername: string): Promise<boolean> {
  // Navigate to friends tab
  await page.getByTestId('friends-tab-button').click();
  
  // Look for Add Friends functionality
  const addFriendsButton = page.getByText('Add Friends').first();
  if (await addFriendsButton.isVisible({ timeout: 3000 })) {
    await addFriendsButton.click();
    
    // Look for search functionality
    const searchInput = page.getByPlaceholder('Search').first();
    if (await searchInput.isVisible({ timeout: 2000 })) {
      // Search for the target user
      await searchInput.fill(targetUsername);
      await page.waitForTimeout(1000); // Wait for search results
      
      // Look for the user in search results and send friend request
      const userResult = page.getByText(targetUsername).first();
      if (await userResult.isVisible({ timeout: 2000 })) {
        await userResult.click();
        
        // Look for friend request button
        const addButton = page.getByText('Add Friend')
          .or(page.getByText('Send Request'))
          .or(page.getByText('Add'))
          .first();
          
        if (await addButton.isVisible({ timeout: 2000 })) {
          await addButton.click();
          console.log(`Sent friend request to ${targetUsername}`);
          return true;
        }
      }
    }
  }
  
  console.log(`Failed to send friend request to ${targetUsername}`);
  return false;
}

export async function acceptFriendRequest(page: Page, fromUsername: string): Promise<boolean> {
  // Navigate to friends tab
  await page.getByTestId('friends-tab-button').click();
  
  // Look for friend requests section
  const requestsButton = page.getByText('Requests')
    .or(page.getByText('Friend Requests'))
    .or(page.getByTestId('friend-requests'))
    .first();
    
  if (await requestsButton.isVisible({ timeout: 3000 })) {
    await requestsButton.click();
    
    // Look for the specific friend request
    const requestFromUser = page.getByText(fromUsername).first();
    if (await requestFromUser.isVisible({ timeout: 2000 })) {
      // Look for accept button near the request
      const acceptButton = page.getByText('Accept')
        .or(page.getByText('Confirm'))
        .or(page.getByTestId('accept-request'))
        .first();
        
      if (await acceptButton.isVisible({ timeout: 2000 })) {
        await acceptButton.click();
        console.log(`Accepted friend request from ${fromUsername}`);
        return true;
      }
    }
  }
  
  console.log(`Failed to accept friend request from ${fromUsername}`);
  return false;
}

export async function startChatWithFriend(page: Page, friendUsername: string): Promise<boolean> {
  // Navigate to chats tab
  await page.getByTestId('chats-tab-button').click();
  
  // Look for new chat functionality
  const newChatButton = page.getByText('New Chat')
    .or(page.getByText('Start Chat'))
    .or(page.getByText('+'))
    .or(page.getByTestId('new-chat'))
    .first();
    
  if (await newChatButton.isVisible({ timeout: 3000 })) {
    await newChatButton.click();
    
    // Look for friend in the list or search
    const friendOption = page.getByText(friendUsername).first();
    if (await friendOption.isVisible({ timeout: 2000 })) {
      await friendOption.click();
      console.log(`Started chat with ${friendUsername}`);
      return true;
    }
  }
  
  // Alternative: try accessing existing chat
  const existingChat = page.getByText(friendUsername).first();
  if (await existingChat.isVisible({ timeout: 2000 })) {
    await existingChat.click();
    console.log(`Opened existing chat with ${friendUsername}`);
    return true;
  }
  
  console.log(`Failed to start chat with ${friendUsername}`);
  return false;
}

export async function sendMessage(page: Page, message: string): Promise<boolean> {
  // Look for message input
  const messageInput = page.getByPlaceholder('Type a message')
    .or(page.getByPlaceholder('Message'))
    .or(page.getByTestId('message-input'))
    .first();
    
  if (await messageInput.isVisible({ timeout: 3000 })) {
    await messageInput.fill(message);
    
    // Look for send button
    const sendButton = page.getByText('Send')
      .or(page.getByTestId('send-button'))
      .or(page.getByRole('button', { name: 'Send' }))
      .first();
      
    if (await sendButton.isVisible({ timeout: 2000 })) {
      await sendButton.click();
      console.log(`Sent message: ${message}`);
      return true;
    }
    
    // Try pressing Enter if no send button
    await messageInput.press('Enter');
    console.log(`Sent message via Enter: ${message}`);
    return true;
  }
  
  console.log(`Failed to send message: ${message}`);
  return false;
}

export async function verifyMessageExists(page: Page, message: string): Promise<boolean> {
  const messageElement = page.getByText(message).first();
  const exists = await messageElement.isVisible({ timeout: 3000 });
  
  if (exists) {
    console.log(`✅ Message found: ${message}`);
  } else {
    console.log(`❌ Message not found: ${message}`);
  }
  
  return exists;
}