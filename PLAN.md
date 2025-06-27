# Plugin Functionality and Requirements

## Current Functionality

The `mgk-dx-plugin` is a Salesforce CLI plugin designed to extract and document Salesforce object and field schema information.

### Command: `sfdx mgk:schema:export`

This command allows users to export Salesforce SObject and field metadata to either an Excel or CSV file.

#### Parameters:

*   `--format <xls|csv>`: **Required**. Specifies the output file format.
    *   `xls`: Generates an Excel workbook (`.xlsx`).
    *   `csv`: Generates a CSV file (`.csv`).
*   `--targetpath <filepath>`: **Required**. The absolute or relative path and filename for the output report (e.g., `./output/schema.xlsx`).
*   `--sobjects <comma-separated-list>`: **Optional**. A comma-separated list of SObject API names (e.g., `Account,Contact,MyCustomObject__c`) to include in the export. If omitted, all accessible SObjects are considered.
*   `--customobjectsonly`: **Optional**. A boolean flag. If set, only custom SObjects (those ending with `__c`, `__mdt`, etc.) will be included in the export.
*   `--targetusername <username>`: **Required**. The Salesforce username or alias for the target organization from which to extract schema information.

### Data Extraction Process:

1.  **SObject Discovery**:
    *   Queries `EntityDefinition` to retrieve basic information about SObjects (e.g., `QualifiedApiName`, `Label`, `KeyPrefix`, `SharingModel`).
    *   Filters SObjects based on the `--sobjects` and `--customobjectsonly` flags.
2.  **Custom Object Metadata**:
    *   Fetches `CustomObject` metadata using the Salesforce Metadata API to get creation and last modification details (e.g., `createdByName`, `lastModifiedByName`).
3.  **Field Metadata**:
    *   Performs a `batchDescribe` call for the selected SObjects to retrieve detailed field properties (e.g., `apiName`, `label`, `dataType`, `length`, `nillable`, `unique`, `externalId`, `formula`, `defaultValue`, `encrypted`).
    *   Queries `FieldDefinition` via the Tooling API to gather additional field-level metadata such as `BusinessOwner`, `BusinessStatus` (Field Usage), `ComplianceGroup` (Compliance Categorization), `SecurityClassification` (Data Sensitivity Level), and `RelationshipName`.
4.  **Data Normalization**:
    *   Field data types are formatted for readability (e.g., `Text(255)`, `Picklist(Value1, Value2)`).
    *   Boolean values (e.g., `required`, `unique`) are translated to 'Yes'/'No'.
    *   Default values and formulas are captured.
    *   Object types (Standard, Custom, Platform Event, etc.) are determined based on API name suffixes.

### Report Generation:

The plugin supports two output formats:

#### 1. Excel Report (`.xlsx`)

*   **Summary Sheet**: A worksheet named "SObject" is created, providing a high-level overview of each exported SObject, including its type, API Name, Label, Sharing Models, and audit information.
*   **Individual SObject Sheets**: For each SObject, a dedicated worksheet is generated. This sheet lists all fields belonging to that SObject, along with their detailed metadata (API Name, Label, Data Type, Description, Help Text, Required, Unique, External ID, Formula, Default Value, Encrypted, Data Owner, Field Usage, Data Sensitivity Level, Compliance Categorization, Relationship Name, and Publisher).
*   **Worksheet Naming**: SObject API names are used as worksheet names. If an API name exceeds Excel's 31-character limit, it is truncated, and an index is appended to ensure uniqueness.

#### 2. CSV Report (`.csv`)

*   A single CSV file is generated containing all field metadata for all exported SObjects. Each row represents a field, and columns correspond to the field metadata attributes.
*   **Note**: Unlike the Excel report, the CSV output consolidates all SObject field data into one file, which may be less organized for large exports compared to the tabbed Excel output.

## Requirements for Further Development

This section outlines potential areas for enhancement and future development based on the current functionality.

1.  **Enhanced CSV Output**:
    *   Consider options for generating separate CSV files per SObject, similar to the Excel output's tabbed structure, to improve organization for large exports.
    *   Add an option to include the SObject summary data in a separate CSV or as part of the main CSV.
2.  **Metadata Filtering/Selection**:
    *   Allow users to specify which field metadata columns to include in the report, rather than always exporting all available columns. This would enable more focused reports.
    *   Implement filtering for fields based on criteria (e.g., only custom fields, only required fields).
3.  **Output Customization**:
    *   Provide options for custom styling or templates for the Excel output.
    *   Allow users to define custom headers or reorder columns in the output.
4.  **Performance Improvements**:
    *   For very large orgs or when exporting many SObjects, investigate potential performance bottlenecks in data extraction (e.g., optimizing SOQL queries, batching API calls more efficiently).
5.  **Error Handling and Reporting**:
    *   Improve user-friendly error messages for common issues (e.g., invalid SObject names, API limits).
    *   Provide a summary of any SObjects or fields that could not be processed.
6.  **Documentation**:
    *   Expand in-code documentation and JSDoc comments for better maintainability.
    *   Ensure the `README.md` is up-to-date with all features and usage examples.
7.  **Test Coverage**:
    *   Review and enhance unit and integration test coverage, especially for data extraction and report generation logic.
8.  **Additional Metadata Types**:
    *   Explore the possibility of exporting other metadata types beyond SObjects and fields (e.g., Validation Rules, Apex Classes, Flows).
9.  **User Interface (Optional)**:
    *   Consider a simple web-based UI or a VS Code extension for easier interaction and configuration, especially for non-CLI users.

## Implementation Improvements

This section outlines potential improvements to the existing codebase without altering current functionality.

1.  **Consistent Module Imports**: In `src/shared/csvReport.ts`, the `csv-writer` import uses `require`. For consistency with the rest of the TypeScript codebase, it should use an ES module `import` statement.
2.  **Centralize API Version**: The `_apiVersion` in `src/shared/metadataExport.ts` is hardcoded. Moving this to a configuration file or a constant would make it easier to manage and update.
3.  **Improve SOQL Query Readability**: In `src/shared/metadataExport.ts`, the SOQL queries are constructed using string concatenation. While functional, using template literals for multi-line queries and embedded expressions can improve readability.
4.  **Stronger Type Definitions**: The `metadata` and `sobject` objects passed around (e.g., `Map<string, object>`) are currently typed as generic `object`. Defining more specific TypeScript interfaces for these data structures would improve type safety, code clarity, and maintainability.
5.  **Refactor `formattedDataType`**: The `formattedDataType` function in `src/shared/metadataExport.ts` is quite long with multiple `if-else if` conditions. This could be refactored into smaller, more focused helper functions or a map-based approach to improve readability and make it easier to add new data type formatting rules.
6.  **Reduce Redundancy in Excel Report Headers**: In `src/shared/excelReport.ts`, both `headers()` and `sobjectHeaders()` perform similar mapping operations. A single, more generic helper function could be created to generate column definitions from different header maps, reducing code duplication.

## Project Structure Analysis

The project structure appears to be well-organized and follows common conventions for Salesforce CLI plugins built with `oclif` and TypeScript.

*   **Root Level**: Contains standard configuration files (`package.json`, `tsconfig.json`, `tslint.json`, `README.md`, `.gitignore`, `yarn.lock`) and CI/CD configurations (`appveyor.yml`, `.circleci/`). This is a typical and effective setup.
*   **`src/` Directory**: This is the main source code directory, which is standard.
    *   **`src/commands/`**: This structure is idiomatic for `oclif` commands, allowing for clear organization of CLI commands and their sub-topics (e.g., `mgk/schema/export.ts` for `sfdx mgk:schema:export`).
    *   **`src/lib/`**: Contains `sfdx.ts`. This is a reasonable place for general utility or library code.
    *   **`src/shared/`**: This is an excellent choice for housing shared logic like report generation (`csvReport.ts`, `excelReport.ts`, `report.ts`) and data export (`metadataExport.ts`, `exportSettings.ts`). The files are logically grouped and well-named.
*   **`messages/`**: Dedicated to message files (`mgk.json`), which is standard for Salesforce CLI plugins for internationalization.
*   **`bin/`**: Contains the executable scripts (`run`, `run.cmd`), typical for `oclif` projects.
*   **`test/`**: The standard location for tests, with `mocha.opts` and `tsconfig.json` indicating the testing setup.
*   **`.vscode/` and `.images/`**: These directories are for development environment configurations and documentation assets, respectively, and are appropriately placed.

**Minor Refinements (not structural issues):**

*   The `src/lib` directory name is generic. Depending on the contents of `sfdx.ts` and any future additions, it could potentially be renamed to something more specific like `src/utils` or `src/helpers` if it primarily contains utility functions. However, `lib` is also a widely accepted convention.

Overall, the project has a clear, maintainable, and appropriate structure for its purpose.
