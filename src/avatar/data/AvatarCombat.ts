import Avatar from "../Avatar.ts";
import type ISkill from "../../database/interfaces/ISkill.ts";
import SkillReference from "../helper/combat/skill/SkillReference.ts";
import SKillReference from "../helper/combat/skill/SkillReference.ts";
import AvatarTarget from "../helper/AvatarTarget.ts";
import JSONArray from "../../util/json/JSONArray.ts";
import JSONObject from "../../util/json/JSONObject.ts";
import Sarsa from "../helper/combat/Sarsa.ts";

export default class AvatarCombat {

	private readonly skills: Map<SkillReference, ISkill> = new Map<SkillReference, ISkill>();

	constructor(
		private readonly avatar: Avatar
	) {
	}

	public get skillAutoAttack(): ISkill | undefined {
		return this.skills.get(SKillReference.AUTO_ATTACK);
	}

	public get skillAttack1(): ISkill | undefined {
		return this.skills.get(SkillReference.ATTACK_1);
	}

	public get skillAttack2(): ISkill | undefined {
		return this.skills.get(SkillReference.ATTACK_2);
	}

	public get skillAttack3(): ISkill | undefined {
		return this.skills.get(SkillReference.ATTACK_3);
	}

	public get skillAttack4(): ISkill | undefined {
		return this.skills.get(SkillReference.ATTACK_4);
	}

	public get skillPassive1(): ISkill | undefined {
		return this.skills.get(SkillReference.PASSIVE_1);
	}

	public get skillPassive2(): ISkill | undefined {
		return this.skills.get(SkillReference.PASSIVE_2);
	}

	public get skillPotion(): ISkill | undefined {
		return this.skills.get(SkillReference.POTION);
	}

	public addSkill(skillReference: SkillReference, skill: ISkill): void {
		this.skills.set(skillReference, skill);
	}

	public invalidSkill(actionId: number): void {
		const target: AvatarTarget = AvatarTarget.parse(this.avatar);
		const targetString: string = target.toString;

		const damageResults: JSONArray = new JSONArray()
			.add(
				new JSONObject()
					.element("hp", 0)
					.element("type", "none")
					.element("cInf", targetString)
					.element("tInf", targetString)
			);

		const sarsa: Sarsa = new Sarsa(target, damageResults, actionId);

		this.avatar.writeObject(
			new JSONObject()
				.element("cmd", "ct")
				.element("sarsa", sarsa.data)
		);
	}


}
