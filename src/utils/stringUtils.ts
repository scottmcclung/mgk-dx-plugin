/**
 * String utility functions for common string operations
 */

/**
 * Truncates a string to a maximum length and appends an index to ensure uniqueness
 * Used primarily for worksheet names which have a 31 character limit
 * @param str - The string to truncate
 * @param maxLength - Maximum allowed length
 * @param index - Index to append for uniqueness
 * @returns Truncated string with index suffix
 */
export function truncateWithIndex(str: string, maxLength: number, index: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  const indexStr = index.toString();
  const length = maxLength - indexStr.length;
  return str.substring(0, length) + indexStr;
}

/**
 * Sanitizes a worksheet name to ensure it's valid for Excel
 * Excel worksheet names cannot exceed 31 characters
 * @param name - The worksheet name to sanitize
 * @param maxLength - Maximum length (default 31)
 * @returns Sanitized worksheet name
 */
export function sanitizeWorksheetName(name: string, maxLength = 31): string {
  // Remove invalid characters for Excel worksheet names
  const sanitized = name.replace(/[\\/*?:[\]]/g, '');
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
}

/**
 * Formats an array of items with labels into a comma-separated string
 * @param items - Array of items with label property
 * @param delimiter - Delimiter to use (default: ", ")
 * @returns Formatted string
 */
export function formatList<T extends { label: string }>(items: T[], delimiter = ', '): string {
  return items.map((item) => item.label).join(delimiter);
}

/**
 * Escapes special characters in a string for use in regular expressions
 * @param str - String to escape
 * @returns Escaped string
 */
export function escapeSpecialChars(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Adds a file extension to a base path if it doesn't already have it
 * @param basePath - The base file path
 * @param extension - The extension to add (with or without leading dot)
 * @returns Path with extension
 */
export function addFileExtension(basePath: string, extension: string): string {
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  return basePath.endsWith(ext) ? basePath : `${basePath}${ext}`;
}

/**
 * Parses a command string into command name and arguments
 * @param command - The command string to parse
 * @returns Object with command name and arguments array
 */
export function parseCommand(command: string): { name: string; args: string[] } {
  const parts = command
    .trim()
    .split(' ')
    .filter((part) => part.length > 0);
  return {
    name: parts[0] || '',
    args: parts.slice(1),
  };
}

/**
 * Determines Salesforce object type based on naming suffix
 * @param objectName - The Salesforce object name
 * @returns The object type description
 */
export function getObjectTypeBySuffix(objectName: string): string {
  const suffixMap: { [key: string]: string } = {
    __c: 'Custom',
    __e: 'Platform Event',
    __mdt: 'Custom Metadata Type',
    __xo: 'Salesforce-to-Salesforce',
    __x: 'External',
    __Share: 'Custom Object Sharing Object',
    __Tag: 'Salesforce Tags',
    __History: 'Custom Object Field History',
    __hd: 'Historical Data',
    __b: 'Big Object',
    __p: 'Custom Person Object',
    __ChangeEvent: 'Change Data Capture',
    __chn: 'Change Event Channel',
    __Feed: 'Custom Object Feed',
  };

  for (const [suffix, type] of Object.entries(suffixMap)) {
    if (objectName.endsWith(suffix)) {
      return type;
    }
  }

  return 'Standard';
}
