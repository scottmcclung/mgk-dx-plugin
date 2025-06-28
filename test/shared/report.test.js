"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const sinon = tslib_1.__importStar(require("sinon"));
const ts_sinon_1 = require("@salesforce/ts-sinon");
const report_1 = tslib_1.__importDefault(require("../../src/shared/report"));
const csvReport_1 = tslib_1.__importDefault(require("../../src/shared/csvReport"));
const excelReport_1 = tslib_1.__importDefault(require("../../src/shared/excelReport"));
describe('Report', () => {
    let sandbox;
    let csvWriteStub;
    let excelWriteStub;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        csvWriteStub = (0, ts_sinon_1.stubMethod)(sandbox, csvReport_1.default, 'write');
        excelWriteStub = (0, ts_sinon_1.stubMethod)(sandbox, excelReport_1.default, 'write');
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should write CSV report when format is csv', async () => {
        const filePath = './test-output';
        const metadata = new Map();
        await report_1.default.write('csv', filePath, metadata);
        (0, chai_1.expect)(csvWriteStub.calledOnceWith(filePath, metadata)).to.be.true;
        (0, chai_1.expect)(excelWriteStub.notCalled).to.be.true;
    });
    it('should write Excel report when format is xls', async () => {
        const filePath = './test-output';
        const metadata = new Map();
        await report_1.default.write('xls', filePath, metadata);
        (0, chai_1.expect)(excelWriteStub.calledOnceWith(filePath, metadata)).to.be.true;
        (0, chai_1.expect)(csvWriteStub.notCalled).to.be.true;
    });
    it('should write Excel report when format is unknown (default)', async () => {
        const filePath = './test-output';
        const metadata = new Map();
        await report_1.default.write('unknown', filePath, metadata);
        (0, chai_1.expect)(excelWriteStub.calledOnceWith(filePath, metadata)).to.be.true;
        (0, chai_1.expect)(csvWriteStub.notCalled).to.be.true;
    });
});
