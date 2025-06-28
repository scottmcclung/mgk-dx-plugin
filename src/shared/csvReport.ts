import { createObjectCsvWriter } from 'csv-writer';
import { headerMap } from './exportSettings';
import { addFileExtension } from '../utils/stringUtils';
import { FILE_EXTENSIONS } from '../config/constants';

const getCsvHeaders = () => {
  return headerMap.map((column) => {
    return {
      id: column.fieldDataKey,
      title: column.columnTitle,
    };
  });
};

export default class CsvReport {
  public static async write(filePath: string, metadata: Map<string, { fields?: Map<string, object> }>) {
    const fullPath = addFileExtension(filePath, FILE_EXTENSIONS.CSV);
    const csvWriter = createObjectCsvWriter({
      path: fullPath,
      header: getCsvHeaders(),
    });

    for (const sobject of metadata.values()) {
      if (sobject.fields) {
        await csvWriter.writeRecords(Array.from(sobject.fields.values()));
      }
    }
  }
}
