export default class RequestArg {

    public _length!: number;

    private readonly args: Array<string> = new Array<string>();

    public static parse(params: string[]): RequestArg {
        const arg: RequestArg = new RequestArg();

        params.forEach((param: string) => arg.add(!isNaN(parseInt(param)) ? parseInt(param) : param));

        arg._length = arg.list().length;

        return arg;
    }

    public getNumber(argIndex: number): number {
        return parseInt(this.args[argIndex].valueOf());
    }

    public getString(argIndex: number): string {
        return this.args[argIndex].valueOf();
    }

    public list(): Array<string> {
        return this.args;
    }

    public get length(): number {
        return this._length;
    }

    public toString(): string {
        return this.list().toString();
    }

    private add(argObj: any): void {
        this.args.push(argObj.toString());
    }

}
