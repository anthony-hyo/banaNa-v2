export default class AvatarPosition {

	private _frame: string = 'Enter';
	private _pad: string = 'Spawn';

	private _xAxis: number = 0;
	private _yAxis: number = 0;

	public get frame(): string {
		return this._frame;
	}

	public set frame(value: string) {
		this._frame = value;
	}

	public get pad(): string {
		return this._pad;
	}

	public set pad(value: string) {
		this._pad = value;
	}

	public get xAxis(): number {
		return this._xAxis;
	}

	public set xAxis(value: number) {
		this._xAxis = value;
	}

	public get yAxis(): number {
		return this._yAxis;
	}

	public set yAxis(value: number) {
		this._yAxis = value;
	}

}