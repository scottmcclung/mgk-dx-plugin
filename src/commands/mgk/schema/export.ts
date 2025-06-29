import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import MetadataExport from '../../../shared/metadataExport';
import Report from '../../../shared/report';
import { Validator } from '../../../shared/validator';
import { ValidationError, SalesforceConnectionError } from '../../../errors';

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('mgk-dx-plugin', 'mgk');

export default class MgkSchemaExport extends SfdxCommand {
  public static description = messages.getMessage('schema.export.description');

  public static examples = [
    '$ sfdx mgk:schema:export --format xls --targetpath ./dir/example-filename.xls --targetusername myOrg@example.com',
    '$ sfdx mgk:schema:export --format xls --targetpath ./dir/example-filename.xls --customobjectsonly --targetusername myOrg@example.com',
    '$ sfdx mgk:schema:export --sobjects=Account --format xls --targetpath ./dir/example-filename.xls --targetusername myOrg@example.com',
    '$ sfdx mgk:schema:export --sobjects=Account,Case,Opportunity,MyCustomObject__c --format xls --targetpath ./dir/example-filename.xls --targetusername myOrg@example.com',
  ];

  public static readonly flagsConfig: FlagsConfig = {
    format: flags.enum({
      char: 'f',
      description: messages.getMessage('schema.export.flags.format'),
      required: true,
      options: ['xls', 'csv'],
    }),
    targetpath: flags.filepath({
      char: 'p',
      description: messages.getMessage('schema.export.flags.path'),
      required: true,
    }),
    sobjects: flags.array({
      char: 's',
      description: messages.getMessage('schema.export.flags.sobject'),
      required: false,
    }),
    customobjectsonly: flags.boolean({
      description: messages.getMessage('schema.export.flags.customObjectsOnly'),
      required: false,
    }),
  };

  protected static requiresUsername = true;

  public async run() {
    try {
      const org = this.org;
      if (!org) {
        throw new SalesforceConnectionError(
          'No target org specified. Please specify a target org using --targetusername or set a default org.',
        );
      }

      const format = this.flags.format;
      const sobjects = this.flags.sobjects;
      const targetPath = this.flags.targetpath;
      const customObjectsOnly = this.flags.customobjectsonly;

      // Validate command options
      try {
        Validator.validateCommandOptions({
          format,
          targetpath: targetPath,
          sobjects,
        });
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new Error(`Invalid command options: ${error.message}`);
        }
        throw error;
      }

      const metadataExport = new MetadataExport({ org, sobjects, customObjectsOnly });
      const metadata: Map<string, object> = await metadataExport.getExport();

      if (metadata.size > 0) {
        await Report.write(format, targetPath, metadata);
        this.ux.log(`Successfully exported ${metadata.size} objects to ${targetPath}`);
      } else {
        this.ux.warn('No results were found');
      }
    } catch (error) {
      // Handle specific error types with appropriate messages
      if (error instanceof SalesforceConnectionError) {
        this.ux.error(`Connection error: ${error.message}`);
      } else if (error instanceof ValidationError) {
        this.ux.error(`Validation error: ${error.message}`);
      } else {
        // Let SFDX handle other errors
        throw error;
      }
    }
  }
}
