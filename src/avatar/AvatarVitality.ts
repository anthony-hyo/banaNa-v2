export default class AvatarVitality {

	constructor(
		private _value: number,
		private _valueMax: number
	) {
	}

	public get value(): number {
		return this._value;
	}

	public get max(): number {
		return this._valueMax;
	}

	public set update(value: number) {
		this._value = Math.max(0, Math.min(value, this.max));
	}

	public set max(value: number) {
		this._valueMax = Math.max(0, this.max);
	}

	public increaseBy(amount: number): void {
		this.update += amount;
	}

	public decreaseBy(amount: number): void {
		this.update -= amount;
	}

	public increaseByPercent(percent: number): void {
		this.update += (this.max * percent) / 100;
	}

	public percentage(): number {
		return (this.value / this.max) * 100;
	}

	public isFull(): boolean {
		return this.value >= this.max;
	}

	public resetToFull(): void {
		this.update = this.max;
	}

}
