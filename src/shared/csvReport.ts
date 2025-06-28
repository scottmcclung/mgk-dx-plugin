import { createObjectCsvWriter } from 'csv-writer';
import {headerMap} from './exportSettings';

const getCsvHeaders = () => {
    return headerMap.map(column => {
        return {
            id: column.fieldDataKey,
            title: column.columnTitle
        };
    });
};

export default class CsvReport {
    public static async write(filePath: string, metadata) {
        const csvWriter = createObjectCsvWriter({
            path: `${filePath}.csv`,
            header: getCsvHeaders()
        });

        for (const sobject of metadata.values()) {
            await csvWriter.writeRecords(Array.from(sobject.fields.values()));
        }
    }
}
