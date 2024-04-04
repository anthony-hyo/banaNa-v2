import type ISkill from "./ISkill.ts";
import type ISkillAuraEffect from "./ISkillAuraEffect.ts";

export default interface ISkillAura {
	id: number;

	name: string;

	skillId: number;

	target: 's' | 'h' | 'f';

	maxStack: number;
	duration: number;

	dateUpdated: Date;
	dateCreated: Date;

	skill?: ISkill;

	effects?: Array<ISkillAuraEffect>;
}