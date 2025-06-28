# MGK-DX-Plugin Enhancement Plan

## Overview

This document outlines a comprehensive plan to improve the codebase structure, maintainability, and developer experience of the mgk-dx-plugin without changing its functionality. Each enhancement includes detailed implementation steps and expected outcomes.

## 1. Update Dependencies & Configuration

### Current Issues

- ESLint plugins in wrong dependency section
- Outdated Node.js version requirement
- Missing development tools
- No code formatting standards

### Implementation Plan

#### 1.1 Fix package.json Dependencies

```json
{
  "engines": {
    "node": ">=16.0.0"
  },
  "dependencies": {
    // Move ESLint plugins to devDependencies
    // Keep only runtime dependencies here
  },
  "devDependencies": {
    // Add all ESLint plugins here
    "prettier": "^3.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0",
    "@commitlint/cli": "^17.0.0",
    "@commitlint/config-conventional": "^17.0.0"
  }
}
```

#### 1.2 Add Prettier Configuration

**File**: `.prettierrc.json`

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

#### 1.3 Configure Pre-commit Hooks

**File**: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint-staged
```

**File**: `.lintstagedrc.json`

```json
{
  "*.{ts,js}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

#### 1.4 Add EditorConfig

**File**: `.editorconfig`

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

### Implementation Steps

1. Audit current dependencies
2. Move dependencies to correct sections
3. Add new development tools
4. Configure each tool properly
5. Update README with new development workflow

## 2. Extract Reusable Code

### Current Issues

- Repeated string manipulation logic
- Duplicate style definitions
- Similar patterns in report generation
- Hardcoded values that should be constants

### Implementation Plan

#### 2.1 Create String Utilities

**File**: `src/utils/stringUtils.ts`

```typescript
export class StringUtils {
  static truncate(str: string, maxLength: number, suffix = '...'): string;
  static sanitizeWorksheetName(name: string): string;
  static formatList(items: string[], delimiter = ', '): string;
  static escapeSpecialChars(str: string): string;
}
```

#### 2.2 Create Style Configuration

**File**: `src/config/styles.ts`

```typescript
export const EXCEL_STYLES = {
  header: {
    font: { bold: true, size: 12 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4B4B4B' } },
    alignment: { horizontal: 'left', vertical: 'middle' },
  },
  cell: {
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
  },
} as const;

export const COLUMN_WIDTHS = {
  default: 30,
  name: 40,
  type: 20,
  // ... etc
} as const;
```

#### 2.3 Create Report Base Class

**File**: `src/shared/baseReport.ts`

```typescript
export abstract class BaseReport {
  protected validatePath(path: string): void;
  protected ensureDirectoryExists(path: string): void;
  protected formatHeaders(fields: string[]): string[];
  abstract write(metadata: ReportMetadata[], targetPath: string): Promise<void>;
}
```

### Implementation Steps

1. Identify all duplicate code patterns
2. Create utility classes with tests
3. Replace inline code with utility calls
4. Extract configuration to separate files
5. Update imports across the codebase

## 3. Standardize Error Handling

### Current Issues

- Inconsistent error handling patterns
- Silent failures with console.log
- No custom error types
- Missing validation for external operations

### Implementation Plan

#### 3.1 Create Custom Error Classes

**File**: `src/errors/index.ts`

```typescript
export class SalesforceConnectionError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'SalesforceConnectionError';
  }
}

export class MetadataFetchError extends Error {
  constructor(
    message: string,
    public entity?: string,
  ) {
    super(message);
    this.name = 'MetadataFetchError';
  }
}

export class FileSystemError extends Error {
  constructor(
    message: string,
    public path?: string,
  ) {
    super(message);
    this.name = 'FileSystemError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

#### 3.2 Implement Consistent Error Handling

**Pattern to follow**:

```typescript
try {
  // operation
} catch (error) {
  if (error instanceof SpecificError) {
    // handle specific error
    throw new CustomError('Context-specific message', error);
  }
  // log unexpected errors
  logger.error('Unexpected error in operation', error);
  throw new UnexpectedError('Operation failed', error);
}
```

#### 3.3 Add Validation Layer

**File**: `src/shared/validator.ts`

```typescript
export class Validator {
  validateFilePath(path: string): void {
    // Check write permissions
    // Check disk space
    // Check path validity
  }

  validateObjectNames(names: string[]): void {
    // Validate Salesforce object naming conventions
  }

  validateExportFormat(format: string): void {
    // Ensure format is supported
  }
}
```

### Implementation Steps

1. Create error classes with tests
2. Replace console.log statements with proper errors
3. Add try-catch blocks where missing
4. Implement validation before operations
5. Add error recovery mechanisms where appropriate

## 4. Improve TypeScript Type Safety

### Current Issues

- `noImplicitAny: false` allows untyped code
- Missing type annotations in several places
- Overuse of `any` type
- Incomplete interface definitions

### Implementation Plan

#### 4.1 Enable Strict TypeScript Settings

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

#### 4.2 Create Comprehensive Type Definitions

**File**: `src/types/index.ts`

```typescript
// Configuration types
export interface ExportConfiguration {
  format: 'xls' | 'csv';
  targetPath: string;
  customObjectsOnly?: boolean;
  objectNames?: string[];
}

// Report types
export interface ReportMetadata {
  entityName: string;
  fields: ProcessedField[];
}

export interface ProcessedField extends FieldDefinition {
  formattedType: string;
  picklistValues?: string;
}

// Replace any types
export type SObjectDescribe = {
  name: string;
  label: string;
  custom: boolean;
  // ... other properties
};
```

#### 4.3 Fix Existing Type Issues

**Specific fixes needed**:

- `csvReport.ts:46` - Add type for `metadata` parameter
- `sfdx.ts:17` - Replace `any` with `SObjectDescribe`
- `metadataExport.ts` - Type all method parameters properly
- Test files - Add proper types for mocked objects

### Migration Steps

1. Create type definition file first
2. Enable one strict option at a time
3. Fix resulting type errors incrementally
4. Run tests after each fix
5. Update documentation with type information

## 5. Refactor Large Classes for Better Separation of Concerns

### Current Issue

The `metadataExport.ts` file (337 lines) violates the Single Responsibility Principle by handling:

- API communication with Salesforce
- Data fetching and caching
- Field type formatting
- Data transformation
- Business logic

### Implementation Plan

#### 5.1 Create `MetadataFetcher` Class

**File**: `src/shared/metadataFetcher.ts`

```typescript
export class MetadataFetcher {
  constructor(private connection: Connection) {}

  async fetchEntityDefinitions(objectNames?: string[]): Promise<EntityDefinition[]>;
  async fetchFieldDefinitions(entityName: string): Promise<FieldDefinition[]>;
  async fetchPicklistValues(entityName: string, fieldName: string): Promise<PicklistValue[]>;
}
```

**Implementation Details**:

- Move all SOQL query methods from `metadataExport.ts`
- Implement proper connection pooling and retry logic
- Add caching layer for repeated queries
- Include query timeout configuration

#### 5.2 Create `FieldFormatter` Class

**File**: `src/shared/fieldFormatter.ts`

```typescript
export class FieldFormatter {
  formatFieldType(field: FieldDefinition): string;
  formatPicklistValues(values: PicklistValue[]): string;
  formatFormula(field: FieldDefinition): string;
  formatReference(field: FieldDefinition): string;
}
```

**Implementation Details**:

- Extract all `getXXXFieldDefinition` methods
- Consolidate repetitive string concatenation logic
- Create configuration for field type mappings
- Add unit tests for each field type

#### 5.3 Create `MetadataProcessor` Class

**File**: `src/shared/metadataProcessor.ts`

```typescript
export class MetadataProcessor {
  filterCustomObjects(entities: EntityDefinition[]): EntityDefinition[];
  mergeFieldMetadata(fields: FieldDefinition[], picklistData: Map<string, PicklistValue[]>): ProcessedField[];
  sortFields(fields: ProcessedField[]): ProcessedField[];
}
```

**Implementation Details**:

- Move filtering and sorting logic
- Implement pipeline pattern for data transformations
- Add configuration for custom object patterns

### Migration Steps

1. Create new classes with tests first (TDD approach)
2. Gradually move methods to new classes
3. Update `metadataExport.ts` to use new classes
4. Ensure all tests pass after each migration
5. Remove deprecated code from `metadataExport.ts`

## 6. Enhance Testing

### Current Issues

- Some tests rely on implementation details
- Missing edge case coverage
- No performance benchmarks
- Inconsistent test data

### Implementation Plan

#### 6.1 Create Test Fixtures

**File**: `test/fixtures/salesforceData.ts`

```typescript
export const TEST_ENTITIES = {
  account: {
    name: 'Account',
    label: 'Account',
    fields: [
      /* predefined field data */
    ],
  },
  customObject: {
    name: 'Custom_Object__c',
    label: 'Custom Object',
    fields: [
      /* predefined field data */
    ],
  },
};

export const TEST_PICKLIST_VALUES = {
  industry: [
    { value: 'Agriculture', label: 'Agriculture', active: true },
    { value: 'Technology', label: 'Technology', active: true },
  ],
};
```

#### 6.2 Add Parameterized Tests

**Example**: `test/shared/fieldFormatter.test.ts`

```typescript
describe('FieldFormatter', () => {
  const testCases = [
    { type: 'string', length: 255, expected: 'Text(255)' },
    { type: 'boolean', expected: 'Checkbox' },
    { type: 'currency', precision: 18, scale: 2, expected: 'Currency(16,2)' },
    // ... more test cases
  ];

  testCases.forEach(({ type, length, precision, scale, expected }) => {
    it(`should format ${type} field correctly`, () => {
      const field = createField({ type, length, precision, scale });
      expect(formatter.formatFieldType(field)).to.equal(expected);
    });
  });
});
```

#### 6.3 Add Performance Benchmarks

**File**: `test/performance/benchmark.ts`

```typescript
import { performance } from 'perf_hooks';

describe('Performance Benchmarks', () => {
  it('should process 1000 fields in under 100ms', async () => {
    const fields = generateTestFields(1000);
    const start = performance.now();

    await processor.processFields(fields);

    const duration = performance.now() - start;
    expect(duration).to.be.lessThan(100);
  });
});
```

#### 6.4 Improve Functional Tests

- Replace file size checks with content validation
- Add tests for error scenarios
- Test with various Salesforce org types
- Validate Excel formulas and formatting

### Implementation Steps

1. Create comprehensive test fixtures
2. Refactor existing tests to use fixtures
3. Add parameterized tests for variations
4. Implement performance benchmarks
5. Enhance functional test coverage

## 7. Additional Enhancements

### 7.1 Add Logging Framework

**File**: `src/utils/logger.ts`

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

### 7.2 Add Configuration Management

**File**: `src/config/index.ts`

```typescript
export const config = {
  salesforce: {
    apiVersion: process.env.SF_API_VERSION || '58.0',
    timeout: parseInt(process.env.SF_TIMEOUT || '30000', 10),
    maxRetries: parseInt(process.env.SF_MAX_RETRIES || '3', 10),
  },
  export: {
    defaultBatchSize: 200,
    maxConcurrentQueries: 5,
  },
};
```

### 7.3 Add Progress Reporting

```typescript
export class ProgressReporter {
  constructor(private total: number) {}

  update(current: number, message?: string): void {
    // Emit progress events
    // Update CLI progress bar
  }
}
```

## Implementation Process

### Development Workflow

Each enhancement issue must be completed following this strict process:

1. **Branch Creation**: Create a new feature branch for each issue (e.g., `enhancement/issue-1-dependencies`)
2. **Implementation**: Complete all work for the issue in its branch
3. **Testing**: Run the full test suite to ensure no regression and functionality remains unchanged
4. **Pull Request**: Create a PR when the issue is complete
5. **Copilot Review**: Request GitHub Copilot to review the PR
6. **Address Feedback**: Fix any issues identified by Copilot
7. **Human Review**: Stop and request human review/merge
8. **Merge**: Only proceed to the next issue after PR is approved and merged

**IMPORTANT**: Each issue must be fully completed, reviewed, and merged before starting the next issue. This ensures incremental improvements without breaking changes.

### Implementation Timeline

### Phase 1 (Week 1-2): Foundation

- Issue 1: Update Dependencies & Configuration
- Issue 2: Extract Reusable Code

### Phase 2 (Week 3-4): Type Safety & Structure

- Issue 3: Standardize Error Handling
- Issue 4: Improve TypeScript Type Safety

### Phase 3 (Week 5-6): Core Refactoring

- Issue 5: Refactor Large Classes for Better Separation of Concerns

### Phase 4 (Week 7-8): Testing & Polish

- Issue 6: Enhance Testing
- Additional enhancements (logging, progress reporting)

## Success Metrics

- All tests passing with >95% coverage maintained
- Zero TypeScript errors with strict mode enabled
- Reduced average file size to <200 lines
- Improved test execution time by 20%
- Zero breaking changes to existing functionality

## Risks and Mitigation

- **Risk**: Regression during refactoring
  - **Mitigation**: Maintain comprehensive test coverage, refactor incrementally
- **Risk**: Breaking changes for plugin users
  - **Mitigation**: Keep public API unchanged, version appropriately
- **Risk**: Performance degradation
  - **Mitigation**: Add performance benchmarks, profile before/after

## Conclusion

This enhancement plan provides a roadmap to significantly improve code quality, maintainability, and developer experience while preserving all existing functionality. The modular approach allows for incremental implementation with continuous validation through the comprehensive test suite.
