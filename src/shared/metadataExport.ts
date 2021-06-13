import {Connection, Org} from '@salesforce/core';
import translatedFieldTypes from './fieldTypes';

export class MetadataExport {
  protected _org: Org;
  protected _sobjects: string[];

  constructor(settings) {
    this._org = settings.org;
    this._sobjects = settings.sobjects || [];
  }

  public async getExport() {
    const sobjectNames = await this.getSobjectNames(this._sobjects);
    return await this.getMetadata(sobjectNames);
  }

  /**
   * Returns an array of sobject names to get metadata for
   * If the user has not specified the list of sobjects, return a full list from the org
   * @param sobjectNames
   * @protected
   */
  protected async getSobjectNames(sobjectNames: any[]): any[] {
    if(sobjectNames.length > 0) return sobjectNames;
    const strSoql = "SELECT QualifiedApiName FROM EntityDefinition WHERE IsCustomizable = true AND PublisherId IN ('System','<local>') ORDER BY QualifiedApiName ASC";
    const schemaDescribe = await this._org.getConnection().query(strSoql);
    return schemaDescribe.records.map(object => object.QualifiedApiName);
  }

  /**
   * Returns an array of metadata with the fields already normalized
   * @param sobjectNames
   * @protected
   */
  protected async getMetadata(sobjectNames: string[]): any[] {
    const metadata = await this._org.getConnection().batchDescribe({
      types: sobjectNames
    });
    return this.normalizeFieldMetadata(metadata);
  }

  protected normalizeFieldMetadata(sobjectArray: any[]) {
    return sobjectArray.map(sobject => {
      sobject.fields = sobject.fields.map(field => {
        return {
          object: sobject.name,
          apiName: field.name,
          label: field.label,
          helpText: field.inlineHelpText,
          dataType: this.formattedDataType(field),
          required: field.nillable ? 'No' : 'Yes',
          unique: field.unique ? 'Yes' : 'No',
          externalId: field.externalkey ? 'Yes' : 'No',
          caseSensitive: field.caseSensitive ? 'Yes' : 'No',
          formula: field.calculatedFormula,
          defaultValue: this.formattedDefaultValue(field),
          encrypted: field.encrypted ? 'Yes' : 'No',
        };
      });
      return sobject;
    });
  }

  protected formattedDataType(field): string {
    if (field.type == "reference") {
      return `${translatedFieldTypes[field.type]}(${field.referenceTo.join(",")})`;
    } else if (field.calculated) {
      return `Formula(${translatedFieldTypes[field.type]})`;
    } else if (field.type == "picklist" || field.type == "multipicklist" || field.type == "combobox") {
      let type = "";
      type = field.restrictedPicklist ? `Restricted ` : type;
      type = field.dependentPicklist ? `Dependent ${type} ` : type;
      type = `${type}${translatedFieldTypes[field.type]}(${this.formattedPicklistValues(field.picklistValues)})`;
      return type;
    } else if (field.extraTypeInfo == "richtextarea") {
      return `RichTextArea(${field.length})`;
    } else if (field.type == "string" || field.type == "textarea" || field.type == "url") {
      return `${translatedFieldTypes[field.type]}(${field.length})`;
    } else if (field.type == "double" || field.type == "currency" || field.type == "percent") {
      let fieldLength = field.precision - field.scale;
      return `${translatedFieldTypes[field.type]}(${fieldLength},${field.scale})`;
    } else if (field.type == "int") {
      return `${translatedFieldTypes[field.type]}(${field.digits},0)`;
    } else {
      return translatedFieldTypes[field.type];
    }
  }

  protected formattedDefaultValue(field): string {
    if (field.calculatedFormula) {
      return `Formula(${field.calculatedFormula})`;
    }
    return field.defaultValue;
  }

  protected formattedPicklistValues(values: any[]): any[] {
    return values.map(value => value.label).join(", ");
  }
}
