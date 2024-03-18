import * as fs from "fs";

export default class Helper {

    public static padTo2Digits: (num: number) => string = (num: number) => num.toString().padStart(2, '0');

    public static formatDate(date: Date): string {
        return (
            [
                date.getFullYear(), Helper.padTo2Digits(date.getMonth() + 1), Helper.padTo2Digits(date.getDate())
            ].join('-') + ' ' +
            [
                Helper.padTo2Digits(date.getHours()), Helper.padTo2Digits(date.getMinutes()), Helper.padTo2Digits(date.getSeconds())
            ].join(':')
        );
    }

    public static joinOK = (roomId: number): string => `<msg t='sys'><body action='joinOK' r='${roomId}'><pid id='0'/><vars /><uLs r='${roomId}'>`;

    public static getAllFilesFromFolder(dir: string): Array<string> {
        let results: Array<string> = []

        fs.readdirSync(dir).forEach((file: string) => {
            file = dir + '/' + file

            const stat: any = fs.statSync(file)

            if (stat && stat.isDirectory()) {
                results = results.concat(Helper.getAllFilesFromFolder(file))
            } else {
                results.push(file)
            }
        })

        return results;
    }

    public static columnsToString(row: Record<string, any>): string {
        const keyValuePairs: string[] = [];

        for (const columnName in row) {
            if (Object.prototype.hasOwnProperty.call(row, columnName)) {
                const value = row[columnName];
                keyValuePairs.push(`${columnName}=${value}`);
            }
        }

        return keyValuePairs.join(',');
    }

}