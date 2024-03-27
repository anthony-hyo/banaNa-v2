export default class RequestArg {

	private readonly args: Array<string> = new Array<string>();

	public _length!: number;

	public get length(): number {
		return this._length;
	}

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

	public getBoolean(argIndex: number) {
		const strValue: string = this.getString(argIndex).toLowerCase();

		if (strValue == "true" || strValue == "1") {
			return true;
		} else if (strValue == "false" || strValue == "0") {
			return false;
		}

		throw new Error("Invalid boolean value: " + strValue);
	}

	public list(): Array<string> {
		return this.args;
	}

	public toString(): string {
		return this.list().toString();
	}

	private add(argObj: any): void {
		this.args.push(argObj.toString());
	}

}
