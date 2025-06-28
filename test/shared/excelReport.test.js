"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const sinon = tslib_1.__importStar(require("sinon"));
const excelReport_1 = tslib_1.__importDefault(require("../../src/shared/excelReport"));
describe('ExcelReport', () => {
    let sandbox;
    let workbookStub;
    let worksheetStub;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        worksheetStub = {
            columns: [],
            autoFilter: {},
            addRow: sandbox.stub(),
            views: []
        };
        workbookStub = {
            addWorksheet: sandbox.stub().returns(worksheetStub),
            xlsx: {
                writeFile: sandbox.stub().resolves()
            }
        };
        sandbox.stub(excelReport_1.default, 'createWorkbook').returns(workbookStub);
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should write Excel report with summary and object worksheets', async () => {
        const filePath = './test-output';
        const metadata = new Map();
        metadata.set('Account', {
            ObjectType: 'Standard',
            QualifiedApiName: 'Account',
            Label: 'Account',
            PluralLabel: 'Accounts',
            KeyPrefix: '001',
            InternalSharingModel: 'ReadWrite',
            ExternalSharingModel: 'Private',
            HelpSettingPageName: null,
            HelpSettingPageUrl: null,
            LastModifiedByName: 'User',
            LastModifiedDate: '2023-01-01',
            CreatedByName: 'User',
            CreatedDate: '2022-01-01',
            Publisher: 'Salesforce',
            fields: new Map()
                .set('Name', { apiName: 'Name', label: 'Account Name', dataType: 'Text', object: 'Account' })
                .set('Industry', { apiName: 'Industry', label: 'Industry', dataType: 'Picklist', object: 'Account' })
        });
        metadata.set('Contact', {
            ObjectType: 'Standard',
            QualifiedApiName: 'Contact',
            Label: 'Contact',
            PluralLabel: 'Contacts',
            KeyPrefix: '003',
            InternalSharingModel: 'ReadWrite',
            ExternalSharingModel: 'Private',
            HelpSettingPageName: null,
            HelpSettingPageUrl: null,
            LastModifiedByName: 'User',
            LastModifiedDate: '2023-01-01',
            CreatedByName: 'User',
            CreatedDate: '2022-01-01',
            Publisher: 'Salesforce',
            fields: new Map()
                .set('FirstName', { apiName: 'FirstName', label: 'First Name', dataType: 'Text', object: 'Contact' })
        });
        await excelReport_1.default.write(filePath, metadata);
        (0, chai_1.expect)(workbookStub.addWorksheet.calledWith('SObject')).to.be.true;
        (0, chai_1.expect)(workbookStub.addWorksheet.calledWith('Account')).to.be.true;
        (0, chai_1.expect)(workbookStub.addWorksheet.calledWith('Contact')).to.be.true;
        // Verify summary sheet rows
        (0, chai_1.expect)(worksheetStub.addRow.callCount).to.equal(5); // 1 for SObject, 1 for Account, 1 for Contact
        (0, chai_1.expect)(worksheetStub.addRow.firstCall.args[0]).to.deep.include({ QualifiedApiName: 'Account' });
        (0, chai_1.expect)(worksheetStub.addRow.secondCall.args[0]).to.deep.include({ QualifiedApiName: 'Contact' });
        (0, chai_1.expect)(worksheetStub.addRow.thirdCall.args[0]).to.deep.include({ apiName: 'Name' });
        (0, chai_1.expect)(worksheetStub.addRow.getCall(3).args[0]).to.deep.include({ apiName: 'Industry' });
        (0, chai_1.expect)(worksheetStub.addRow.getCall(4).args[0]).to.deep.include({ apiName: 'FirstName' });
        (0, chai_1.expect)(workbookStub.xlsx.writeFile.calledOnceWith(`${filePath}.xlsx`)).to.be.true;
    });
    it('should handle empty metadata gracefully', async () => {
        const filePath = './test-output';
        const metadata = new Map();
        await excelReport_1.default.write(filePath, metadata);
        (0, chai_1.expect)(workbookStub.addWorksheet.calledWith('SObject')).to.be.true; // Summary sheet is always added
        (0, chai_1.expect)(worksheetStub.addRow.callCount).to.equal(0); // No object rows added
        (0, chai_1.expect)(workbookStub.xlsx.writeFile.calledOnceWith(`${filePath}.xlsx`)).to.be.true;
    });
    it('should truncate long object names for worksheet names', async () => {
        const filePath = './test-output';
        const longObjectName = 'ThisIsAVeryLongObjectNameThatExceedsThirtyOneCharacters';
        const metadata = new Map();
        metadata.set(longObjectName, {
            ObjectType: 'Custom',
            QualifiedApiName: longObjectName,
            Label: 'Long Object',
            PluralLabel: 'Long Objects',
            KeyPrefix: 'a00',
            InternalSharingModel: 'ReadWrite',
            ExternalSharingModel: 'Private',
            HelpSettingPageName: null,
            HelpSettingPageUrl: null,
            LastModifiedByName: 'User',
            LastModifiedDate: '2023-01-01',
            CreatedByName: 'User',
            CreatedDate: '2022-01-01',
            Publisher: 'Salesforce',
            fields: new Map()
                .set('Name', { apiName: 'Name', label: 'Name', dataType: 'Text', object: longObjectName })
        });
        await excelReport_1.default.write(filePath, metadata);
        (0, chai_1.expect)(workbookStub.addWorksheet.calledWith(sinon.match((value) => value.startsWith(longObjectName.substring(0, 30))))).to.be.true;
        (0, chai_1.expect)(workbookStub.xlsx.writeFile.calledOnce).to.be.true;
    });
    it('should create a workbook', () => {
        // Restore the stub to test the actual method
        sandbox.restore();
        const workbook = excelReport_1.default.createWorkbook();
        (0, chai_1.expect)(workbook).to.not.be.undefined;
        (0, chai_1.expect)(workbook.worksheets).to.be.an('array');
    });
});
