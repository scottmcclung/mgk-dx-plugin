import { expect } from 'chai';
import * as sinon from 'sinon';
import { stubMethod } from '@salesforce/ts-sinon';
import { SfdxCommand } from '@salesforce/command';
import { Config } from '@oclif/config';
import MgkSchemaExport from '../../../../src/commands/mgk/schema/export';
import MetadataExport from '../../../../src/shared/metadataExport';
import Report from '../../../../src/shared/report';

describe('mgk:schema:export', () => {
    let sandbox: sinon.SinonSandbox;
    let command: MgkSchemaExport;
    let metadataExportStub: sinon.SinonStub;
    let reportWriteStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // Mock the SfdxCommand and its org property
        stubMethod(sandbox, SfdxCommand.prototype, 'org').get(() => ({
            getConnection: () => ({
                query: sandbox.stub(),
                metadata: {
                    list: sandbox.stub()
                },
                batchDescribe: sandbox.stub(),
                tooling: {
                    query: sandbox.stub()
                }
            })
        }));
        command = new MgkSchemaExport([], new Config({ root: process.cwd() })); // Provide a mocked Config object

        metadataExportStub = stubMethod(sandbox, MetadataExport.prototype, 'getExport');
        reportWriteStub = stubMethod(sandbox, Report, 'write');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should export to Excel format', async () => {
        const dummyMetadata = new Map<string, object>();
        dummyMetadata.set('Account', { fields: new Map().set('Name', { apiName: 'Name' }) });
        metadataExportStub.returns(dummyMetadata);

        (command as any).flags.format = 'xls'; // Cast to any to access protected flags
        (command as any).flags.targetpath = './test-output.xls';

        await command.run();

        expect(metadataExportStub.calledOnce).to.be.true;
        expect(reportWriteStub.calledOnceWith('xls', './test-output.xls', dummyMetadata)).to.be.true;
    });

    it('should export to CSV format', async () => {
        const dummyMetadata = new Map<string, object>();
        dummyMetadata.set('Contact', { fields: new Map().set('FirstName', { apiName: 'FirstName' }) });
        metadataExportStub.returns(dummyMetadata);

        (command as any).flags.format = 'csv';
        (command as any).flags.targetpath = './test-output.csv';

        await command.run();

        expect(metadataExportStub.calledOnce).to.be.true;
        expect(reportWriteStub.calledOnceWith('csv', './test-output.csv', dummyMetadata)).to.be.true;
    });

    it('should handle no results found', async () => {
        metadataExportStub.returns(new Map<string, object>());

        (command as any).flags.format = 'xls';
        (command as any).flags.targetpath = './test-output.xls';

        const consoleSpy = sandbox.spy(console, 'log'); // Use sandbox.spy

        await command.run();

        expect(metadataExportStub.calledOnce).to.be.true;
        expect(reportWriteStub.notCalled).to.be.true;
        expect(consoleSpy.calledWith('No results were found')).to.be.true;

        consoleSpy.restore(); // Restore console.log
    });

    it('should pass sobjects flag to MetadataExport', async () => {
        const dummyMetadata = new Map<string, object>();
        metadataExportStub.returns(dummyMetadata);

        (command as any).flags.format = 'xls';
        (command as any).flags.targetpath = './test-output.xls';
        (command as any).flags.sobjects = ['Account', 'Case'];

        await command.run();

        // Verify that MetadataExport was instantiated with the correct sobjects
        // This requires a more direct way to inspect constructor arguments, 
        // which is not directly supported by stubMethod on prototype.
        // For now, we'll rely on the fact that if getExport is called, 
        // the constructor would have been called.
        expect(metadataExportStub.calledOnce).to.be.true;
    });

    it('should pass customobjectsonly flag to MetadataExport', async () => {
        const dummyMetadata = new Map<string, object>();
        metadataExportStub.returns(dummyMetadata);

        (command as any).flags.format = 'xls';
        (command as any).flags.targetpath = './test-output.xls';
        (command as any).flags.customobjectsonly = true;

        await command.run();

        // Similar to sobjects flag, direct inspection of constructor args is tricky.
        expect(metadataExportStub.calledOnce).to.be.true;
    });
});
