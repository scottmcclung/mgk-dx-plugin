import {Workbook} from "exceljs";
// const Excel = require('exceljs');
import {headerMap, summaryHeaderMap} from './exportSettings';

const headers = () => {
  return headerMap.map(column => {
    return {
      key: column.fieldDataKey,
      header: column.columnTitle,
      width: column.width,
      style: column.style
    };
  });
};

const sobjectHeaders = () => {
  return summaryHeaderMap.map(column => {
    return {
      key: column.fieldDataKey,
      header: column.columnTitle,
      width: column.width,
      style: column.style
    };
  });
}

const getWorksheet = (workbook: Workbook, name: string, headers: object[]) => {
  const worksheet = workbook.addWorksheet(name);
  worksheet.columns = headers;
  worksheet.autoFilter = {
    from: 'A1',
    to: 'I1',
  };
  worksheet.views = [
    {state: 'frozen', ySplit: 1}
  ];
  return worksheet;
}

const generateObjectSummaryWorksheet = (workbook: Workbook, metadata: Map<string, object>) => {
  const worksheet = getWorksheet(workbook, 'SObject', sobjectHeaders());
  for (const [key, sobject] of metadata.entries()) {
    worksheet.addRow({...sobject});
  }
}

const generateObjectWorksheets = (workbook: Workbook, worksheetName: string, worksheetData: object) => {
  if (worksheetData.fields) {
    const worksheet = getWorksheet(workbook, worksheetName, headers());
    for (const field of worksheetData.fields.values()) {
      worksheet.addRow({...field});
    }
  }
}

export default class ExcelReport {
  public static write(filePath: string, metadata: Map<string, object>) {
    const workbook = new Workbook();
    generateObjectSummaryWorksheet(workbook, metadata);
    for (const [key, sobject] of metadata.entries()) {
      generateObjectWorksheets(workbook, key, sobject);
    }
    workbook.xlsx.writeFile(`${filePath}.xlsx`);
  }
}
