/**
 * Salesforce API type definitions
 * These types represent the actual structure returned by Salesforce APIs
 */

export interface QueryResult<T> {
  records: T[];
  totalSize: number;
  done: boolean;
}

export interface DescribeSObjectResult {
  name: string;
  label: string;
  fields: Field[];
  custom: boolean;
  keyPrefix?: string;
  childRelationships?: unknown[];
}

export interface Field {
  name: string;
  label: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
  digits?: number;
  required?: boolean;
  unique: boolean;
  calculated: boolean;
  caseSensitive: boolean;
  nillable: boolean;
  defaultValue?: unknown;
  defaultValueFormula?: string;
  referenceTo?: string[];
  relationshipName?: string;
  picklistValues?: PicklistEntry[];
  htmlFormatted?: boolean;
  nameField?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  namePointing?: boolean;
  custom?: boolean;
  deprecatedAndHidden?: boolean;
  extraTypeInfo?: string;
  inlineHelpText?: string;
  externalId?: boolean;
  calculatedFormula?: string;
  encrypted?: boolean;
  restrictedPicklist?: boolean;
  dependentPicklist?: boolean;
  [key: string]: unknown; // Allow additional properties
}

export interface PicklistEntry {
  value: string;
  label: string;
  active: boolean;
  defaultValue: boolean;
}

export interface FileProperties {
  createdById: string;
  createdByName: string;
  createdDate: string;
  fileName: string;
  fullName: string;
  id: string;
  lastModifiedById: string;
  lastModifiedByName: string;
  lastModifiedDate: string;
  type: string;
  namespacePrefix?: string;
  [key: string]: unknown; // Allow additional properties
}
