"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@salesforce/command/lib/test");
const exportSettings_1 = require("../../src/shared/exportSettings");
describe('exportSettings', () => {
    it('should have a translatedFieldTypes constant', () => {
        (0, test_1.expect)(exportSettings_1.translatedFieldTypes).to.not.be.undefined;
    });
    it('should have a headerMap constant', () => {
        (0, test_1.expect)(exportSettings_1.headerMap).to.not.be.undefined;
    });
    it('should have a summaryHeaderMap constant', () => {
        (0, test_1.expect)(exportSettings_1.summaryHeaderMap).to.not.be.undefined;
    });
    it('should have the correct structure for headerMap', () => {
        (0, test_1.expect)(exportSettings_1.headerMap).to.be.an('array');
        exportSettings_1.headerMap.forEach(item => {
            (0, test_1.expect)(item).to.have.all.keys('fieldDataKey', 'columnTitle', 'width', 'style');
        });
    });
    it('should have the correct structure for summaryHeaderMap', () => {
        (0, test_1.expect)(exportSettings_1.summaryHeaderMap).to.be.an('array');
        exportSettings_1.summaryHeaderMap.forEach(item => {
            (0, test_1.expect)(item).to.have.all.keys('fieldDataKey', 'columnTitle', 'width', 'style');
        });
    });
});
