import ExcelReport from "./excelReport";
import CsvReport from "./csvReport";

export default class Report {
    public static write(format: string, filePath: string, metadata: Map<string, object>) {
        switch (format) {
            case 'csv':
                CsvReport.write(filePath, metadata);
                break;
            default:
                ExcelReport.write(filePath, metadata);
                break;
        }
    }
}
