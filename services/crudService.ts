import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';
import { escapeRegex } from '../utils/regexEscape';
import { getRedisClient, isRedisConnected } from '../utils/redis';

// Configuration
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const CACHE_TTL_SECONDS = 60; // 1 minute cache for list queries
const SEARCH_LIMIT = 10;

export interface PaginationResult {
  page: number;
  pages: number;
  count: number;
  limit: number;
}

export interface ListResult<T> {
  result: T[];
  pagination: PaginationResult;
}

export interface SearchResult<T> {
  result: T[];
}

/**
 * Validates that field names exist in the model schema
 * Prevents NoSQL injection through field parameter manipulation
 */
const validateFields = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  fields: string[]
): { valid: string[]; invalid: string[] } => {
  const schemaPaths = Object.keys(model.schema.paths);
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const field of fields) {
    const trimmedField = field.trim();
    if (schemaPaths.includes(trimmedField)) {
      valid.push(trimmedField);
    } else {
      invalid.push(trimmedField);
    }
  }

  return { valid, invalid };
};

/**
 * Filters request body to only include fields that exist in the model schema
 * Prevents mass assignment vulnerabilities
 */
const filterBodyBySchema = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  body: Record<string, unknown>
): Record<string, unknown> => {
  const schemaPaths = Object.keys(model.schema.paths);
  const filteredBody: Record<string, unknown> = {};

  for (const key of Object.keys(body)) {
    if (schemaPaths.includes(key)) {
      filteredBody[key] = body[key];
    }
  }

  return filteredBody;
};

/**
 * Generate cache key for list queries
 */
const generateCacheKey = (model: string, query: Record<string, unknown>): string => {
  const sortedQuery = JSON.stringify(query, Object.keys(query).sort());
  return `cache:${model}:${Buffer.from(sortedQuery).toString('base64')}`;
};

/**
 * Get cached data if available
 */
const getCached = async <T>(key: string): Promise<T | null> => {
  if (!isRedisConnected()) {
    return null;
  }

  try {
    const client = getRedisClient();
    if (client) {
      const cached = await client.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    }
  } catch (err) {
    console.error('Cache read error:', err);
  }

  return null;
};

/**
 * Set cache data
 */
const setCached = async (key: string, data: unknown, ttl: number = CACHE_TTL_SECONDS): Promise<void> => {
  if (!isRedisConnected()) {
    return;
  }

  try {
    const client = getRedisClient();
    if (client) {
      await client.setEx(key, ttl, JSON.stringify(data));
    }
  } catch (err) {
    console.error('Cache write error:', err);
  }
};

/**
 * Invalidate cache for a model using SCAN (non-blocking)
 * SCAN is preferred over KEYS in production as it doesn't block the Redis event loop
 */
export const invalidateModelCache = async (model: string): Promise<void> => {
  if (!isRedisConnected()) {
    return;
  }

  try {
    const client = getRedisClient();
    if (client) {
      const pattern = `cache:${model}:*`;
      let cursor = 0;
      const keysToDelete: string[] = [];

      // Use SCAN to iterate through keys matching the pattern
      do {
        const reply = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = reply.cursor;
        keysToDelete.push(...reply.keys);
      } while (cursor !== 0);

      // Delete keys in batches if any found
      if (keysToDelete.length > 0) {
        await client.del(keysToDelete);
      }
    }
  } catch (err) {
    console.error('Cache invalidation error:', err);
  }
};

/**
 * Read a single document by ID
 */
export const readDocument = async <T extends Document>(
  model: Model<T>,
  id: string
): Promise<T | null> => {
  const query: FilterQuery<T> = { _id: id, removed: false } as FilterQuery<T>;
  return model.findOne(query);
};

/**
 * Create a new document
 */
export const createDocument = async <T extends Document>(
  model: Model<T>,
  data: Record<string, unknown>
): Promise<T> => {
  const filteredData = filterBodyBySchema(model, data);
  const document = new model(filteredData);
  return document.save();
};

/**
 * Update an existing document
 */
export const updateDocument = async <T extends Document>(
  model: Model<T>,
  id: string,
  data: Record<string, unknown>
): Promise<T | null> => {
  const query: FilterQuery<T> = { _id: id, removed: false } as FilterQuery<T>;
  const filteredData = filterBodyBySchema(model, data);
  const update: UpdateQuery<T> = { $set: filteredData };

  return model.findOneAndUpdate(query, update, { new: true, runValidators: true }).exec();
};

/**
 * Soft delete a document
 */
export const deleteDocument = async <T extends Document>(
  model: Model<T>,
  id: string
): Promise<T | null> => {
  const query: FilterQuery<T> = { _id: id, removed: false } as FilterQuery<T>;
  const update: UpdateQuery<T> = { removed: true };

  return model.findOneAndUpdate(query, update, { new: true }).exec();
};

/**
 * List documents with pagination, filtering, and sorting
 */
export const listDocuments = async <T extends Document>(
  model: Model<T>,
  options: {
    page?: number;
    limit?: number;
    sort?: string;
    filters?: Record<string, unknown>;
  }
): Promise<ListResult<T>> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(MAX_PAGE_SIZE, options.limit || DEFAULT_PAGE_SIZE);
  const skip = (page - 1) * limit;

  // Build query
  const query: FilterQuery<T> = {
    ...options.filters,
    removed: false,
  } as FilterQuery<T>;

  // Build sort option
  const sortOption: Record<string, 1 | -1> = options.sort
    ? { [options.sort]: 1 }
    : { created: -1 };

  // Check cache
  const cacheKey = generateCacheKey(model.modelName, { ...query, page, limit, sort: options.sort });
  const cached = await getCached<ListResult<T>>(cacheKey);
  if (cached) {
    return cached;
  }

  // Execute queries in parallel
  const [result, count] = await Promise.all([
    model.find(query).skip(skip).limit(limit).sort(sortOption).exec(),
    model.countDocuments(query).exec(),
  ]);

  const pages = Math.ceil(count / limit);
  const pagination: PaginationResult = { page, pages, count, limit };

  const listResult: ListResult<T> = { result, pagination };

  // Cache the result
  await setCached(cacheKey, listResult);

  return listResult;
};

/**
 * Search documents by fields
 */
export const searchDocuments = async <T extends Document>(
  model: Model<T>,
  options: {
    query: string;
    fields?: string[];
  }
): Promise<SearchResult<T>> => {
  const { query: searchQuery, fields = ['name'] } = options;

  if (!searchQuery || searchQuery.trim() === '') {
    return { result: [] };
  }

  // Escape special regex characters to prevent ReDoS
  const escapedQuery = escapeRegex(searchQuery.trim());

  // Limit query length for protection
  if (escapedQuery.length > 100) {
    throw new Error('Search query too long');
  }

  // Validate field names against model schema
  const { valid: validFields, invalid: invalidFields } = validateFields(model, fields);

  if (invalidFields.length > 0) {
    throw new Error(`Invalid search fields: ${invalidFields.join(', ')}`);
  }

  if (validFields.length === 0) {
    throw new Error('No valid search fields provided');
  }

  // Build search query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchConditions: any = {
    $or: validFields.map(field => ({
      [field]: { $regex: new RegExp(escapedQuery, 'i') },
    })),
    removed: false,
  };

  const result = await model.find(searchConditions).sort({ name: 'asc' }).limit(SEARCH_LIMIT).exec();

  return { result };
};

/**
 * Count documents matching filter
 */
export const countDocuments = async <T extends Document>(
  model: Model<T>,
  filters?: Record<string, unknown>
): Promise<number> => {
  const query: FilterQuery<T> = {
    ...filters,
    removed: false,
  } as FilterQuery<T>;

  return model.countDocuments(query).exec();
};

/**
 * Check if document exists
 */
export const documentExists = async <T extends Document>(
  model: Model<T>,
  id: string
): Promise<boolean> => {
  const query: FilterQuery<T> = { _id: id, removed: false } as FilterQuery<T>;
  const count = await model.countDocuments(query).exec();
  return count > 0;
};
