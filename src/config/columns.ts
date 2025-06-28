/**
 * Column definitions for Excel and CSV exports
 */

import { CELL_STYLE, FIELD_COLUMN_WIDTHS } from './styles';

export interface ColumnDefinition {
  fieldDataKey: string;
  columnTitle: string;
  width: number;
  style: object;
}

/**
 * Helper function to create a column definition
 */
function createColumn(fieldDataKey: string, columnTitle: string, widthKey?: string): ColumnDefinition {
  return {
    fieldDataKey,
    columnTitle,
    width: FIELD_COLUMN_WIDTHS[widthKey || fieldDataKey] || FIELD_COLUMN_WIDTHS.standard,
    style: CELL_STYLE,
  };
}

/**
 * Field header column definitions
 */
export const FIELD_HEADER_COLUMNS: ColumnDefinition[] = [
  createColumn('object', 'Object'),
  createColumn('apiName', 'API Name'),
  createColumn('label', 'Label'),
  createColumn('dataType', 'Type'),
  createColumn('description', 'Description'),
  createColumn('helpText', 'Help Text'),
  createColumn('required', 'Required'),
  createColumn('unique', 'Unique'),
  createColumn('externalId', 'External Id'),
  createColumn('caseSensitive', 'Case Sensitive'),
  createColumn('formula', 'Formula'),
  createColumn('defaultValue', 'Default Value'),
  createColumn('encrypted', 'Encrypted'),
  createColumn('dataOwner', 'Data Owner'),
  createColumn('fieldUsage', 'Field Usage'),
  createColumn('dataSensitivityLevel', 'Data Sensitivity Level'),
  createColumn('complianceCategorization', 'Compliance Categorization'),
  createColumn('relationshipName', 'Relationship Name'),
  createColumn('publisherId', 'Publisher'),
];

/**
 * Summary header column definitions
 */
export const SUMMARY_HEADER_COLUMNS: ColumnDefinition[] = [
  createColumn('ObjectType', 'Type'),
  createColumn('QualifiedApiName', 'Qualified Api Name'),
  createColumn('Label', 'Label'),
  createColumn('PluralLabel', 'Plural Label'),
  createColumn('KeyPrefix', 'Key Prefix'),
  createColumn('InternalSharingModel', 'Internal Sharing Model'),
  createColumn('ExternalSharingModel', 'External Sharing Model'),
  createColumn('HelpSettingPageName', 'Help Setting Page Name'),
  createColumn('HelpSettingPageUrl', 'Help Setting Page Url'),
  createColumn('LastModifiedByName', 'Last Modified By'),
  createColumn('LastModifiedDate', 'Last Modified Date'),
  createColumn('CreatedByName', 'Created By'),
  createColumn('CreatedDate', 'Created Date'),
  createColumn('Publisher', 'Publisher'),
];
