import CsvReport from './csvReport';
import ExcelReport from './excelReport';
import { EXPORT_FORMATS } from '../config/constants';

export default class Report {
  public static async write(format: string, filePath: string, metadata: Map<string, object>): Promise<void> {
    switch (format) {
      case EXPORT_FORMATS.CSV:
        await CsvReport.write(filePath, metadata);
        break;
      case EXPORT_FORMATS.EXCEL:
      default:
        await ExcelReport.write(filePath, metadata);
        break;
    }
  }
}
