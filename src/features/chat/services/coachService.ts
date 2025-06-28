/**
 * @file coachService.ts
 * @description Service for interacting with AI relationship coach functionality.
 * Provides methods to start coach chats, send messages, and analyze conversations.
 */

import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
const functions = getFunctions();

/**
 * Start a new coach chat for a given parent conversation
 * @param parentCid - The parent conversation ID
 * @returns Promise with the coach chat conversation ID
 */
export async function startCoachChat(parentCid: string): Promise<string> {
  try {
    const startCoachChatFn = httpsCallable<
      { parentCid: string },
      { coachCid: string }
    >(functions, 'startCoachChat');

    const result = await startCoachChatFn({ parentCid });
    return result.data.coachCid;
  } catch (error) {
    console.error('Failed to start coach chat:', error);
    throw new Error('Failed to start coach chat');
  }
}

/**
 * Send a message to the coach and get a response
 * @param coachCid - The coach chat conversation ID
 * @param parentCid - The parent conversation ID
 * @param userText - The user's message text
 */
export async function sendCoachMessage(
  coachCid: string,
  parentCid: string,
  userText: string
): Promise<void> {
  try {
    const coachReplyFn = httpsCallable<
      { coachCid: string; parentCid: string; userText: string },
      void
    >(functions, 'coachReply');

    await coachReplyFn({ coachCid, parentCid, userText });
  } catch (error) {
    console.error('Failed to send coach message:', error);
    throw new Error('Failed to send coach message');
  }
}

/**
 * Request the coach to analyze the parent conversation
 * @param coachCid - The coach chat conversation ID
 * @param parentCid - The parent conversation ID
 * @param messageCount - Number of messages to analyze (default: 30)
 */
export async function analyzeChat(
  coachCid: string,
  parentCid: string,
  messageCount: number = 30
): Promise<void> {
  try {
    const coachAnalyzeFn = httpsCallable<
      { coachCid: string; parentCid: string; n: number },
      void
    >(functions, 'coachAnalyze');

    await coachAnalyzeFn({ coachCid, parentCid, n: messageCount });
  } catch (error) {
    console.error('Failed to analyze chat:', error);
    throw new Error('Failed to analyze chat');
  }
}

/**
 * Request positive/negative ratio analysis
 * @param coachCid - The coach chat conversation ID
 * @param parentCid - The parent conversation ID
 */
export async function analyzeRatio(
  coachCid: string,
  parentCid: string
): Promise<void> {
  try {
    const coachRatioFn = httpsCallable<
      { coachCid: string; parentCid: string },
      void
    >(functions, 'coachRatio');

    await coachRatioFn({ coachCid, parentCid });
  } catch (error) {
    console.error('Failed to analyze ratio:', error);
    throw new Error('Failed to analyze ratio');
  }
}

/**
 * Request Four Horsemen analysis
 * @param coachCid - The coach chat conversation ID
 * @param parentCid - The parent conversation ID
 */
export async function analyzeHorsemen(
  coachCid: string,
  parentCid: string
): Promise<void> {
  try {
    const coachHorsemenFn = httpsCallable<
      { coachCid: string; parentCid: string },
      void
    >(functions, 'coachHorsemen');

    await coachHorsemenFn({ coachCid, parentCid });
  } catch (error) {
    console.error('Failed to analyze horsemen:', error);
    throw new Error('Failed to analyze horsemen');
  }
}

/**
 * Request Love Map question generation
 * @param coachCid - The coach chat conversation ID
 * @param parentCid - The parent conversation ID
 */
export async function generateLoveMap(
  coachCid: string,
  parentCid: string
): Promise<void> {
  try {
    const coachLoveMapFn = httpsCallable<
      { coachCid: string; parentCid: string },
      void
    >(functions, 'coachLoveMap');

    await coachLoveMapFn({ coachCid, parentCid });
  } catch (error) {
    console.error('Failed to generate love map:', error);
    throw new Error('Failed to generate love map');
  }
}
