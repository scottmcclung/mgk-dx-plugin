import { expect } from '@salesforce/command/lib/test';
import { headerMap, summaryHeaderMap, translatedFieldTypes } from '../../src/shared/exportSettings';

describe('exportSettings', () => {
  it('should have a translatedFieldTypes constant', () => {
    expect(translatedFieldTypes).to.not.be.undefined;
  });

  it('should have a headerMap constant', () => {
    expect(headerMap).to.not.be.undefined;
  });

  it('should have a summaryHeaderMap constant', () => {
    expect(summaryHeaderMap).to.not.be.undefined;
  });

  it('should have the correct structure for headerMap', () => {
    expect(headerMap).to.be.an('array');
    headerMap.forEach(item => {
      expect(item).to.have.all.keys('fieldDataKey', 'columnTitle', 'width', 'style');
    });
  });

  it('should have the correct structure for summaryHeaderMap', () => {
    expect(summaryHeaderMap).to.be.an('array');
    summaryHeaderMap.forEach(item => {
      expect(item).to.have.all.keys('fieldDataKey', 'columnTitle', 'width', 'style');
    });
  });
});
