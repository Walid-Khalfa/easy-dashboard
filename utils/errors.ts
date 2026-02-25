/**
 * Custom error classes for the application
 * Provides type-safe error handling with additional context
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'APP_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication error with optional lockout information
 */
export class AuthenticationError extends AppError {
  public readonly locked?: boolean;
  public readonly remainingAttempts?: number;
  public readonly remainingMinutes?: number;

  constructor(
    message: string,
    options?: {
      locked?: boolean;
      remainingAttempts?: number;
      remainingMinutes?: number;
    }
  ) {
    super(message, 'AUTHENTICATION_ERROR');
    this.locked = options?.locked;
    this.remainingAttempts = options?.remainingAttempts;
    this.remainingMinutes = options?.remainingMinutes;
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends AppError {
  public readonly errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * Authorization error for permission denied scenarios
 */
export class AuthorizationError extends AppError {
  public readonly requiredPermission?: string;

  constructor(message: string, requiredPermission?: string) {
    super(message, 'AUTHORIZATION_ERROR');
    this.requiredPermission = requiredPermission;
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
  public readonly resource?: string;

  constructor(message: string, resource?: string) {
    super(message, 'NOT_FOUND');
    this.resource = resource;
  }
}

/**
 * Rate limit error for throttled requests
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }
}
