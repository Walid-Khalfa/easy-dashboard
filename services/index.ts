/**
 * Services Layer - Business Logic Abstraction
 * 
 * This module exports all service functions that encapsulate business logic
 * separate from HTTP handling in controllers.
 * 
 * Architecture:
 * Controllers -> Services -> Models
 * 
 * Benefits:
 * - Reusable business logic
 * - Easier testing with mocked services
 * - Separation of concerns
 * - Single responsibility principle
 */

export * from './authService';
export * from './crudService';
