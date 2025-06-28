/**
 * Excel and CSV styling configuration constants
 */

/**
 * Common cell alignment style used across all columns
 */
export const CELL_ALIGNMENT = {
  vertical: 'top' as const,
  horizontal: 'left' as const,
  wrapText: true,
};

/**
 * Header cell style for Excel worksheets
 */
export const HEADER_STYLE = {
  font: { bold: true, size: 12 },
  fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE0E0E0' } },
  alignment: { ...CELL_ALIGNMENT, vertical: 'middle' as const },
};

/**
 * Default cell style for Excel worksheets
 */
export const CELL_STYLE = {
  alignment: CELL_ALIGNMENT,
};

/**
 * Column width definitions for different field types
 */
export const COLUMN_WIDTHS = {
  narrow: 10,
  small: 12,
  medium: 15,
  standard: 20,
  wide: 25,
  extraWide: 30,
  description: 50,
} as const;

/**
 * Column width mappings by field type
 */
export const FIELD_COLUMN_WIDTHS: { [key: string]: number } = {
  // Narrow columns (10)
  required: COLUMN_WIDTHS.narrow,
  unique: COLUMN_WIDTHS.narrow,
  encrypted: COLUMN_WIDTHS.narrow,
  publisherId: COLUMN_WIDTHS.narrow,
  KeyPrefix: COLUMN_WIDTHS.narrow,

  // Small columns (12)
  externalId: COLUMN_WIDTHS.small,
  defaultValue: COLUMN_WIDTHS.small,
  fieldUsage: COLUMN_WIDTHS.small,
  complianceCategorization: COLUMN_WIDTHS.small,
  relationshipName: COLUMN_WIDTHS.small,

  // Medium columns (15)
  caseSensitive: COLUMN_WIDTHS.medium,
  dataSensitivityLevel: COLUMN_WIDTHS.medium,
  ObjectType: COLUMN_WIDTHS.medium,
  Publisher: COLUMN_WIDTHS.medium,

  // Standard columns (20)
  dataOwner: COLUMN_WIDTHS.standard,
  InternalSharingModel: COLUMN_WIDTHS.standard,
  ExternalSharingModel: COLUMN_WIDTHS.standard,
  HelpSettingPageName: COLUMN_WIDTHS.standard,

  // Wide columns (25)
  object: COLUMN_WIDTHS.wide,
  apiName: COLUMN_WIDTHS.wide,
  label: COLUMN_WIDTHS.wide,
  QualifiedApiName: COLUMN_WIDTHS.wide,
  Label: COLUMN_WIDTHS.wide,
  PluralLabel: COLUMN_WIDTHS.wide,
  HelpSettingPageUrl: COLUMN_WIDTHS.wide,
  LastModifiedByName: COLUMN_WIDTHS.wide,
  CreatedByName: COLUMN_WIDTHS.wide,

  // Extra wide columns (30)
  LastModifiedDate: COLUMN_WIDTHS.extraWide,
  CreatedDate: COLUMN_WIDTHS.extraWide,

  // Description columns (50)
  dataType: COLUMN_WIDTHS.description,
  description: COLUMN_WIDTHS.description,
  helpText: COLUMN_WIDTHS.description,
  formula: COLUMN_WIDTHS.description,
} as const;

/**
 * Worksheet view configuration
 */
export const WORKSHEET_VIEW = {
  state: 'frozen' as const,
  ySplit: 1,
};

/**
 * Auto filter ranges for different worksheet types
 */
export const AUTO_FILTER_RANGES = {
  sobject: { from: 'A1', to: 'N1' },
  field: { from: 'A1', to: 'S1' },
} as const;
