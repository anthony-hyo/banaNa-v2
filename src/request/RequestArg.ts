export default class RequestArg {

    public length!: number

    private readonly args: Array<string> = new Array<string>()

    public static parse(params: string[]): RequestArg {
        const arg: RequestArg = new RequestArg()

        params.forEach((param: string) => arg.add(!isNaN(parseInt(param)) ? parseInt(param) : param))

        arg.length = arg.list().length

        return arg
    }

    public getInt = (argIndex: number): number => parseInt(this.args[argIndex].valueOf());

    public getStr = (argIndex: number): string => this.args[argIndex].valueOf();

    public list = (): Array<string> => this.args;

    public toString = (): string => this.list().toString();

    private add(argObj: any): void {
        this.args.push(argObj.toString())
    }

}
