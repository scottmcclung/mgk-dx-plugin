/**
 * Custom error classes for the mgk-dx-plugin
 * These provide structured error handling with specific context for different failure scenarios
 */

/**
 * Base error class for all plugin errors
 */
export abstract class PluginError extends Error {
  constructor(
    message: string,
    public readonly context?: unknown,
  ) {
    super(message);
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when Salesforce connection or authentication fails
 */
export class SalesforceConnectionError extends PluginError {
  constructor(
    message: string,
    public readonly code?: string,
    context?: unknown,
  ) {
    super(message, context);
    this.name = 'SalesforceConnectionError';
  }
}

/**
 * Error thrown when metadata fetch operations fail
 */
export class MetadataFetchError extends PluginError {
  constructor(
    message: string,
    public readonly entity?: string,
    context?: unknown,
  ) {
    super(message, context);
    this.name = 'MetadataFetchError';
  }
}

/**
 * Error thrown when file system operations fail
 */
export class FileSystemError extends PluginError {
  constructor(
    message: string,
    public readonly path?: string,
    context?: unknown,
  ) {
    super(message, context);
    this.name = 'FileSystemError';
  }
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends PluginError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
    context?: unknown,
  ) {
    super(message, context);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown for unexpected errors that don't fit other categories
 */
export class UnexpectedError extends PluginError {
  constructor(
    message: string,
    public readonly originalError?: Error,
    context?: unknown,
  ) {
    super(message, context);
    this.name = 'UnexpectedError';
  }
}
