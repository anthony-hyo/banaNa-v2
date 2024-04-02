export default class PlayerPosition {

	private _x: number = 0;
	private _y: number = 0;

	public get x(): number {
		return this._x;
	}

	public get y(): number {
		return this._y;
	}

	public move(x: number, y: number) {
		this._x = x;
		this._y = y;
	}

}