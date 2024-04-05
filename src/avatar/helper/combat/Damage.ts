import type Avatar from "../../Avatar.ts";
import type ISkill from "../../../database/interfaces/ISkill.ts";
import CoreValues from "../../../aqw/CoreValues.ts";
import AvatarType from "../AvatarType.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import AvatarTarget from "../AvatarTarget.ts";
import SkillType from "./skill/SkillType.ts";

export default class Damage {

	private static readonly miss: string[] = ["s", "f"];

	private readonly type: string;
	private readonly damage: number;

	private readonly source: Avatar;
	private readonly target: Avatar;

	private readonly skill: ISkill;

	constructor(skill: ISkill, source: Avatar, target: Avatar, bounce: number) {
		this.skill = skill;

		this.source = source;
		this.target = target;

		this.damage = this.generateDamage();

		const criticalChance: number = source.stats.get$tcr;
		const dodgeChance: number = Math.min(target.stats.get$tdo, target.stats.get$sbm);
		const missChance: number = 1 - (1 - CoreValues.getValue("baseMiss") + source.stats.get$thi);
		const blockChance: number = Math.min(target.stats.get$tbl, target.stats.get$sbm);

		const crit: boolean = Math.random() < criticalChance;
		const dodge: boolean = Math.random() < dodgeChance;
		const miss: boolean = Math.random() < missChance;
		const block: boolean = Math.random() < blockChance;

		if (this.damage === 0) {
			this.type = "none";
		} else if (this.damage > 0 && dodge && !Damage.miss.includes(skill.target)) {
			this.damage = 0;
			this.type = "dodge";
		} else if (this.damage > 0 && miss && !Damage.miss.includes(skill.target) && source.type == AvatarType.PLAYER) {
			this.damage = 0;
			this.type = "miss";
		} else if (block) {
			this.damage = 0;
			this.type = "block";
		} else if (crit) {
			this.damage = Math.floor(this.damage * source.stats.get$scm);
			this.type = "crit";
		} else {
			this.type = "hit";
		}

		//TODO: Auras

		//source.attack(target, damage);
	}

	public damageResult(): JSONObject {
		return new JSONObject()
			.element("hp", this.damage)
			.element("type", this.damage === 0 && !Damage.miss.includes(this.skill.target) ? "miss" : this.type)
			.element("cInf", AvatarTarget.parse(this.source).toString)
			.element("tInf", AvatarTarget.parse(this.target).toString);
	}

	public generateDamage(): number {
		let min: number = 0;
		let max: number = 0;

		switch (this.skill.type) {
			case SkillType.AUTO_ATTACK:
			case SkillType.PHYSICAL:
				max = this.source.stats.maximumPhysicalDamage;
				min = this.source.stats.minimumPhysicalDamage;
				break;
			case SkillType.MAGIC:
				max = this.source.stats.maximumMagicDamage;
				min = this.source.stats.minimumMagicDamage;
				break;
			case SkillType.PHYSICAL_MAGIC:
				max = (this.source.stats.maximumPhysicalDamage >> 1) + this.source.stats.maximumMagicDamage;
				min = (this.source.stats.minimumPhysicalDamage >> 1) + this.source.stats.minimumMagicDamage;
				break;
			case SkillType.MAGIC_PHYSICAL:
				max = (this.source.stats.maximumMagicDamage >> 1) + this.source.stats.maximumPhysicalDamage;
				min = (this.source.stats.minimumMagicDamage >> 1) + this.source.stats.minimumPhysicalDamage;
				break;
		}

		const delta: number = 1 + Math.abs(max - min);
		return Math.floor((Math.random() * delta + min) * this.damage);
	}

}
