import type ISkill from "./ISkill.ts";
import type ITypeStat from "./ITypeStat.ts";

export default interface ISkillAuraEffect {
	id: number;

	skillAuraId: number;

	typeStatId: number;

	target: 's' | 'h' | 'f';

	value: number;

	type: '+' | '-' | '*';

	dateUpdated: Date;
	dateCreated: Date;

	skillAura?: ISkill;
	typeStat?: ITypeStat;
}