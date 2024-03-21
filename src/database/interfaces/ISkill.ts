export default interface ISkill {
	id: number;
	itemId: number;
	auraId: number | null;
	name: string;
	animation: string;
	description: string;
	damage: number;
	mana: number;
	icon: string;
	range: number;
	dsrc: string;
	reference: string;
	target: string;
	effects: string;
	type: string;
	strl: string;
	cooldown: number;
	hitTargets: number;
}