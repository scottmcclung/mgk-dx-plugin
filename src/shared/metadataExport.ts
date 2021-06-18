import {Org} from '@salesforce/core';
import translatedFieldTypes from './fieldTypes';

export class MetadataExport {
    protected _apiVersion: string;
    protected _org: Org;
    protected _sobjects: string[];
    protected _sobjectMetadata = new Map();
    protected _fieldMetadata;
    protected _customObjectsOnly = false;

    constructor(settings) {
        this._apiVersion = '51.0';
        this._org = settings.org;
        this._sobjects = settings.sobjects || [];
        this._customObjectsOnly = settings.customObjectsOnly || false;
    }

    public async getExport() {
        this._sobjectMetadata = new Map();
        await this.getSobjectMetadata(this._sobjects);
        await this.getDescribeMetadata(Array.from(this._sobjectMetadata.keys()));
        return this._sobjectMetadata;
    }

    protected async getSobjectMetadata(sobjectNames: any[]) {
        const sobjectFilter = sobjectNames.length > 0 ? `AND QualifiedApiName IN (${sobjectNames.map(name => `'${name}'`).join(',')})` : '';
        const strSoql = `
            SELECT DurableId,DeveloperName,QualifiedApiName,KeyPrefix,Label,PluralLabel,ExternalSharingModel,InternalSharingModel,PublisherId,HelpSettingPageName,HelpSettingPageUrl,RecordTypesSupported,LastModifiedDate,LastModifiedBy.Name
            FROM EntityDefinition
            WHERE IsCustomizable = true
            AND PublisherId IN ('System','<local>')
            ${sobjectFilter}
            ORDER BY QualifiedApiName ASC
            `;
        const entities = await this._org.getConnection().query(strSoql);
        if (entities.records) {
            for (const object of entities.records) {
                if (this._customObjectsOnly && !object.QualifiedApiName.endsWith('__c')) continue;
                this._sobjectMetadata.set(object.QualifiedApiName, {
                    DurableId: object.DurableId,
                    DeveloperName: object.DeveloperName,
                    QualifiedApiName: object.QualifiedApiName,
                    KeyPrefix: object.KeyPrefix,
                    Label: object.Label,
                    PluralLabel: object.PluralLabel,
                    ExternalSharingModel: object.ExternalSharingModel,
                    InternalSharingModel: object.InternalSharingModel,
                    PublisherId: object.PublisherId,
                    HelpSettingPageName: object.HelpSettingPageName,
                    HelpSettingPageUrl: object.HelpSettingPageUrl,
                    RecordTypesSupported: object.RecordTypesSupported.recordTypeInfos || [],
                    LastModifiedDate: object.LastModifiedDate,
                    LastModifiedByName: object.LastModifiedBy.Name
                });
            }
        }
        const metadataList = await this._org.getConnection().metadata.list([{
            type: 'CustomObject'
        }], this._apiVersion);
        if (metadataList) {
            for (const object of metadataList) {
                if (!object.fullName || !this._sobjectMetadata.has(object.fullName)) continue;
                this._sobjectMetadata.set(object.fullName, Object.assign(this._sobjectMetadata.get(object.fullName), {
                    CreatedByName: object.createdByName,
                    CreatedDate: object.createdDate,
                    NamespacePrefix: object.namespacePrefix || ''
                }));
            }
        }
    }


    /**
     * Returns an array of metadata with the fields already normalized
     * @param sobjectNames
     * @protected
     */
    protected async getDescribeMetadata(sobjectNames: string[]): any[] {
        const metadata = await this._org.getConnection().batchDescribe({
            types: sobjectNames
        });
        for (const object of metadata) {
            if (!this._sobjectMetadata.has(object.name)) continue;

            const fieldMap = new Map();
            const fieldDescribeMap = this.getFieldDescribeMap(object.fields, object.name);
            for (const [key, value] of fieldDescribeMap) {
                if (!fieldMap.has(key)) fieldMap.set(key, value);
                else fieldMap.set(key, Object.assign(fieldMap.get(key), value));
            }
            const fieldDefinitionMap = await this.getFieldDefinitionMapByObject(object.name);
            for (const [key, value] of fieldDefinitionMap) {
                if (fieldMap.has(key)) fieldMap.set(key, Object.assign(fieldMap.get(key), value));
            }

            const objectDefinition = Object.assign(this._sobjectMetadata.get(object.name), {
                fields: fieldMap,
                childRelationships: object.childRelationships
            });

            this._sobjectMetadata.set(object.name, objectDefinition);
        }
    }

    protected getFieldDescribeMap(fields: any[], objectName: string) {
        const fieldDescribeMap = new Map();
        if (!fields) return fieldDescribeMap;
        for (const field of fields) {
            fieldDescribeMap.set(field.name, this.normalizeFieldMetadata(field, objectName));
        }
        return fieldDescribeMap;
    }

    protected async getFieldDefinitionMapByObject(objectName: string) {
        const fieldDefinitionMap = new Map();
        if (!objectName) return fieldDefinitionMap;

        const fieldDefinitionSoql = `
          SELECT Id,DurableId,Description,QualifiedApiName,PublisherId
          FROM FieldDefinition
          WHERE EntityDefinition.QualifiedApiName = '${objectName}'
          `;
        const fieldDefinitions = await this._org.getConnection().tooling.query(fieldDefinitionSoql);
        if (fieldDefinitions) {
            fieldDefinitions.records.forEach(field => {
                fieldDefinitionMap.set(field.QualifiedApiName, {
                    object: objectName,
                    durableId: field.DurableId,
                    description: field.Description,
                    publisherId: field.PublisherId
                });
            });
        }
        return fieldDefinitionMap;
    }

    protected normalizeFieldMetadata(field: object, objectName: string) {
        return {
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
            object: objectName,
            durableId: null,
            description: null,
            publisherId: 'System'
        };
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
            return `Rich Text Area(${field.length})`;
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
