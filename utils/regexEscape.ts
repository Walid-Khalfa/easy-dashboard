/**
 * Escapes special regex characters in a string
 * Prevents Regex DoS attacks when using user input in RegExp
 * 
 * @param str - The string to escape
 * @returns The escaped string safe for use in RegExp
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Creates a safe RegExp from user input
 * 
 * @param input - User input string
 * @param flags - RegExp flags (default: 'i' for case-insensitive)
 * @returns A RegExp object with escaped special characters
 */
export const createSafeRegex = (input: string, flags: string = 'i'): RegExp => {
  return new RegExp(escapeRegex(input), flags);
};
