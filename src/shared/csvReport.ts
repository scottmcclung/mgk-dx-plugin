const createCsvWriter = require('csv-writer').createObjectCsvWriter;
import {headerMap} from './exportSettings';

const headers = () => {
    return headerMap.map(column => {
        return {
            id: column.fieldDataKey,
            title: column.columnTitle
        };
    });
}

export default class CsvReport {
    public static async write(filePath: string, metadata: Map<string, object>) {
        const csvWriter = createCsvWriter({
            path: `${filePath}.csv`,
            header: headers()
        });

        for (const [key, sobject] of metadata.entries()) {
            await csvWriter.writeRecords(Array.from(sobject.fields.values()));
        }
    }
}
