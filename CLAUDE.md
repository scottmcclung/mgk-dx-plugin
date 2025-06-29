# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Salesforce DX (SFDX) CLI plugin that exports Salesforce object schema metadata to Excel or CSV formats. The plugin integrates with the Salesforce CLI ecosystem and provides the command `sfdx mgk:schema:export`.

**Note:** While this plugin uses the legacy `sfdx` command format, the Salesforce CLI has transitioned to the `sf` command. For plugin management and testing, use `sf plugins` commands instead of the deprecated `sfdx plugins` commands.

## Development Guidelines

1. Always update the CLAUDE.md file with important learnings or technical design details that need to be documented for all developers.
2. Always follow a TDD development process to ensure code quality and maintainability.
3. Always develop new features in a separate branch and create a pull request for review.
4. Use meaningful commit messages and follow the conventional commit message format.

## Development Commands

### Build and Development

```bash
# Build TypeScript and generate OCLIF manifest
npm run prepack

# Run tests with coverage
npm test

# Run single test file
npx mocha --require ts-node/register test/path/to/specific.test.ts

# Run functional tests (requires authenticated org)
npm run test:functional
# OR use the bash script
npm run test:functional:script

# Run all tests (unit + functional)
npm run test:all

# Lint code with auto-fix
npm run lint

# Update README with latest command help
npm run version
```

### Plugin Testing

```bash
# Link plugin for local development (use sf, not sfdx)
sf plugins:link .

# Test the actual command (still uses sfdx command format)
sfdx mgk:schema:export --format xls --targetpath ./test-output.xls --targetusername your-org@example.com
```

## Architecture

### Command Structure

- **Entry Point**: `/src/commands/mgk/schema/export.ts` - Main SFDX command implementation
- **Plugin Registration**: `/src/index.ts` - Minimal plugin entry point
- **Salesforce Utilities**: `/src/lib/sfdx.ts` - Org connection and metadata utilities

### Core Business Logic (`/src/shared/`)

- **metadataExport.ts**: Core metadata extraction and processing logic
- **excelReport.ts**: Excel (.xls) file generation using ExcelJS
- **csvReport.ts**: CSV file generation using csv-writer
- **report.ts**: Factory pattern for export format selection
- **exportSettings.ts**: Configuration and command settings management (re-exports from `/src/config/` for backward compatibility)

### Utility Modules (`/src/utils/`)

- **stringUtils.ts**: Common string operations including truncation, sanitization, and Salesforce object type detection

### Configuration (`/src/config/`)

- **constants.ts**: Centralized constants for translations, file extensions, and export formats
- **columns.ts**: Column definitions for Excel/CSV headers with width and style configurations
- **styles.ts**: Excel worksheet styling and view configurations

### Key Dependencies

- `@salesforce/command` & `@salesforce/core`: SFDX framework integration
- `exceljs`: Excel file generation
- `csv-writer`: CSV file generation
- `@oclif/command`: CLI command framework

### Testing Structure

Tests mirror the source structure in `/test/` directory:

- Integration tests for commands
- Unit tests for shared modules
- Mocha with TypeScript support via ts-node
- 5-second timeout for async Salesforce operations

## SFDX Plugin Specifics

### Command Registration

Commands are auto-discovered from `/lib/commands/` after TypeScript compilation. The OCLIF manifest is generated during `prepack` for command registration.

### Salesforce Connection

Uses `@salesforce/core` Connection class for org authentication and metadata API calls. Supports both username/password and OAuth flows.

### Message Internationalization

Command messages are defined in `/messages/mgk.json` for internationalization support.

## Development Notes

### ESLint Configuration

Recently migrated from TSLint to ESLint with TypeScript support. Configuration includes:

- TypeScript parser with project-based type checking
- Import plugin for module resolution
- JSDoc plugin for documentation standards
- Prefer-arrow plugin for consistent arrow function usage
- Separate configurations for source (`src/`) and test (`test/`) directories

### TypeScript Configuration

- Target: ES2018
- Output: `/lib` directory
- Extends Salesforce dev-config
- Declaration files generated for npm distribution

### Plugin Distribution

- Files distributed: `/lib`, `/messages`, `oclif.manifest.json`
- Installation: `sf plugins:install mgk-dx-plugin` (use `sf` not deprecated `sfdx`)
- Updates: `sf plugins:update`

### Development Tooling (Added in Enhancement Phase)

- **Prettier**: Code formatting with 120-character line width, trailing commas, single quotes
- **Husky & lint-staged**: Pre-commit hooks for automatic linting and formatting
- **Commitlint**: Enforces conventional commit message format
- **EditorConfig**: Ensures consistent coding styles across different editors

## Comprehensive Test Suite

### Test Coverage

The project maintains **96.89%** statement coverage with comprehensive test suites covering:

- Command integration tests (100% coverage)
- Business logic unit tests (94-100% coverage per module)
- Report generation tests for both Excel and CSV formats
- Utility function tests (100% coverage for string utilities)

### Test Structure and Organization

```
/test/
├── commands/mgk/schema/export.test.ts    # Command integration tests
├── shared/                               # Unit tests for business logic
│   ├── csvReport.test.ts                # CSV generation tests
│   ├── excelReport.test.ts              # Excel generation tests
│   ├── exportSettings.test.ts           # Configuration validation
│   ├── metadataExport.test.ts           # Core metadata logic tests
│   └── report.test.ts                   # Report factory tests
└── lib/sfdx.test.ts                     # SFDX utility function tests
```

### Critical Test Scenarios Covered

- **Command Validation**: Org authentication, parameter validation, error handling
- **Metadata Processing**: Object filtering, field metadata merging, data type formatting
- **Export Formats**: Excel workbook generation, CSV file creation, edge cases
- **Error Conditions**: Missing orgs, invalid parameters, empty result sets
- **Data Types**: All Salesforce field types including complex types (picklists, formulas, references)

### Test Configuration Details

- **Framework**: Mocha with TypeScript support via ts-node
- **Assertions**: Chai assertion library
- **Mocking**: Sinon for stubs and spies, @salesforce/ts-sinon for Salesforce-specific mocking
- **Coverage**: NYC (Istanbul) with 96.57% statement coverage
- **Timeout**: 5-second timeout for async Salesforce operations

### ESLint Configuration for Tests

- Separate linting rules for `src/` and `test/` directories
- Relaxed rules for test files: `@typescript-eslint/no-explicit-any: off`, `@typescript-eslint/no-unused-expressions: off`
- Strict TypeScript checking maintained for source code

### Key Testing Patterns

1. **Salesforce Connection Mocking**: Mock `Org.getConnection()` and all SOQL/Metadata API calls
2. **File System Mocking**: Stub `ExcelJS` and `csv-writer` for testing without actual file I/O
3. **Error Path Testing**: Comprehensive testing of failure scenarios and edge cases
4. **Data Validation**: Verify complex metadata transformations and field type formatting

### Known Testing Issues

- **fs module stubbing**: Sinon has difficulty stubbing Node.js fs module methods when imported using `import * as fs` syntax in TypeScript. Some validator tests are skipped due to this limitation. The validator implementation is correct, but the test harness needs improvement. Consider using dependency injection or proxyquire for better testability.

### TypeScript Configuration for Testing

- Includes both `src/` and `test/` directories in compilation
- Strict type checking with specific allowances for test patterns
- Proper module resolution for both production and test dependencies

## Functional Testing

### Automated Functional Tests

The project includes comprehensive functional tests that validate the actual plugin output against real Salesforce orgs:

**Quick Test Commands:**

```bash
# Standalone bash script (recommended)
npm run test:functional:script

# Mocha-based integration tests
npm run test:functional

# All tests (unit + functional)
npm run test:all
```

### Functional Test Coverage

- **Excel export validation** - File creation, workbook structure, and actual field data validation using ExcelJS
- **CSV export validation** - Content parsing and field accuracy validation using csv-parser
- **Custom objects filter** - Validates ALL exported objects have custom naming extensions (e.g., **c, **mdt, \_\_e)
- **Error handling** - Invalid org and non-existent object handling with graceful failure
- **Data accuracy** - Field metadata accuracy against known Salesforce schema (Account.Name, Account.Id, picklists)
- **File output verification** - Deterministic content validation rather than file size checks

### Prerequisites for Functional Testing

1. **Authenticated Salesforce org** - Default uses alias `nk`, override with `SF_TEST_ORG=your-alias`
2. **Plugin installation** - Either installed via `sf plugins:install` or linked via `sf plugins:link`
3. **Network connectivity** - Tests make actual API calls to Salesforce

### Test Execution Without Local Linking

The functional tests work with any installed version of the plugin:

- Published npm version: `sf plugins:install mgk-dx-plugin`
- Local development version: `sf plugins:link .`
- No need to uninstall/reinstall between test runs

### CSV Parsing Implementation

Both functional test approaches (Mocha and bash script) use robust CSV parsing:

- **Mocha tests**: Use the `csv-parser` npm library for RFC 4180 compliant parsing
- **Bash script**: Uses Node.js with `csv-parser` to handle complex quoted fields, multi-line formulas, and picklist values
- **No external dependencies**: Only requires Node.js (already needed for the project), no Python or other tools required

### Test Logic Improvements

- **Custom objects validation**: Updated to ensure ALL exported objects have custom naming extensions when `--customobjectsonly` flag is used, rather than counting objects
- **Excel validation**: Changed from file size checks to actual field data validation using ExcelJS to read workbook content
- **Deterministic testing**: All functional tests now validate actual data structure and content rather than indirect metrics

## Important Design Patterns and Learnings

### Code Organization Principles

1. **Separation of Concerns**: Business logic, configuration, and utilities are separated into distinct modules
2. **Backward Compatibility**: When refactoring, maintain existing module exports through re-exports (e.g., `exportSettings.ts` re-exports from `/config/`)
3. **Configuration Centralization**: All constants, styles, and column definitions moved to `/src/config/` for better maintainability

### CSV Writer Pattern

**Critical Learning**: The `csv-writer` library's `writeRecords()` method overwrites the file on each call. When processing multiple objects:

- ❌ **Wrong**: Calling `writeRecords()` inside a loop (overwrites previous data)
- ✅ **Correct**: Accumulate all records first, then call `writeRecords()` once

```typescript
// Correct pattern
const allRecords: object[] = [];
for (const sobject of metadata.values()) {
  if (sobject.fields) {
    allRecords.push(...Array.from(sobject.fields.values()));
  }
}
await csvWriter.writeRecords(allRecords);
```

### Excel Worksheet Name Constraints

- Excel limits worksheet names to 31 characters
- Use `truncateWithIndex()` utility to ensure unique, valid worksheet names
- Append index numbers to prevent duplicate names when truncating

### Performance Considerations

1. **Module-level Constants**: Define lookup maps (like `suffixMap`) at module level to avoid recreation on each function call
2. **Immutability**: Avoid mutating input data structures; create new objects when transforming data

### Salesforce Object Type Detection

The plugin identifies Salesforce object types by their suffixes:

- `__c`: Custom Objects
- `__e`: Platform Events
- `__mdt`: Custom Metadata Types
- `__b`: Big Objects
- `__x`: External Objects
- And many more (see `stringUtils.ts` for complete list)

### Testing Best Practices

1. **Mock at the Right Level**: Mock external dependencies (Salesforce connections, file writers) but test actual business logic
2. **Test Data Organization**: Use consistent test data patterns across test files
3. **Async Operation Timeouts**: Set appropriate timeouts (5 seconds) for Salesforce API operations
