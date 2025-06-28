import { Workbook } from 'exceljs';
import { headerMap, summaryHeaderMap } from './exportSettings';
import { truncateWithIndex, addFileExtension } from '../utils/stringUtils';
import { EXCEL_CONSTRAINTS, FILE_EXTENSIONS } from '../config/constants';
import { WORKSHEET_VIEW, AUTO_FILTER_RANGES } from '../config/styles';

const getFieldHeaders = () => {
  return headerMap.map((column) => {
    return {
      key: column.fieldDataKey,
      header: column.columnTitle,
      width: column.width,
      style: column.style,
    };
  });
};

const sobjectHeaders = () => {
  return summaryHeaderMap.map((column) => {
    return {
      key: column.fieldDataKey,
      header: column.columnTitle,
      width: column.width,
      style: column.style,
    };
  });
};

const getWorksheet = (workbook: Workbook, name: string, headers: object[]) => {
  const worksheet = workbook.addWorksheet(name);
  worksheet.columns = headers;

  worksheet.views = [WORKSHEET_VIEW];
  return worksheet;
};

const generateObjectSummaryWorksheet = (workbook: Workbook, metadata: Map<string, object>) => {
  const worksheet = getWorksheet(workbook, 'SObject', sobjectHeaders());
  worksheet.autoFilter = AUTO_FILTER_RANGES.sobject;
  for (const sobject of metadata.values()) {
    worksheet.addRow({ ...sobject });
  }
};

const generateObjectWorksheets = (workbook: Workbook, worksheetName: string, worksheetData) => {
  if (worksheetData.fields) {
    const worksheet = getWorksheet(workbook, worksheetName, getFieldHeaders());
    worksheet.autoFilter = AUTO_FILTER_RANGES.field;
    for (const field of worksheetData.fields.values()) {
      worksheet.addRow({ ...field });
    }
  }
};

/**
 * Excel has a 31 char limit on worksheet names
 * This generates a new map of the metadata with the keys shortened to 31 char.
 * To avoid duplicate worksheet names we're appending an index number to the
 * shortened name.
 */
const generateMetadataWithShortObjectNames = (metadata: Map<string, object>) => {
  return new Map(
    Array.from(metadata).map((value, index) => {
      const key =
        value[0].length <= EXCEL_CONSTRAINTS.MAX_WORKSHEET_NAME_LENGTH
          ? value[0]
          : truncateWithIndex(value[0], EXCEL_CONSTRAINTS.MAX_WORKSHEET_NAME_LENGTH, index);
      return [key, value[1]];
    }),
  );
};

export default class ExcelReport {
  public static createWorkbook(): Workbook {
    return new Workbook();
  }

  public static async write(filePath: string, metadata: Map<string, object>) {
    const workbook = ExcelReport.createWorkbook();
    generateObjectSummaryWorksheet(workbook, metadata);
    for (const [key, sobject] of generateMetadataWithShortObjectNames(metadata).entries()) {
      generateObjectWorksheets(workbook, key, sobject);
    }
    const fullPath = addFileExtension(filePath, FILE_EXTENSIONS.EXCEL);
    await workbook.xlsx.writeFile(fullPath);
  }
}
