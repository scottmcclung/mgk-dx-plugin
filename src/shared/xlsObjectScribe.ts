const Excel = require('exceljs');
import {headerMap} from './exportSettings';

const headers = () => {
  return headerMap.map(column => {
    return {
      key: column.fieldDataKey,
      header: column.columnTitle
    };
  });
};

export default class XlsObjectScribe {
  public static write(filePath: string, metadata: any[]) {
    const workbook = new Excel.Workbook();

    metadata.forEach(sobject => {
      const worksheet = workbook.addWorksheet(sobject.name);
      worksheet.columns = headers();

      sobject.fields.forEach(field => {
        worksheet.addRow({...field});
      });
    });

    workbook.xlsx.writeFile(`${filePath}.xlsx`);
  }
}
