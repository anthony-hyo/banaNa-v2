import type IItem from "./IItem.ts";
import type IClassSkill from "./IClassSkill.ts";

export default interface IClass {
	id: number;

	category: 'M1' | 'M2' | 'M3' | 'M4' | 'C1' | 'C2' | 'C3' | 'S1';

	description: string;
	manaRegenerationMethods: string;
	statsDescription: string;

	item?: IItem;
	skills?: Array<IClassSkill>;
}