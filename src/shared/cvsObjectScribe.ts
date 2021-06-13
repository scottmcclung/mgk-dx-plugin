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

export default class CvsObjectScribe {
  public static async   write(filepath, metadata) {
    const csvWriter = createCsvWriter({
      path: `${filePath}.csv`,
      header: headers()
    });

    for (const sobject of metadata) {
      await csvWriter.writeRecords(sobject.fields);
    }
  }
}
