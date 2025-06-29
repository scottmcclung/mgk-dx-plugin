/**
 * Type definitions for mgk-dx-plugin
 */

// ============================================
// Configuration Types
// ============================================

export interface ExportConfiguration {
  format: 'xls' | 'csv';
  targetPath: string;
  customObjectsOnly?: boolean;
  objectNames?: string[];
}

/**
 * Command-line options as they come from SFDX flags.
 * Note: These use lowercase names to match the actual flag names
 * (e.g., --targetpath, --sobjects, --customobjectsonly)
 */
export interface CommandOptions {
  format: string;
  targetpath: string; // Matches --targetpath flag
  sobjects?: string[]; // Matches --sobjects flag
  customobjectsonly?: boolean; // Matches --customobjectsonly flag
}

// ============================================
// Salesforce API Types
// ============================================

export interface SObjectDescribe {
  name: string;
  label: string;
  custom: boolean;
  customSetting: boolean;
  queryable: boolean;
  retrieveable: boolean;
  searchable: boolean;
  labelPlural: string;
  keyPrefix?: string;
}

export interface EntityDefinition {
  QualifiedApiName: string;
  Label: string;
  IsCustomSetting: boolean;
  KeyPrefix?: string;
  PluralLabel?: string;
}

export interface FieldDefinition {
  QualifiedApiName: string;
  Label: string;
  DataType: string;
  Length?: number;
  Precision?: number;
  Scale?: number;
  IsRequired: boolean;
  IsUnique: boolean;
  IsCalculated: boolean;
  IsCaseSensitive: boolean;
  IsNillable: boolean;
  DefaultValue?: string | null;
  ReferenceTo?: {
    referenceTo: string;
  };
  RelationshipName?: string;
  IsHtmlFormatted?: boolean;
  IsNameField?: boolean;
  IsSortable?: boolean;
  IsFilterable?: boolean;
  IsGroupable?: boolean;
  IsNamePointing?: boolean;
  IsCustom?: boolean;
  IsDeprecatedAndHidden?: boolean;
  ExtraTypeInfo?: string;
}

export interface PicklistValue {
  value: string;
  label: string;
  active: boolean;
  defaultValue: boolean;
}

// ============================================
// Report Types
// ============================================

export interface ReportMetadata {
  entityName: string;
  fields: ProcessedField[];
  metadata: Map<string, SObjectMetadata>;
}

export interface ProcessedField extends FieldDefinition {
  formattedType: string;
  picklistValues?: string;
  fieldName: string;
  apiName: string;
  defaultValue: string;
}

export interface SObjectMetadata {
  apiName: string;
  label: string;
  objectType: string;
  isCustom: boolean;
  fields?: Map<string, ProcessedField>;
}

// ============================================
// CSV Report Types
// ============================================

export interface CsvFieldRecord {
  apiName: string;
  label: string;
  type: string;
  length?: string;
  required: string;
  unique: string;
  externalId: string;
  caseSensitive: string;
  defaultValue: string;
  description?: string;
  helpText?: string;
  picklistValues?: string;
  formula?: string;
  calculated: string;
  nameField: string;
  sortable: string;
  filterable: string;
  groupable: string;
  namePointing: string;
  custom: string;
  deprecatedAndHidden: string;
}

// ============================================
// Excel Report Types
// ============================================

export interface ExcelColumn {
  header: string;
  key: keyof ProcessedField | keyof SObjectMetadata;
  width: number;
}

export interface ExcelSummaryRow {
  [key: string]: string | number | boolean;
}

// ============================================
// Utility Types
// ============================================

export type FieldTypeMap = {
  [key: string]: string;
};

export type ObjectTypeSuffix =
  | '__c'
  | '__e'
  | '__mdt'
  | '__xo'
  | '__x'
  | '__Share'
  | '__Tag'
  | '__History'
  | '__hd'
  | '__b'
  | '__p'
  | '__ChangeEvent'
  | '__chn'
  | '__Feed';

export type ObjectType =
  | 'Custom'
  | 'Platform Event'
  | 'Custom Metadata Type'
  | 'Salesforce-to-Salesforce'
  | 'External'
  | 'Custom Object Sharing Object'
  | 'Salesforce Tags'
  | 'Custom Object Field History'
  | 'Historical Data'
  | 'Big Object'
  | 'Custom Person Object'
  | 'Change Data Capture'
  | 'Change Event Channel'
  | 'Custom Object Feed'
  | 'Standard';

// ============================================
// Function Types
// ============================================

export type FieldFormatter = (field: FieldDefinition) => string;
export type DefaultValueFormatter = (defaultValue: unknown) => string;
export type ReportWriter = (
  format: string,
  targetPath: string,
  metadata: Map<string, SObjectMetadata>,
) => Promise<void>;

// ============================================
// Error Context Types
// ============================================

export interface ErrorContext {
  operation: string;
  details?: Record<string, unknown>;
}
