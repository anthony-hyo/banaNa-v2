export default class PlayerPosition {

	private _frame: string = 'Enter';

	public get frame(): string {
		return this._frame;
	}

	public set frame(value: string) {
		this._frame = value;
	}

	private _pad: string = 'Spawn';

	public get pad(): string {
		return this._pad;
	}

	public set pad(value: string) {
		this._pad = value;
	}

	private _xAxis: number = 0;

	public get xAxis(): number {
		return this._xAxis;
	}

	public set xAxis(value: number) {
		this._xAxis = value;
	}

	private _yAxis: number = 0;

	public get yAxis(): number {
		return this._yAxis;
	}

	public set yAxis(value: number) {
		this._yAxis = value;
	}

}