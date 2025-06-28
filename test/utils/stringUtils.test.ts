import { expect } from 'chai';
import {
  truncateWithIndex,
  sanitizeWorksheetName,
  formatList,
  escapeSpecialChars,
  addFileExtension,
  parseCommand,
  getObjectTypeBySuffix,
} from '../../src/utils/stringUtils';

describe('stringUtils', () => {
  describe('truncateWithIndex', () => {
    it('should return original string if within maxLength', () => {
      const result = truncateWithIndex('ShortName', 31, 1);
      expect(result).to.equal('ShortName');
    });

    it('should truncate and append index if exceeds maxLength', () => {
      const result = truncateWithIndex('VeryLongWorksheetNameThatExceedsLimit', 31, 5);
      expect(result).to.equal('VeryLongWorksheetNameThatExcee5');
      expect(result.length).to.equal(31);
    });

    it('should handle double-digit indices correctly', () => {
      const result = truncateWithIndex('VeryLongWorksheetNameThatExceedsLimit', 31, 15);
      expect(result).to.equal('VeryLongWorksheetNameThatExce15');
      expect(result.length).to.equal(31);
    });
  });

  describe('sanitizeWorksheetName', () => {
    it('should remove invalid Excel characters', () => {
      const result = sanitizeWorksheetName('Invalid\\Name/*With?Special:[Characters]');
      expect(result).to.equal('InvalidNameWithSpecialCharacter');
    });

    it('should truncate to maxLength', () => {
      const result = sanitizeWorksheetName('VeryLongWorksheetNameThatExceedsExcelLimit', 31);
      expect(result).to.equal('VeryLongWorksheetNameThatExceed');
      expect(result.length).to.equal(31);
    });

    it('should handle both sanitization and truncation', () => {
      const result = sanitizeWorksheetName('Very*Long?Worksheet[Name]ThatExceedsLimit', 20);
      expect(result).to.equal('VeryLongWorksheetNam');
      expect(result.length).to.equal(20);
    });
  });

  describe('formatList', () => {
    it('should format array of items with labels', () => {
      const items = [{ label: 'Option A' }, { label: 'Option B' }, { label: 'Option C' }];
      const result = formatList(items);
      expect(result).to.equal('Option A, Option B, Option C');
    });

    it('should use custom delimiter', () => {
      const items = [{ label: 'Item1' }, { label: 'Item2' }];
      const result = formatList(items, ' | ');
      expect(result).to.equal('Item1 | Item2');
    });

    it('should handle empty array', () => {
      const result = formatList([]);
      expect(result).to.equal('');
    });

    it('should handle single item', () => {
      const result = formatList([{ label: 'Single' }]);
      expect(result).to.equal('Single');
    });
  });

  describe('escapeSpecialChars', () => {
    it('should escape regex special characters', () => {
      const result = escapeSpecialChars('test.*+?^${}()|[]\\');
      expect(result).to.equal('test\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });

    it('should leave normal characters unchanged', () => {
      const result = escapeSpecialChars('normalText123');
      expect(result).to.equal('normalText123');
    });
  });

  describe('addFileExtension', () => {
    it('should add extension without dot', () => {
      const result = addFileExtension('/path/to/file', 'csv');
      expect(result).to.equal('/path/to/file.csv');
    });

    it('should add extension with dot', () => {
      const result = addFileExtension('/path/to/file', '.xlsx');
      expect(result).to.equal('/path/to/file.xlsx');
    });

    it('should not duplicate extension', () => {
      const result = addFileExtension('/path/to/file.csv', 'csv');
      expect(result).to.equal('/path/to/file.csv');
    });

    it('should handle extension with dot when file already has it', () => {
      const result = addFileExtension('/path/to/file.xlsx', '.xlsx');
      expect(result).to.equal('/path/to/file.xlsx');
    });
  });

  describe('parseCommand', () => {
    it('should parse command with arguments', () => {
      const result = parseCommand('sfdx force:org:list --all --json');
      expect(result.name).to.equal('sfdx');
      expect(result.args).to.deep.equal(['force:org:list', '--all', '--json']);
    });

    it('should handle command without arguments', () => {
      const result = parseCommand('ls');
      expect(result.name).to.equal('ls');
      expect(result.args).to.deep.equal([]);
    });

    it('should trim whitespace', () => {
      const result = parseCommand('  npm   install   ');
      expect(result.name).to.equal('npm');
      expect(result.args).to.deep.equal(['install']);
    });

    it('should handle empty string', () => {
      const result = parseCommand('');
      expect(result.name).to.equal('');
      expect(result.args).to.deep.equal([]);
    });
  });

  describe('getObjectTypeBySuffix', () => {
    it('should identify Custom objects', () => {
      expect(getObjectTypeBySuffix('Account__c')).to.equal('Custom');
    });

    it('should identify Platform Events', () => {
      expect(getObjectTypeBySuffix('Order_Event__e')).to.equal('Platform Event');
    });

    it('should identify Custom Metadata Types', () => {
      expect(getObjectTypeBySuffix('Config_Setting__mdt')).to.equal('Custom Metadata Type');
    });

    it('should identify Change Data Capture objects', () => {
      expect(getObjectTypeBySuffix('Account__ChangeEvent')).to.equal('Change Data Capture');
    });

    it('should identify Big Objects', () => {
      expect(getObjectTypeBySuffix('Archive_Data__b')).to.equal('Big Object');
    });

    it('should return Standard for objects without special suffix', () => {
      expect(getObjectTypeBySuffix('Account')).to.equal('Standard');
      expect(getObjectTypeBySuffix('Contact')).to.equal('Standard');
    });

    it('should handle all defined suffixes', () => {
      const testCases = [
        { name: 'Test__xo', expected: 'Salesforce-to-Salesforce' },
        { name: 'Test__x', expected: 'External' },
        { name: 'Test__Share', expected: 'Custom Object Sharing Object' },
        { name: 'Test__Tag', expected: 'Salesforce Tags' },
        { name: 'Test__History', expected: 'Custom Object Field History' },
        { name: 'Test__hd', expected: 'Historical Data' },
        { name: 'Test__p', expected: 'Custom Person Object' },
        { name: 'Test__chn', expected: 'Change Event Channel' },
        { name: 'Test__Feed', expected: 'Custom Object Feed' },
      ];

      testCases.forEach(({ name, expected }) => {
        expect(getObjectTypeBySuffix(name)).to.equal(expected);
      });
    });
  });
});
