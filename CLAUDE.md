# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Salesforce DX (SFDX) CLI plugin that exports Salesforce object schema metadata to Excel or CSV formats. The plugin integrates with the Salesforce CLI ecosystem and provides the command `sfdx mgk:schema:export`.

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

# Lint code with auto-fix
npm run lint

# Update README with latest command help
npm run version
```

### Plugin Testing
```bash
# Link plugin for local development
sfdx plugins:link .

# Test the actual command
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
- **exportSettings.ts**: Configuration and command settings management

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

### TypeScript Configuration
- Target: ES2018
- Output: `/lib` directory
- Extends Salesforce dev-config
- Declaration files generated for npm distribution

### Plugin Distribution
- Files distributed: `/lib`, `/messages`, `oclif.manifest.json`
- Installation: `sfdx plugins:install mgk-dx-plugin`
- Updates: `sfdx plugins:update`

## Comprehensive Test Suite

### Test Coverage
The project maintains **96.57%** statement coverage with comprehensive test suites covering:
- Command integration tests (100% coverage)
- Business logic unit tests (94-100% coverage per module)
- Report generation tests for both Excel and CSV formats
- Utility function tests

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

### TypeScript Configuration for Testing
- Includes both `src/` and `test/` directories in compilation
- Strict type checking with specific allowances for test patterns
- Proper module resolution for both production and test dependencies
