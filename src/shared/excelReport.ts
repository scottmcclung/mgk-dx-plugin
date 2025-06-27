import {Workbook} from 'exceljs';
import {headerMap, summaryHeaderMap} from './exportSettings';

const getFieldHeaders = () => {
    return headerMap.map(column => {
        return {
            key:    column.fieldDataKey,
            header: column.columnTitle,
            width:  column.width,
            style:  column.style
        };
    });
};

const sobjectHeaders = () => {
    return summaryHeaderMap.map(column => {
        return {
            key:    column.fieldDataKey,
            header: column.columnTitle,
            width:  column.width,
            style:  column.style
        };
    });
};

const getWorksheet = (workbook: Workbook, name: string, headers: object[]) => {
    const worksheet = workbook.addWorksheet(name);
    worksheet.columns = headers;

    worksheet.views = [
        {state: 'frozen', ySplit: 1}
    ];
    return worksheet;
};

const generateObjectSummaryWorksheet = (workbook: Workbook, metadata: Map<string, object>) => {
    const worksheet = getWorksheet(workbook, 'SObject', sobjectHeaders());
    worksheet.autoFilter = {
        from: 'A1',
        to:   'N1'
    };
    for (const sobject of metadata.values()) {
        worksheet.addRow({...sobject});
    }
};

const generateObjectWorksheets = (workbook: Workbook, worksheetName: string, worksheetData) => {
    if (worksheetData.fields) {
        const worksheet = getWorksheet(workbook, worksheetName, getFieldHeaders());
        worksheet.autoFilter = {
            from: 'A1',
            to:   'S1'
        };
        for (const field of worksheetData.fields.values()) {
            worksheet.addRow({...field});
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
        Array
            .from(metadata)
            .map((value, index) => {
                if (value[0].length <= 31) return value;
                const length = 31 - index.toString().length;
                value[0] = value[0].substr(0, length) + index.toString();
                return value;
            })
    );
};

export default class ExcelReport {
    public static async write(filePath: string, metadata: Map<string, object>) {
        const workbook = new Workbook();
        generateObjectSummaryWorksheet(workbook, metadata);
        for (const [key, sobject] of generateMetadataWithShortObjectNames(metadata).entries()) {
            generateObjectWorksheets(workbook, key, sobject);
        }
        await workbook.xlsx.writeFile(`${filePath}.xlsx`);
    }
}
