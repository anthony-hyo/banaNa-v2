export default class Random {

	constructor(
		private seed: number
	) {
	}

	public nextInt(max: number): number {
		this.seed = (this.seed * 9301 + 49297) % 233280;
		return Math.floor(this.seed / 233280 * max);
	}

	public static minMax(min: number, max: number): number {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

}
