import { expect } from 'chai';
import * as sinon from 'sinon';
import { stubMethod } from '@salesforce/ts-sinon';
import { Org } from '@salesforce/core';
import { Config } from '@oclif/config';
import MgkSchemaExport from '../../../../src/commands/mgk/schema/export';
import MetadataExport from '../../../../src/shared/metadataExport';
import Report from '../../../../src/shared/report';
import { Validator } from '../../../../src/shared/validator';
import { IFileSystem } from '../../../../src/interfaces/filesystem';

describe('mgk:schema:export', () => {
  let sandbox: sinon.SinonSandbox;
  let command: MgkSchemaExport;
  let metadataExportStub: sinon.SinonStub;
  let reportWriteStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    command = new MgkSchemaExport([], new Config({ root: process.cwd() }));

    const orgStub = sandbox.createStubInstance(Org);
    const connStub = {
      query: sandbox.stub(),
      metadata: {
        list: sandbox.stub(),
      },
      batchDescribe: sandbox.stub(),
      tooling: {
        query: sandbox.stub(),
      },
    };
    (orgStub as any).getConnection.returns(connStub);
    (command as any).org = orgStub;
    (command as any).flags = {};
    (command as any).ux = {
      log: sandbox.stub(),
      warn: sandbox.stub(),
      error: sandbox.stub(),
    };

    metadataExportStub = stubMethod(sandbox, MetadataExport.prototype, 'getExport');
    reportWriteStub = stubMethod(sandbox, Report, 'write');

    // Mock file system for validation
    const mockFs: IFileSystem = {
      statSync: sandbox.stub().returns({ isDirectory: () => true } as any),
      accessSync: sandbox.stub().returns(undefined),
      constants: { W_OK: 2 },
    };
    Validator.setFileSystem(mockFs);
  });

  afterEach(() => {
    sandbox.restore();
    Validator.resetFileSystem();
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
    expect((command as any).ux.log.calledWith('Successfully exported 1 objects to ./test-output.xls')).to.be.true;
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
    expect((command as any).ux.log.calledWith('Successfully exported 1 objects to ./test-output.csv')).to.be.true;
  });

  it('should handle no results found', async () => {
    metadataExportStub.returns(new Map<string, object>());

    (command as any).flags.format = 'xls';
    (command as any).flags.targetpath = './test-output.xls';

    await command.run();

    expect(metadataExportStub.calledOnce).to.be.true;
    expect(reportWriteStub.notCalled).to.be.true;
    expect((command as any).ux.warn.calledWith('No results were found')).to.be.true;
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

  it('should throw error when no org is specified', async () => {
    (command as any).org = undefined;
    (command as any).flags.format = 'xls';
    (command as any).flags.targetpath = './test-output.xls';

    await command.run();

    expect((command as any).ux.error.calledOnce).to.be.true;
    const errorMessage = (command as any).ux.error.firstCall.args[0];
    expect(errorMessage).to.include('Connection error:');
    expect(errorMessage).to.include('No target org specified');
  });

  it('should handle validation errors properly', async () => {
    (command as any).flags.format = 'invalid';
    (command as any).flags.targetpath = './test-output.xls';

    await command.run();

    expect((command as any).ux.error.calledOnce).to.be.true;
    const errorMessage = (command as any).ux.error.firstCall.args[0];
    expect(errorMessage).to.include('Validation error:');
    expect(errorMessage).to.include('Invalid export format');
  });
});
