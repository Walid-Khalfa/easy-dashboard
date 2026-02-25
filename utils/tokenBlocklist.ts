import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getRedisClient, isRedisConnected } from './redis';

const TOKEN_PREFIX = 'blocked_token:';

// In-memory fallback for development/when Redis is unavailable
// Uses Map with expiry timestamps for proper TTL handling
const memoryBlocklist = new Map<string, number>(); // hash -> expiry timestamp

/**
 * Hashes a token for storage (reduces memory usage and prevents token exposure in logs)
 */
const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Adds a token to the blocklist
 * Uses Redis if available, otherwise falls back to in-memory storage
 */
// Default expiry time in seconds when unable to determine from token
const DEFAULT_EXPIRY_SECONDS = 3600; // 1 hour

export const addToBlocklist = async (token: string, expiresInSeconds?: number): Promise<void> => {
  let expiry = expiresInSeconds;

  // Try to get expiry from token if not provided
  if (!expiry) {
    try {
      const decoded = jwt.decode(token) as { exp?: number } | null;
      if (decoded?.exp) {
        const now = Math.floor(Date.now() / 1000);
        expiry = decoded.exp - now;
        if (expiry <= 0) {
          // Token already expired, no need to block
          return;
        }
      }
    } catch {
      // If we can't decode, use default expiry
      expiry = DEFAULT_EXPIRY_SECONDS;
    }
  }

  // Ensure we always have a valid expiry value
  if (!expiry || expiry <= 0) {
    expiry = DEFAULT_EXPIRY_SECONDS;
  }

  const tokenHash = hashToken(token);

  // Use Redis if connected
  if (isRedisConnected()) {
    try {
      const client = getRedisClient();
      if (client) {
        const key = `${TOKEN_PREFIX}${tokenHash}`;
        await client.setEx(key, expiry, '1');
        return;
      }
    } catch (err) {
      console.error('Redis error, falling back to memory:', err);
    }
  }

  // Fallback to in-memory with proper TTL tracking
  // Check capacity before adding to prevent unbounded growth
  ensureMemoryCapacity();
  const expiryTimestamp = Date.now() + (expiry * 1000);
  memoryBlocklist.set(tokenHash, expiryTimestamp);
};

/**
 * Checks if a token is in the blocklist
 */
export const isTokenBlocked = async (token: string): Promise<boolean> => {
  const tokenHash = hashToken(token);
  
  // Check Redis first if connected
  if (isRedisConnected()) {
    try {
      const client = getRedisClient();
      if (client) {
        const key = `${TOKEN_PREFIX}${tokenHash}`;
        const result = await client.get(key);
        return result !== null;
      }
    } catch (err) {
      console.error('Redis error, checking memory fallback:', err);
    }
  }

  // Fallback to in-memory
  const expiry = memoryBlocklist.get(tokenHash);
  if (!expiry) {
    return false;
  }
  
  // Check if token has expired in memory
  if (Date.now() > expiry) {
    memoryBlocklist.delete(tokenHash);
    return false;
  }
  
  return true;
};

/**
 * Removes a token from the blocklist
 */
export const removeFromBlocklist = async (token: string): Promise<void> => {
  const tokenHash = hashToken(token);
  
  // Remove from Redis if connected
  if (isRedisConnected()) {
    try {
      const client = getRedisClient();
      if (client) {
        const key = `${TOKEN_PREFIX}${tokenHash}`;
        await client.del(key);
      }
    } catch (err) {
      console.error('Redis error:', err);
    }
  }

  // Also remove from memory fallback
  memoryBlocklist.delete(tokenHash);
};

// Maximum size for in-memory blocklist before forced cleanup
const MAX_MEMORY_SIZE = 10000;

/**
 * Cleans up expired tokens from in-memory blocklist
 * (Redis handles this automatically with TTL)
 */
export const cleanMemoryBlocklist = (): void => {
  const now = Date.now();
  for (const [hash, expiry] of memoryBlocklist.entries()) {
    if (expiry < now) {
      memoryBlocklist.delete(hash);
    }
  }
};

/**
 * Checks if memory blocklist needs cleanup and performs it if necessary
 * Call this before adding new entries to prevent unbounded growth
 */
const ensureMemoryCapacity = (): void => {
  if (memoryBlocklist.size > MAX_MEMORY_SIZE) {
    cleanMemoryBlocklist();
  }
};

// Run cleanup every 10 minutes for memory fallback (more frequent to prevent unbounded growth)
setInterval(cleanMemoryBlocklist, 10 * 60 * 1000);
