import type IEnhancementPattern from "./IEnhancementPattern.ts";

export default interface IEnhancement {
	id: number;
	name: string;
	patternId: number;
	rarity: number;
	dps: number;
	level: number;

	pattern: IEnhancementPattern;
}