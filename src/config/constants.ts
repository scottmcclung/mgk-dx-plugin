/**
 * Application constants
 */

/**
 * Field type translations for Salesforce field types to user-friendly names
 */
export const TRANSLATED_FIELD_TYPES: { [key: string]: string } = {
  id: 'Id',
  string: 'Text',
  textarea: 'Text Area',
  url: 'Url',
  address: 'Address',
  int: 'Number',
  double: 'Number',
  currency: 'Currency',
  boolean: 'Checkbox',
  percent: 'Percent',
  picklist: 'Picklist',
  multipicklist: 'Multi-Picklist',
  combobox: 'Combobox',
  reference: 'Lookup',
  email: 'Email',
  date: 'Date',
  datetime: 'Datetime',
  time: 'Time',
  phone: 'Phone',
  location: 'Location',
} as const;

/**
 * Excel worksheet name constraints
 */
export const EXCEL_CONSTRAINTS = {
  MAX_WORKSHEET_NAME_LENGTH: 31,
} as const;

/**
 * File extensions
 */
export const FILE_EXTENSIONS = {
  EXCEL: '.xlsx',
  CSV: '.csv',
} as const;

/**
 * Export formats
 */
export const EXPORT_FORMATS = {
  EXCEL: 'xls',
  CSV: 'csv',
} as const;
