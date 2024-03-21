import type IEnhancement from "./IEnhancement.ts";

export default interface IEnhancementPattern {
	id: number;
	name: string;
	category: 'M1' | 'M2' | 'M3' | 'M4' | 'C1' | 'C2' | 'C3' | 'S1';
	wisdom: number;
	strength: number;
	luck: number;
	dexterity: number;
	endurance: number;
	intelligence: number;

	enhancement: IEnhancement;
}

export interface EnhancementPatternStat {
	WIS: number;
	STR: number;
	LCK: number;
	DEX: number;
	END: number;
	INT: number;
}