export class Quests {

    public static lookAtValue(questString: string, index: number): number {
        return parseInt(questString.charAt(index), 36);
    }

    public static updateValue(questString: string, index: number, value: number): string {
        let val: string;
        if (value >= 0 && value < 10) {
            val = String(value);
        } else if (value >= 10 && value < 36) {
            val = String.fromCharCode(value + 55);
        } else {
            val = "0";
        }

        return Quests.strSetCharAt(questString, index, val);
    }

    public static fromCharCode(...codePoints: number[]): string {
        return String.fromCharCode(...codePoints);
    }

    private static strSetCharAt(_arg1: string, _arg2: number, _arg3: string): string {
        return _arg1.substring(0, _arg2) + _arg3 + _arg1.substring(_arg2 + 1);
    }

}
