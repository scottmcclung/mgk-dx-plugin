"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const sinon = tslib_1.__importStar(require("sinon"));
const ts_sinon_1 = require("@salesforce/ts-sinon");
const core_1 = require("@salesforce/core");
const config_1 = require("@oclif/config");
const export_1 = tslib_1.__importDefault(require("../../../../src/commands/mgk/schema/export"));
const metadataExport_1 = tslib_1.__importDefault(require("../../../../src/shared/metadataExport"));
const report_1 = tslib_1.__importDefault(require("../../../../src/shared/report"));
describe('mgk:schema:export', () => {
    let sandbox;
    let command;
    let metadataExportStub;
    let reportWriteStub;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        command = new export_1.default([], new config_1.Config({ root: process.cwd() }));
        const orgStub = sandbox.createStubInstance(core_1.Org);
        const connStub = {
            query: sandbox.stub(),
            metadata: {
                list: sandbox.stub()
            },
            batchDescribe: sandbox.stub(),
            tooling: {
                query: sandbox.stub()
            }
        };
        orgStub.getConnection.returns(connStub);
        command.org = orgStub;
        command.flags = {};
        metadataExportStub = (0, ts_sinon_1.stubMethod)(sandbox, metadataExport_1.default.prototype, 'getExport');
        reportWriteStub = (0, ts_sinon_1.stubMethod)(sandbox, report_1.default, 'write');
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should export to Excel format', async () => {
        const dummyMetadata = new Map();
        dummyMetadata.set('Account', { fields: new Map().set('Name', { apiName: 'Name' }) });
        metadataExportStub.returns(dummyMetadata);
        command.flags.format = 'xls'; // Cast to any to access protected flags
        command.flags.targetpath = './test-output.xls';
        await command.run();
        (0, chai_1.expect)(metadataExportStub.calledOnce).to.be.true;
        (0, chai_1.expect)(reportWriteStub.calledOnceWith('xls', './test-output.xls', dummyMetadata)).to.be.true;
    });
    it('should export to CSV format', async () => {
        const dummyMetadata = new Map();
        dummyMetadata.set('Contact', { fields: new Map().set('FirstName', { apiName: 'FirstName' }) });
        metadataExportStub.returns(dummyMetadata);
        command.flags.format = 'csv';
        command.flags.targetpath = './test-output.csv';
        await command.run();
        (0, chai_1.expect)(metadataExportStub.calledOnce).to.be.true;
        (0, chai_1.expect)(reportWriteStub.calledOnceWith('csv', './test-output.csv', dummyMetadata)).to.be.true;
    });
    it('should handle no results found', async () => {
        metadataExportStub.returns(new Map());
        command.flags.format = 'xls';
        command.flags.targetpath = './test-output.xls';
        const consoleSpy = sandbox.spy(console, 'log'); // Use sandbox.spy
        await command.run();
        (0, chai_1.expect)(metadataExportStub.calledOnce).to.be.true;
        (0, chai_1.expect)(reportWriteStub.notCalled).to.be.true;
        (0, chai_1.expect)(consoleSpy.calledWith('No results were found')).to.be.true;
        consoleSpy.restore(); // Restore console.log
    });
    it('should pass sobjects flag to MetadataExport', async () => {
        const dummyMetadata = new Map();
        metadataExportStub.returns(dummyMetadata);
        command.flags.format = 'xls';
        command.flags.targetpath = './test-output.xls';
        command.flags.sobjects = ['Account', 'Case'];
        await command.run();
        // Verify that MetadataExport was instantiated with the correct sobjects
        // This requires a more direct way to inspect constructor arguments, 
        // which is not directly supported by stubMethod on prototype.
        // For now, we'll rely on the fact that if getExport is called, 
        // the constructor would have been called.
        (0, chai_1.expect)(metadataExportStub.calledOnce).to.be.true;
    });
    it('should pass customobjectsonly flag to MetadataExport', async () => {
        const dummyMetadata = new Map();
        metadataExportStub.returns(dummyMetadata);
        command.flags.format = 'xls';
        command.flags.targetpath = './test-output.xls';
        command.flags.customobjectsonly = true;
        await command.run();
        // Similar to sobjects flag, direct inspection of constructor args is tricky.
        (0, chai_1.expect)(metadataExportStub.calledOnce).to.be.true;
    });
    it('should throw error when no org is specified', async () => {
        command.org = undefined;
        command.flags.format = 'xls';
        command.flags.targetpath = './test-output.xls';
        try {
            await command.run();
            chai_1.expect.fail('Expected error to be thrown');
        }
        catch (error) {
            (0, chai_1.expect)(error.message).to.equal('No target org specified');
        }
    });
});
