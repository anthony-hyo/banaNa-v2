import type IClassSkill from "./IClassSkill.ts";
import type ISkillAura from "./ISkillAura.ts";

export default interface ISkill {
	id: number;

	name: string;
	description: string;

	icon: string;

	damage: string;
	mana: number;
	cooldown: number;
	range: number;

	reference: 'aa' | 'a1' | 'a2' | 'a3' | 'a4' | 'p1' | 'p2' | 'i1';
	type: 'aa' | 'passive' | 'i' | 'p' | 'm' | 'mp' | 'pm';
	target: 's' | 'h' | 'f';

	animation: string;
	effectName: string;
	effectType: '' | 'w' | 'p' | 'c';

	hitTargets: number;

	dateUpdated: Date;
	dateCreated: Date;

	classesSkills?: Array<IClassSkill>;
	auras?: Array<ISkillAura>;
}