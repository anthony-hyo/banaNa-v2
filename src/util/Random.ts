export default class Random {
	private seed: number;

	constructor(seed: number) {
		this.seed = seed;
	}

	nextInt(max: number): number {
		this.seed = (this.seed * 9301 + 49297) % 233280;
		return Math.floor(this.seed / 233280 * max);
	}
}
