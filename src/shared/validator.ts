import * as fs from 'fs';
import * as path from 'path';
import { ValidationError, FileSystemError } from '../errors';
import { EXPORT_FORMATS } from '../config/constants';

/**
 * Validator class for input validation and pre-flight checks
 */
export class Validator {
  /**
   * Validates that the target file path is writable
   * @param filePath - The path where the file will be written
   * @throws {ValidationError} If path is invalid
   * @throws {FileSystemError} If path is not writable
   */
  public static validateFilePath(filePath: string): void {
    if (!filePath || typeof filePath !== 'string') {
      throw new ValidationError('File path is required', 'targetpath', filePath);
    }

    const directory = path.dirname(filePath);

    // Check if directory exists
    try {
      const stats = fs.statSync(directory);
      if (!stats.isDirectory()) {
        throw new ValidationError(`Path is not a directory: ${directory}`, 'targetpath', filePath);
      }
    } catch (error) {
      // Re-throw ValidationErrors (from the isDirectory check)
      if (error instanceof ValidationError) {
        throw error;
      }

      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new ValidationError(`Directory does not exist: ${directory}`, 'targetpath', filePath);
      }
      throw new FileSystemError(`Cannot access directory: ${(error as Error).message}`, directory, error);
    }

    // Check write permissions
    try {
      fs.accessSync(directory, fs.constants.W_OK);
    } catch (error) {
      throw new FileSystemError(`No write permission for directory: ${directory}`, directory, error);
    }
  }

  /**
   * Validates Salesforce object names
   * @param names - Array of object names to validate
   * @throws {ValidationError} If any object name is invalid
   */
  public static validateObjectNames(names: string[]): void {
    if (!Array.isArray(names)) {
      throw new ValidationError('Object names must be an array', 'sobjects', names);
    }

    for (const name of names) {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Object name must be a non-empty string', 'sobjects', name);
      }

      // Basic Salesforce object name validation
      // Must start with letter, can contain letters, numbers, and underscores
      const objectNamePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
      if (!objectNamePattern.test(name)) {
        throw new ValidationError(
          `Invalid Salesforce object name: ${name}. Object names must start with a letter and contain only letters, numbers, and underscores.`,
          'sobjects',
          name,
        );
      }

      // Check for reserved names
      const reservedNames = ['true', 'false', 'null'];
      if (reservedNames.includes(name.toLowerCase())) {
        throw new ValidationError(`Reserved object name: ${name}`, 'sobjects', name);
      }
    }
  }

  /**
   * Validates the export format
   * @param format - The export format to validate
   * @throws {ValidationError} If format is not supported
   */
  public static validateExportFormat(format: string): void {
    if (!format || typeof format !== 'string') {
      throw new ValidationError('Export format is required', 'format', format);
    }

    const validFormats = Object.values(EXPORT_FORMATS);
    const lowerFormat = format.toLowerCase();

    if (!validFormats.includes(lowerFormat as (typeof EXPORT_FORMATS)[keyof typeof EXPORT_FORMATS])) {
      throw new ValidationError(
        `Invalid export format: ${format}. Supported formats are: ${validFormats.join(', ')}`,
        'format',
        format,
      );
    }
  }

  /**
   * Validates all command options
   * @param options - Command options to validate
   */
  public static validateCommandOptions(options: { format: string; targetpath: string; sobjects?: string[] }): void {
    // Validate export format
    this.validateExportFormat(options.format);

    // Validate file path
    this.validateFilePath(options.targetpath);

    // Validate object names if provided
    if (options.sobjects && options.sobjects.length > 0) {
      this.validateObjectNames(options.sobjects);
    }
  }
}
