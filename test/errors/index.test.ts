import { expect } from 'chai';
import {
  SalesforceConnectionError,
  MetadataFetchError,
  FileSystemError,
  ValidationError,
  UnexpectedError,
} from '../../src/errors';

describe('Custom Error Classes', () => {
  describe('SalesforceConnectionError', () => {
    it('should create error with message and code', () => {
      const error = new SalesforceConnectionError('Connection failed', 'AUTH_FAILED');

      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(SalesforceConnectionError);
      expect(error.message).to.equal('Connection failed');
      expect(error.name).to.equal('SalesforceConnectionError');
      expect(error.code).to.equal('AUTH_FAILED');
    });

    it('should create error with context', () => {
      const context = { org: 'test-org', apiVersion: '58.0' };
      const error = new SalesforceConnectionError('Connection failed', 'TIMEOUT', context);

      expect(error.context).to.deep.equal(context);
    });
  });

  describe('MetadataFetchError', () => {
    it('should create error with message and entity', () => {
      const error = new MetadataFetchError('Failed to fetch metadata', 'Account');

      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(MetadataFetchError);
      expect(error.message).to.equal('Failed to fetch metadata');
      expect(error.name).to.equal('MetadataFetchError');
      expect(error.entity).to.equal('Account');
    });
  });

  describe('FileSystemError', () => {
    it('should create error with message and path', () => {
      const error = new FileSystemError('File write failed', '/path/to/file.csv');

      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(FileSystemError);
      expect(error.message).to.equal('File write failed');
      expect(error.name).to.equal('FileSystemError');
      expect(error.path).to.equal('/path/to/file.csv');
    });
  });

  describe('ValidationError', () => {
    it('should create error with message, field, and value', () => {
      const error = new ValidationError('Invalid format', 'format', 'invalid');

      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(ValidationError);
      expect(error.message).to.equal('Invalid format');
      expect(error.name).to.equal('ValidationError');
      expect(error.field).to.equal('format');
      expect(error.value).to.equal('invalid');
    });

    it('should handle complex values', () => {
      const complexValue = { format: 'xls', path: null };
      const error = new ValidationError('Invalid configuration', 'config', complexValue);

      expect(error.value).to.deep.equal(complexValue);
    });
  });

  describe('UnexpectedError', () => {
    it('should create error with message and original error', () => {
      const originalError = new Error('Original error');
      const error = new UnexpectedError('Unexpected failure', originalError);

      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(UnexpectedError);
      expect(error.message).to.equal('Unexpected failure');
      expect(error.name).to.equal('UnexpectedError');
      expect(error.originalError).to.equal(originalError);
    });

    it('should create error without original error', () => {
      const error = new UnexpectedError('Unexpected failure');

      expect(error.originalError).to.be.undefined;
    });
  });

  describe('Error inheritance and instanceof', () => {
    it('should maintain proper prototype chain', () => {
      const connectionError = new SalesforceConnectionError('Test');
      const metadataError = new MetadataFetchError('Test');
      const fsError = new FileSystemError('Test');
      const validationError = new ValidationError('Test');
      const unexpectedError = new UnexpectedError('Test');

      // All should be instances of Error
      expect(connectionError).to.be.instanceOf(Error);
      expect(metadataError).to.be.instanceOf(Error);
      expect(fsError).to.be.instanceOf(Error);
      expect(validationError).to.be.instanceOf(Error);
      expect(unexpectedError).to.be.instanceOf(Error);

      // Each should be instance of its own type
      expect(connectionError).to.be.instanceOf(SalesforceConnectionError);
      expect(metadataError).to.be.instanceOf(MetadataFetchError);
      expect(fsError).to.be.instanceOf(FileSystemError);
      expect(validationError).to.be.instanceOf(ValidationError);
      expect(unexpectedError).to.be.instanceOf(UnexpectedError);
    });
  });
});
