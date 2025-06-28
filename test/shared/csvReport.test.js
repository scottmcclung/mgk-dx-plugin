"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const sinon = tslib_1.__importStar(require("sinon"));
const csvReport_1 = tslib_1.__importDefault(require("../../src/shared/csvReport"));
const csvWriter = tslib_1.__importStar(require("csv-writer"));
describe('CsvReport', () => {
    let sandbox;
    let createObjectCsvWriterStub;
    let csvWriterInstanceStub;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        csvWriterInstanceStub = {
            writeRecords: sandbox.stub().resolves()
        };
        createObjectCsvWriterStub = sandbox.stub(csvWriter, 'createObjectCsvWriter').returns(csvWriterInstanceStub);
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should write CSV report with correct headers and data', async () => {
        const filePath = './test-output';
        const metadata = new Map();
        metadata.set('Account', {
            fields: new Map()
                .set('Name', { apiName: 'Name', label: 'Account Name', dataType: 'Text', object: 'Account' })
                .set('Industry', { apiName: 'Industry', label: 'Industry', dataType: 'Picklist', object: 'Account' })
        });
        metadata.set('Contact', {
            fields: new Map()
                .set('FirstName', { apiName: 'FirstName', label: 'First Name', dataType: 'Text', object: 'Contact' })
        });
        await csvReport_1.default.write(filePath, metadata);
        (0, chai_1.expect)(createObjectCsvWriterStub.calledOnce).to.be.true;
        (0, chai_1.expect)(createObjectCsvWriterStub.firstCall.args[0].path).to.equal(`${filePath}.csv`);
        (0, chai_1.expect)(createObjectCsvWriterStub.firstCall.args[0].header).to.deep.equal([
            { id: 'object', title: 'Object' },
            { id: 'apiName', title: 'API Name' },
            { id: 'label', title: 'Label' },
            { id: 'dataType', title: 'Type' },
            { id: 'description', title: 'Description' },
            { id: 'helpText', title: 'Help Text' },
            { id: 'required', title: 'Required' },
            { id: 'unique', title: 'Unique' },
            { id: 'externalId', title: 'External Id' },
            { id: 'caseSensitive', title: 'Case Sensitive' },
            { id: 'formula', title: 'Formula' },
            { id: 'defaultValue', title: 'Default Value' },
            { id: 'encrypted', title: 'Encrypted' },
            { id: 'dataOwner', title: 'Data Owner' },
            { id: 'fieldUsage', title: 'Field Usage' },
            { id: 'dataSensitivityLevel', title: 'Data Sensitivity Level' },
            { id: 'complianceCategorization', title: 'Compliance Categorization' },
            { id: 'relationshipName', title: 'Relationship Name' },
            { id: 'publisherId', title: 'Publisher' }
        ]);
        (0, chai_1.expect)(csvWriterInstanceStub.writeRecords.calledTwice).to.be.true;
        (0, chai_1.expect)(csvWriterInstanceStub.writeRecords.firstCall.args[0]).to.deep.equal([
            { apiName: 'Name', label: 'Account Name', dataType: 'Text', object: 'Account' },
            { apiName: 'Industry', label: 'Industry', dataType: 'Picklist', object: 'Account' }
        ]);
        (0, chai_1.expect)(csvWriterInstanceStub.writeRecords.secondCall.args[0]).to.deep.equal([
            { apiName: 'FirstName', label: 'First Name', dataType: 'Text', object: 'Contact' }
        ]);
    });
    it('should handle empty metadata gracefully', async () => {
        const filePath = './test-output';
        const metadata = new Map();
        await csvReport_1.default.write(filePath, metadata);
        (0, chai_1.expect)(createObjectCsvWriterStub.calledOnce).to.be.true; // Still creates the writer
        (0, chai_1.expect)(csvWriterInstanceStub.writeRecords.notCalled).to.be.true; // But no records are written
    });
});
