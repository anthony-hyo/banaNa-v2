import type ISkill from "./ISkill.ts";

export default interface IClass {
	id: number;
	itemId: number;
	category: 'M1' | 'M2' | 'M3' | 'M4' | 'C1' | 'C2' | 'C3' | 'S1';
	description: string;
	manaRegenerationMethods: string;
	statsDescription: string;

	skills: Array<ISkill>;
}