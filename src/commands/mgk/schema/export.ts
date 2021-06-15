import {flags, FlagsConfig, SfdxCommand} from '@salesforce/command';
import {Messages} from '@salesforce/core';
import {AnyJson} from '@salesforce/ts-types';
import CvsObjectScribe from '../../../shared/cvsObjectScribe';
import {MetadataExport} from '../../../shared/metadataExport';
import XlsObjectScribe from '../../../shared/xlsObjectScribe';

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('schema', 'mgk');

export default class MgkSchemaExport extends SfdxCommand {

  public static description = messages.getMessage('schema.export.description');

  public static examples = [
    `$ sfdx mgk:schema:export --format xls --targetpath ./dir/example-filename.xls --targetusername myOrg@example.com `,
    `$ sfdx mgk:schema:export --sobject Account --format xls --targetpath ./dir/example-filename.xls --targetusername myOrg@example.com`,
    `$ sfdx mgk:schema:export -sobject Account,Case,Opportuntiy -format xls --targetpath ./dir/example-filename.xls --targetusername myOrg@example.com`
  ];

  public static readonly flagsConfig: FlagsConfig = {
    format: flags.enum({
      char: 'f',
      description: messages.getMessage('schema.export.flags.format'),
      required: true,
      options: [
        'xls', 'csv',
      ]
    }),
    targetpath: flags.filepath({
      char: 'p',
      description: messages.getMessage('schema.export.flags.path'),
      required: true
    }),
    sobjects: flags.array({
      char: 's',
      description: messages.getMessage('schema.export.flags.sobject'),
      required: false
    }),
    customobjectsonly: flags.boolean({
      description: messages.getMessage('schema.export.flags.customObjectsOnly'),
      required: false
    })
  };

  protected static requiresUsername = true;

  public async run(): Promise<AnyJson> {
    const metadataExport = new MetadataExport({
      org: this.org,
      sobjects: this.flags.sobjects,
      customObjectsOnly: this.flags.customobjectsonly
    });
    const metadata = await metadataExport.getExport();
    this.outputToFile(metadata);
  }

  protected async outputToFile(metadata) {
    switch (this.flags.format) {
      case 'xls':
        XlsObjectScribe.write(this.flags.targetpath, metadata);
        break;
      case 'csv':
        CvsObjectScribe.write(this.flags.targetpath, metadata);
        break;
      default:
    }
  }
}
