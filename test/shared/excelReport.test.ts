import { expect } from 'chai';
import * as sinon from 'sinon';

import ExcelReport from '../../src/shared/excelReport';

describe('ExcelReport', () => {
    let sandbox: sinon.SinonSandbox;
    let workbookStub: any;
    let worksheetStub: any;

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

        sandbox.stub(ExcelReport, 'createWorkbook').returns(workbookStub);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should write Excel report with summary and object worksheets', async () => {
        const filePath = './test-output';
        const metadata = new Map<string, object>();
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
            fields: new Map<string, object>()
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
            fields: new Map<string, object>()
                .set('FirstName', { apiName: 'FirstName', label: 'First Name', dataType: 'Text', object: 'Contact' })
        });

        await ExcelReport.write(filePath, metadata);

        expect(workbookStub.addWorksheet.calledWith('SObject')).to.be.true;
        expect(workbookStub.addWorksheet.calledWith('Account')).to.be.true;
        expect(workbookStub.addWorksheet.calledWith('Contact')).to.be.true;

        // Verify summary sheet rows
        expect(worksheetStub.addRow.callCount).to.equal(5); // 1 for SObject, 1 for Account, 1 for Contact
        expect(worksheetStub.addRow.firstCall.args[0]).to.deep.include({ QualifiedApiName: 'Account' });
        expect(worksheetStub.addRow.secondCall.args[0]).to.deep.include({ QualifiedApiName: 'Contact' });
        expect(worksheetStub.addRow.thirdCall.args[0]).to.deep.include({ apiName: 'Name' });
        expect(worksheetStub.addRow.getCall(3).args[0]).to.deep.include({ apiName: 'Industry' });
        expect(worksheetStub.addRow.getCall(4).args[0]).to.deep.include({ apiName: 'FirstName' });

        expect(workbookStub.xlsx.writeFile.calledOnceWith(`${filePath}.xlsx`)).to.be.true;
    });

    it('should handle empty metadata gracefully', async () => {
        const filePath = './test-output';
        const metadata = new Map<string, object>();

        await ExcelReport.write(filePath, metadata);

        expect(workbookStub.addWorksheet.calledWith('SObject')).to.be.true; // Summary sheet is always added
        expect(worksheetStub.addRow.callCount).to.equal(0); // No object rows added
        expect(workbookStub.xlsx.writeFile.calledOnceWith(`${filePath}.xlsx`)).to.be.true;
    });

    it('should truncate long object names for worksheet names', async () => {
        const filePath = './test-output';
        const longObjectName = 'ThisIsAVeryLongObjectNameThatExceedsThirtyOneCharacters';
        const metadata = new Map<string, object>();
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
            fields: new Map<string, object>()
                .set('Name', { apiName: 'Name', label: 'Name', dataType: 'Text', object: longObjectName })
        });

        await ExcelReport.write(filePath, metadata);

        expect(workbookStub.addWorksheet.calledWith(sinon.match((value: string) => value.startsWith(longObjectName.substring(0, 30))))).to.be.true;
        expect(workbookStub.xlsx.writeFile.calledOnce).to.be.true;
    });

    it('should create a workbook', () => {
        // Restore the stub to test the actual method
        sandbox.restore();
        const workbook = ExcelReport.createWorkbook();
        expect(workbook).to.not.be.undefined;
        expect(workbook.worksheets).to.be.an('array');
    });
});
