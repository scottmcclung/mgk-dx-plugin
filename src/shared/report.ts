import CsvReport from './csvReport';
import ExcelReport from './excelReport';

export default class Report {
    public static async write(format: string, filePath: string, metadata: Map<string, object>) {
        switch (format) {
            case 'csv':
                await CsvReport.write(filePath, metadata);
                break;
            default:
                await ExcelReport.write(filePath, metadata);
                break;
        }
    }
}
