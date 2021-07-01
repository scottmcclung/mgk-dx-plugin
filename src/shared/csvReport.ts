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
    public static async write(filePath: string, metadata) {
        const csvWriter = createCsvWriter({
            path: `${filePath}.csv`,
            header: headers()
        });

        for (const sobject of metadata.values()) {
            await csvWriter.writeRecords(Array.from(sobject.fields.values()));
        }
    }
}
