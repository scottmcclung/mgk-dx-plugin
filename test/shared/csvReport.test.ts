import { expect } from 'chai';
import * as sinon from 'sinon';
import CsvReport from '../../src/shared/csvReport';
import * as csvWriter from 'csv-writer';

describe('CsvReport', () => {
  let sandbox: sinon.SinonSandbox;
  let createObjectCsvWriterStub: sinon.SinonStub;
  let csvWriterInstanceStub: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    csvWriterInstanceStub = {
      writeRecords: sandbox.stub().resolves(),
    };
    createObjectCsvWriterStub = sandbox.stub(csvWriter, 'createObjectCsvWriter').returns(csvWriterInstanceStub);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should write CSV report with correct headers and data', async () => {
    const filePath = './test-output';
    const metadata = new Map<string, object>();
    metadata.set('Account', {
      fields: new Map<string, object>()
        .set('Name', { apiName: 'Name', label: 'Account Name', dataType: 'Text', object: 'Account' })
        .set('Industry', { apiName: 'Industry', label: 'Industry', dataType: 'Picklist', object: 'Account' }),
    });
    metadata.set('Contact', {
      fields: new Map<string, object>().set('FirstName', {
        apiName: 'FirstName',
        label: 'First Name',
        dataType: 'Text',
        object: 'Contact',
      }),
    });

    await CsvReport.write(filePath, metadata);

    expect(createObjectCsvWriterStub.calledOnce).to.be.true;
    expect(createObjectCsvWriterStub.firstCall.args[0].path).to.equal(`${filePath}.csv`);
    expect(createObjectCsvWriterStub.firstCall.args[0].header).to.deep.equal([
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
      { id: 'publisherId', title: 'Publisher' },
    ]);

    expect(csvWriterInstanceStub.writeRecords.calledOnce).to.be.true;
    expect(csvWriterInstanceStub.writeRecords.firstCall.args[0]).to.deep.equal([
      { apiName: 'Name', label: 'Account Name', dataType: 'Text', object: 'Account' },
      { apiName: 'Industry', label: 'Industry', dataType: 'Picklist', object: 'Account' },
      { apiName: 'FirstName', label: 'First Name', dataType: 'Text', object: 'Contact' },
    ]);
  });

  it('should handle empty metadata gracefully', async () => {
    const filePath = './test-output';
    const metadata = new Map<string, object>();

    await CsvReport.write(filePath, metadata);

    expect(createObjectCsvWriterStub.calledOnce).to.be.true; // Still creates the writer
    expect(csvWriterInstanceStub.writeRecords.calledOnce).to.be.true; // Called once with empty array
    expect(csvWriterInstanceStub.writeRecords.firstCall.args[0]).to.deep.equal([]); // Empty array
  });
});
