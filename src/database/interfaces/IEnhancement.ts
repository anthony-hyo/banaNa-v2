import type IEnhancementPattern from "./IEnhancementPattern.ts";

export default interface IEnhancement {
	id: number;
	name: string;
	patternId: number;
	rarity: number;
	damage_per_second: number;
	level: number;

	pattern?: IEnhancementPattern;
}