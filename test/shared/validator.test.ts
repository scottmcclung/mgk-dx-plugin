import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';
import { Validator } from '../../src/shared/validator';
import { ValidationError, FileSystemError } from '../../src/errors';

describe('Validator', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('validateFilePath', () => {
    it('should throw ValidationError for empty path', () => {
      expect(() => Validator.validateFilePath('')).to.throw(ValidationError, 'File path is required');
      expect(() => Validator.validateFilePath(null as any)).to.throw(ValidationError, 'File path is required');
      expect(() => Validator.validateFilePath(undefined as any)).to.throw(ValidationError, 'File path is required');
    });

    it('should throw ValidationError if directory does not exist', () => {
      const error = new Error('ENOENT: no such file or directory');
      (error as any).code = 'ENOENT';
      sandbox.stub(fs, 'statSync').throws(error);

      expect(() => Validator.validateFilePath('/nonexistent/file.csv')).to.throw(
        ValidationError,
        'Directory does not exist: /nonexistent',
      );
    });

    it('should throw ValidationError if path is not a directory', () => {
      sandbox.stub(fs, 'statSync').returns({ isDirectory: () => false } as any);

      expect(() => Validator.validateFilePath('/path/to/file.csv')).to.throw(
        ValidationError,
        'Path is not a directory: /path/to',
      );
    });

    it('should throw FileSystemError for other file system errors', () => {
      const error = new Error('Permission denied');
      (error as any).code = 'EACCES';
      sandbox.stub(fs, 'statSync').throws(error);

      expect(() => Validator.validateFilePath('/path/to/file.csv')).to.throw(
        FileSystemError,
        'Cannot access directory',
      );
    });

    it('should throw FileSystemError if no write permission', () => {
      sandbox.stub(fs, 'statSync').returns({ isDirectory: () => true } as any);
      const accessError = new Error('No permission');
      (accessError as any).code = 'EACCES';
      sandbox.stub(fs, 'accessSync').throws(accessError);

      expect(() => Validator.validateFilePath('/readonly/file.csv')).to.throw(
        FileSystemError,
        'No write permission for directory: /readonly',
      );
    });

    it('should pass validation for valid writable path', () => {
      sandbox.stub(fs, 'statSync').returns({ isDirectory: () => true } as any);
      sandbox.stub(fs, 'accessSync').returns(undefined);

      expect(() => Validator.validateFilePath('/valid/path/file.csv')).to.not.throw();
    });
  });

  describe('validateObjectNames', () => {
    it('should throw ValidationError if not an array', () => {
      expect(() => Validator.validateObjectNames('Account' as any)).to.throw(
        ValidationError,
        'Object names must be an array',
      );
      expect(() => Validator.validateObjectNames({} as any)).to.throw(ValidationError, 'Object names must be an array');
    });

    it('should throw ValidationError for empty or invalid names', () => {
      expect(() => Validator.validateObjectNames([''])).to.throw(
        ValidationError,
        'Object name must be a non-empty string',
      );
      expect(() => Validator.validateObjectNames([null as any])).to.throw(
        ValidationError,
        'Object name must be a non-empty string',
      );
      expect(() => Validator.validateObjectNames([123 as any])).to.throw(
        ValidationError,
        'Object name must be a non-empty string',
      );
    });

    it('should throw ValidationError for invalid Salesforce object names', () => {
      expect(() => Validator.validateObjectNames(['123Invalid'])).to.throw(
        ValidationError,
        'Invalid Salesforce object name: 123Invalid',
      );
      expect(() => Validator.validateObjectNames(['Invalid-Name'])).to.throw(
        ValidationError,
        'Invalid Salesforce object name: Invalid-Name',
      );
      expect(() => Validator.validateObjectNames(['Invalid Name'])).to.throw(
        ValidationError,
        'Invalid Salesforce object name: Invalid Name',
      );
    });

    it('should throw ValidationError for reserved names', () => {
      expect(() => Validator.validateObjectNames(['true'])).to.throw(ValidationError, 'Reserved object name: true');
      expect(() => Validator.validateObjectNames(['FALSE'])).to.throw(ValidationError, 'Reserved object name: FALSE');
      expect(() => Validator.validateObjectNames(['NULL'])).to.throw(ValidationError, 'Reserved object name: NULL');
    });

    it('should pass validation for valid object names', () => {
      expect(() => Validator.validateObjectNames(['Account'])).to.not.throw();
      expect(() => Validator.validateObjectNames(['Custom_Object__c'])).to.not.throw();
      expect(() => Validator.validateObjectNames(['Account', 'Contact', 'Lead'])).to.not.throw();
      expect(() => Validator.validateObjectNames(['My_Custom_Object__c'])).to.not.throw();
    });

    it('should pass validation for empty array', () => {
      expect(() => Validator.validateObjectNames([])).to.not.throw();
    });
  });

  describe('validateExportFormat', () => {
    it('should throw ValidationError for empty format', () => {
      expect(() => Validator.validateExportFormat('')).to.throw(ValidationError, 'Export format is required');
      expect(() => Validator.validateExportFormat(null as any)).to.throw(ValidationError, 'Export format is required');
      expect(() => Validator.validateExportFormat(undefined as any)).to.throw(
        ValidationError,
        'Export format is required',
      );
    });

    it('should throw ValidationError for invalid format', () => {
      expect(() => Validator.validateExportFormat('pdf')).to.throw(
        ValidationError,
        'Invalid export format: pdf. Supported formats are: xls, csv',
      );
      expect(() => Validator.validateExportFormat('doc')).to.throw(
        ValidationError,
        'Invalid export format: doc. Supported formats are: xls, csv',
      );
    });

    it('should pass validation for valid formats', () => {
      expect(() => Validator.validateExportFormat('xls')).to.not.throw();
      expect(() => Validator.validateExportFormat('csv')).to.not.throw();
      expect(() => Validator.validateExportFormat('XLS')).to.not.throw();
      expect(() => Validator.validateExportFormat('CSV')).to.not.throw();
    });
  });

  describe('validateCommandOptions', () => {
    beforeEach(() => {
      sandbox.stub(fs, 'statSync').returns({ isDirectory: () => true } as any);
      sandbox.stub(fs, 'accessSync').returns(undefined);
    });

    it('should validate all options', () => {
      const options = {
        format: 'xls',
        targetpath: '/valid/path/file.xls',
        sobjects: ['Account', 'Contact'],
      };

      expect(() => Validator.validateCommandOptions(options)).to.not.throw();
    });

    it('should throw if any validation fails', () => {
      const options = {
        format: 'invalid',
        targetpath: '/valid/path/file.xls',
        sobjects: ['Account'],
      };

      expect(() => Validator.validateCommandOptions(options)).to.throw(ValidationError, 'Invalid export format');
    });

    it('should skip object validation if sobjects not provided', () => {
      const options = {
        format: 'csv',
        targetpath: '/valid/path/file.csv',
      };

      expect(() => Validator.validateCommandOptions(options)).to.not.throw();
    });

    it('should skip object validation if sobjects is empty', () => {
      const options = {
        format: 'csv',
        targetpath: '/valid/path/file.csv',
        sobjects: [],
      };

      expect(() => Validator.validateCommandOptions(options)).to.not.throw();
    });
  });
});
