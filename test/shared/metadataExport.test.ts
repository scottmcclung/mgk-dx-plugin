import { expect } from 'chai';
import * as sinon from 'sinon';
import { Org } from '@salesforce/core';
import MetadataExport from '../../src/shared/metadataExport';
import { Field, QueryResult } from 'jsforce';


describe('MetadataExport', () => {
    let sandbox: sinon.SinonSandbox;
    let orgStub: sinon.SinonStubbedInstance<Org>;
    let connStub: any;
    let metadataExport: MetadataExport;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        connStub = {
            query: sandbox.stub(),
            metadata: {
                list: sandbox.stub()
            },
            batchDescribe: sandbox.stub(),
            tooling: {
                query: sandbox.stub()
            }
        };

        orgStub = sandbox.createStubInstance(Org);
        (orgStub as any).getConnection.returns(connStub);

        metadataExport = new MetadataExport({ org: orgStub });
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getExport', () => {
        it('should return empty map if no sobjects are found', async () => {
            connStub.query.returns({ records: [] });
            const result = await metadataExport.getExport();
            expect(result.size).to.equal(0);
        });

        it('should export metadata for specified sobjects', async () => {
            const entityDefinition: QueryResult<any> = {
                done: true,
                totalSize: 2,
                records: [
                    { QualifiedApiName: 'Account', Label: 'Account', RecordTypesSupported: { recordTypeInfos: [] } },
                    { QualifiedApiName: 'MyObject__c', Label: 'My Object', RecordTypesSupported: { recordTypeInfos: [] } }
                ]
            };
            connStub.query.onFirstCall().returns(entityDefinition);
            connStub.metadata.list.returns([]);
            connStub.batchDescribe.returns([
                { name: 'Account', fields: [], childRelationships: [] },
                { name: 'MyObject__c', fields: [], childRelationships: [] }
            ]);
            connStub.tooling.query.returns({ records: [] });

            metadataExport = new MetadataExport({ org: orgStub, sobjects: ['Account', 'MyObject__c'] });
            const result = await metadataExport.getExport();

            expect(result.size).to.equal(2);
            expect(result.has('Account')).to.be.true;
            expect(result.has('MyObject__c')).to.be.true;
        });

        it('should export only custom objects when customObjectsOnly is true', async () => {
            const entityDefinition: QueryResult<any> = {
                done: true,
                totalSize: 2,
                records: [
                    { QualifiedApiName: 'Account', Label: 'Account', IsCustomizable: true, RecordTypesSupported: { recordTypeInfos: [] } },
                    { QualifiedApiName: 'MyObject__c', Label: 'My Object', IsCustomizable: true, RecordTypesSupported: { recordTypeInfos: [] } }
                ]
            };
            connStub.query.onFirstCall().returns(entityDefinition);
            connStub.metadata.list.returns([]);
            connStub.batchDescribe.returns([
                { name: 'MyObject__c', fields: [], childRelationships: [] }
            ]);
            connStub.tooling.query.returns({ records: [] });

            metadataExport = new MetadataExport({ org: orgStub, customObjectsOnly: true });
            const result = await metadataExport.getExport();

            expect(result.size).to.equal(1);
            expect(result.has('Account')).to.be.false;
            expect(result.has('MyObject__c')).to.be.true;
        });

        it('should handle field definitions and merge with field metadata', async () => {
            const entityDefinition: QueryResult<any> = {
                done: true,
                totalSize: 1,
                records: [
                    { QualifiedApiName: 'TestObject__c', Label: 'Test Object', RecordTypesSupported: { recordTypeInfos: [] } }
                ]
            };
            connStub.query.onFirstCall().returns(entityDefinition);
            connStub.metadata.list.returns([]);
            connStub.batchDescribe.returns([
                { 
                    name: 'TestObject__c', 
                    fields: [
                        { 
                            name: 'TestField__c', 
                            label: 'Test Field',
                            type: 'string',
                            length: 255,
                            nillable: true,
                            inlineHelpText: 'Help text',
                            defaultValue: 'default_value',
                            calculated: false,
                            caseSensitive: false,
                            externalId: false,
                            unique: false
                        }
                    ], 
                    childRelationships: [] 
                }
            ]);
            connStub.tooling.query.returns({ 
                records: [
                    {
                        QualifiedApiName: 'TestField__c',
                        DurableId: 'test-id',
                        Description: 'Field description',
                        PublisherId: 'publisher-id',
                        BusinessOwner: { Name: 'Business Owner' }
                    }
                ]
            });

            metadataExport = new MetadataExport({ org: orgStub });
            const result = await metadataExport.getExport();

            expect(result.size).to.equal(1);
            expect(result.has('TestObject__c')).to.be.true;
        });
    });

    describe('formattedDataType', () => {
        it('should format reference type correctly', () => {
            const field: Field = { type: 'reference', referenceTo: ['Account', 'Contact'] } as Field;
            const result = (metadataExport as any).formattedDataType(field);
            expect(result).to.equal('Lookup(Account,Contact)');
        });

        it('should format calculated type correctly', () => {
            const field: Field = { type: 'string', calculated: true } as Field;
            const result = (metadataExport as any).formattedDataType(field);
            expect(result).to.equal('Formula(Text)');
        });

        it('should format picklist type correctly', () => {
            const field: Field = { type: 'picklist', restrictedPicklist: false, dependentPicklist: false, picklistValues: [{ label: 'Value1' }, { label: 'Value2' }] } as Field;
            const result = (metadataExport as any).formattedDataType(field);
            expect(result).to.equal('Picklist(Value1, Value2)');
        });

        it('should format restricted picklist type correctly', () => {
            const field: Field = { type: 'picklist', restrictedPicklist: true, dependentPicklist: false, picklistValues: [{ label: 'Value1' }] } as Field;
            const result = (metadataExport as any).formattedDataType(field);
            expect(result).to.equal('Restricted Picklist(Value1)');
        });

        it('should format dependent picklist type correctly', () => {
            const field: Field = { type: 'picklist', restrictedPicklist: false, dependentPicklist: true, picklistValues: [{ label: 'Value1' }] } as Field;
            const result = (metadataExport as any).formattedDataType(field);
            expect(result).to.equal('Dependent Picklist(Value1)');
        });

        it('should format rich text area type correctly', () => {
            const field: Field = { type: 'textarea', extraTypeInfo: 'richtextarea', length: 255 } as Field;
            const result = (metadataExport as any).formattedDataType(field);
            expect(result).to.equal('Rich Text Area(255)');
        });

        it('should format string type correctly', () => {
            const field: Field = { type: 'string', length: 255 } as Field;
            const result = (metadataExport as any).formattedDataType(field);
            expect(result).to.equal('Text(255)');
        });

        it('should format double type correctly', () => {
            const field: Field = { type: 'double', precision: 18, scale: 2 } as Field;
            const result = (metadataExport as any).formattedDataType(field);
            expect(result).to.equal('Number(16,2)');
        });

        it('should format int type correctly', () => {
            const field: Field = { type: 'int', digits: 10 } as Field;
            const result = (metadataExport as any).formattedDataType(field);
            expect(result).to.equal('Number(10,0)');
        });

        it('should format other types correctly', () => {
            const field: Field = { type: 'boolean' } as Field;
            const result = (metadataExport as any).formattedDataType(field);
            expect(result).to.equal('Checkbox');
        });
    });

    describe('formattedDefaultValue', () => {
        it('should format formula default value correctly', () => {
            const field: Field = { defaultValueFormula: 'TODAY()' } as Field;
            const result = (metadataExport as any).formattedDefaultValue(field);
            expect(result).to.equal('Formula(TODAY())');
        });

        it('should return empty string for null default value', () => {
            const field: Field = { defaultValue: null } as Field;
            const result = (metadataExport as any).formattedDefaultValue(field);
            expect(result).to.equal('');
        });

        it('should return string representation for non-null default value', () => {
            const field: Field = { defaultValue: true } as Field;
            const result = (metadataExport as any).formattedDefaultValue(field);
            expect(result).to.equal('true');
        });
    });

    describe('getObjectType', () => {
        it('should return Custom for __c objects', () => {
            const sobject = { QualifiedApiName: 'MyObject__c' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Custom');
        });

        it('should return Platform Event for __e objects', () => {
            const sobject = { QualifiedApiName: 'MyEvent__e' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Platform Event');
        });

        it('should return Custom Metadata Type for __mdt objects', () => {
            const sobject = { QualifiedApiName: 'MyMetadata__mdt' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Custom Metadata Type');
        });

        it('should return Salesforce-to-Salesforce for __xo objects', () => {
            const sobject = { QualifiedApiName: 'MyS2SObject__xo' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Salesforce-to-Salesforce');
        });

        it('should return External for __x objects', () => {
            const sobject = { QualifiedApiName: 'MyExternalObject__x' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('External');
        });

        it('should return Custom Object Sharing Object for __Share objects', () => {
            const sobject = { QualifiedApiName: 'MyObject__Share' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Custom Object Sharing Object');
        });

        it('should return Salesforce Tags for __Tag objects', () => {
            const sobject = { QualifiedApiName: 'MyTag__Tag' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Salesforce Tags');
        });

        it('should return Custom Object Field History for __History objects', () => {
            const sobject = { QualifiedApiName: 'MyObject__History' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Custom Object Field History');
        });

        it('should return Historical Data for __hd objects', () => {
            const sobject = { QualifiedApiName: 'MyObject__hd' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Historical Data');
        });

        it('should return Big Object for __b objects', () => {
            const sobject = { QualifiedApiName: 'MyBigObject__b' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Big Object');
        });

        it('should return Custom Person Object for __p objects', () => {
            const sobject = { QualifiedApiName: 'MyPersonObject__p' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Custom Person Object');
        });

        it('should return Change Data Capture for __ChangeEvent objects', () => {
            const sobject = { QualifiedApiName: 'MyChangeEvent__ChangeEvent' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Change Data Capture');
        });

        it('should return Change Event Channel for __chn objects', () => {
            const sobject = { QualifiedApiName: 'MyChannel__chn' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Change Event Channel');
        });

        it('should return Custom Object Feed for __Feed objects', () => {
            const sobject = { QualifiedApiName: 'MyObject__Feed' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Custom Object Feed');
        });

        it('should return Standard for other objects', () => {
            const sobject = { QualifiedApiName: 'StandardObject' };
            const result = (metadataExport as any).getObjectType(sobject);
            expect(result).to.equal('Standard');
        });
    });
});
