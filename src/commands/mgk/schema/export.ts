import {flags, FlagsConfig, SfdxCommand} from '@salesforce/command';
import {Messages} from '@salesforce/core';
import MetadataExport from '../../../shared/metadataExport';
import Report from "../../../shared/report";

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('mgk-dx-plugin', 'mgk');

export default class MgkSchemaExport extends SfdxCommand {

    public static description = messages.getMessage('schema.export.description');

    public static examples = [
        `$ sfdx mgk:schema:export --format xls --targetpath ./dir/example-filename.xls --targetusername myOrg@example.com `,
        `$ sfdx mgk:schema:export --format xls --targetpath ./dir/example-filename.xls --customobjectsonly --targetusername myOrg@example.com `,
        `$ sfdx mgk:schema:export --sobject Account --format xls --targetpath ./dir/example-filename.xls --targetusername myOrg@example.com`,
        `$ sfdx mgk:schema:export --sobject Account,Case,Opportunity,MyCustomObject__c --format xls --targetpath ./dir/example-filename.xls --targetusername myOrg@example.com`
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

    public async run() {
        const org = this.org;
        const format = this.flags.format;
        const sobjects = this.flags.sobjects;
        const targetPath = this.flags.targetpath;
        const customObjectsOnly = this.flags.customobjectsonly;

        const metadataExport = new MetadataExport({org, sobjects, customObjectsOnly});
        const metadata: Map<string,object> = await metadataExport.getExport();
        if(metadata.size > 0) {
            Report.write(format, targetPath, metadata);
        } else {
            console.log('No results were found');
        }
    }
}
