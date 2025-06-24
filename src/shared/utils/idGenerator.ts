/**
 * @file idGenerator.ts
 * @description Simple utility for generating unique IDs without external dependencies.
 * Creates reasonably unique IDs for app usage (not cryptographically secure).
 */

/**
 * Generate a simple unique ID
 * Format: timestamp + random string (e.g., "1703123456789_abc123def")
 * 
 * @returns {string} A reasonably unique ID string
 * 
 * @example
 * ```typescript
 * const id = generateId();
 * console.log(id); // "1703123456789_abc123def"
 * ```
 */
export function generateId(): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${randomPart}`;
}

/**
 * Generate a shorter ID for when full uniqueness isn't critical
 * Format: random string only (e.g., "abc123def456")
 * 
 * @returns {string} A shorter random ID string
 * 
 * @example
 * ```typescript
 * const shortId = generateShortId();
 * console.log(shortId); // "abc123def456"
 * ```
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Generate a UUID-like string (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
 * Not RFC compliant but visually similar to UUIDs
 * 
 * @returns {string} A UUID-like string
 * 
 * @example
 * ```typescript
 * const uuidLike = generateUuidLike();
 * console.log(uuidLike); // "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 * ```
 */
export function generateUuidLike(): string {
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  const segment = (length: number) => Array.from({ length }, hex).join('');
  
  return [
    segment(8),
    segment(4),
    segment(4),
    segment(4),
    segment(12)
  ].join('-');
} 