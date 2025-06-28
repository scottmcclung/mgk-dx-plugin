import { expect } from 'chai';
import * as sinon from 'sinon';
import { stubMethod } from '@salesforce/ts-sinon';
import Report from '../../src/shared/report';
import CsvReport from '../../src/shared/csvReport';
import ExcelReport from '../../src/shared/excelReport';

describe('Report', () => {
    let sandbox: sinon.SinonSandbox;
    let csvWriteStub: sinon.SinonStub;
    let excelWriteStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        csvWriteStub = stubMethod(sandbox, CsvReport, 'write');
        excelWriteStub = stubMethod(sandbox, ExcelReport, 'write');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should write CSV report when format is csv', async () => {
        const filePath = './test-output';
        const metadata = new Map<string, object>();
        
        await Report.write('csv', filePath, metadata);
        
        expect(csvWriteStub.calledOnceWith(filePath, metadata)).to.be.true;
        expect(excelWriteStub.notCalled).to.be.true;
    });

    it('should write Excel report when format is xls', async () => {
        const filePath = './test-output';
        const metadata = new Map<string, object>();
        
        await Report.write('xls', filePath, metadata);
        
        expect(excelWriteStub.calledOnceWith(filePath, metadata)).to.be.true;
        expect(csvWriteStub.notCalled).to.be.true;
    });

    it('should write Excel report when format is unknown (default)', async () => {
        const filePath = './test-output';
        const metadata = new Map<string, object>();
        
        await Report.write('unknown', filePath, metadata);
        
        expect(excelWriteStub.calledOnceWith(filePath, metadata)).to.be.true;
        expect(csvWriteStub.notCalled).to.be.true;
    });
});