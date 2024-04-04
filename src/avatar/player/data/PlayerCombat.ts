import Player from "../Player.ts";
import AvatarCombat from "../../data/AvatarCombat.ts";
import type IUserInventory from "../../../database/interfaces/IUserInventory.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import JSONArray from "../../../util/json/JSONArray.ts";
import {Rank} from "../../../aqw/Rank.ts";
import type ISkill from "../../../database/interfaces/ISkill.ts";
import SkillReference from "../../../util/SkillReference.ts";

export default class PlayerCombat extends AvatarCombat {

	private static readonly potion: JSONObject = new JSONObject()
		.element("anim", "Cheer")
		.element("cd", "" + 60000)
		.element("desc", "Equip a potion or scroll from your inventory to use it here.")
		.element("fx", "")
		.element("icon", "icu1")
		.element("isOK", 1)
		.element("mp", "" + 0)
		.element("nam", "Potions")
		.element("range", 808)
		.element("ref", "i1")
		.element("str1", "")
		.element("tgt", "f")
		.element("typ", "i");

	private static readonly emptyAuras: JSONArray = new JSONArray()
		.add(new JSONObject());

	constructor(
		private readonly player: Player
	) {
		super(player);
	}

	public updateClass(equippedClass: IUserInventory): void {
		const updateClass: JSONObject = new JSONObject()
			.element("cmd", "updateClass")
			.element("iCP", equippedClass.quantity)
			.element("sClassCat", equippedClass.item!.class!.category)
			.element("sClassName", equippedClass.item!.name)
			.element("uid", this.player.avatarId);

		this.player.room?.writeObjectExcept(this.player, updateClass);

		updateClass
			.element("sDesc", equippedClass.item!.class!.description)
			.element("sStats", equippedClass.item!.class!.statsDescription);

		if (equippedClass.item!.class!.manaRegenerationMethods.includes(":")) {
			const aMRM: JSONArray = new JSONArray();

			for (const s of equippedClass.item!.class!.manaRegenerationMethods.split(",")) {
				aMRM.add(s + "\r");
			}

			updateClass.element("aMRM", aMRM);
		} else {
			updateClass.element("aMRM", equippedClass.item!.class!.manaRegenerationMethods);
		}

		this.player.writeObject(updateClass);

		this.loadSkills();
	}

	public loadSkills(): void {
		const equippedClass: IUserInventory | undefined = this.player.inventory.equippedClass;

		if (!equippedClass) {
			this.player.kick('[loadSkills] equipped class is undefined');
			return;
		}

		const rank: number = Rank.getRankFromPoints(equippedClass.quantity);

		const active: JSONArray = new JSONArray();
		const passive: JSONArray = new JSONArray();

		const auras: JSONArray = new JSONArray();

		for (const classSkill of equippedClass.item!.class!.skills!) {
			const skill: ISkill = classSkill.skill!;

			this.addSkill(<SkillReference>skill.reference, skill);

			const jsonObject: JSONObject = new JSONObject()
				.element("auras", PlayerCombat.emptyAuras)
				.element("desc", skill.description)
				.element("fx", skill.type)
				.element("icon", skill.icon)
				.element("id", skill.id)
				.element("nam", skill.name)
				.element("range", skill.range)
				.element("ref", skill.reference)
				.element("tgt", skill.target)
				.element("typ", skill.type);

			switch (skill.type) {
				case "passive":
					const isOK: boolean = rank >= 4;

					passive.add(
						jsonObject
							.element("isOK", isOK)
					);

					if (isOK) {
						const aurasEffects: JSONArray = new JSONArray();

						for (const aura of skill.auras!) {
							for (const effect of aura.effects!) {
								aurasEffects.add(
									new JSONObject()
										.element("id", effect.id)
										.element("sta", effect.typeStat!.stat)
										.element("typ", effect.type)
										.element("val", effect.value)
								);
							}
						}

						auras.add(
							new JSONObject()
								.element("nam", skill.name)
								.element("e", aurasEffects)
						);
					}
					break;
				default:
					jsonObject
						.element("anim", skill.animation)
						.element("cd", String(skill.cooldown))
						.element("damage", skill.damage)
						.element("dsrc", '')
						.elementIf(skill.effectName.length != 0, "strl", skill.effectName)
						.element("isOK", true)
						.element("mp", skill.mana)
						.element("tgtMax", skill.hitTargets)
						.element("tgtMin", "1");

					switch (skill.reference) {
						case SkillReference.AUTO_ATTACK:
							active.element(
								0,
								jsonObject
									.element("auto", true)
							);
							break;
						case SkillReference.ATTACK_1:
							active.element(1, jsonObject);
							break;
						case SkillReference.ATTACK_2:
							active.element(
								2,
								jsonObject
									.elementIf(rank < 2, "isOK", false)
							);
							break;
						case SkillReference.ATTACK_3:
							active.element(
								3,
								jsonObject
									.elementIf(rank < 3, "isOK", false)
							);
							break;
						case SkillReference.ATTACK_4:
							active.element(
								4,
								jsonObject
									.elementIf(rank < 5, "isOK", false)
							);
							break;
					}
					break;
			}
		}

		active.element(5, PlayerCombat.potion);

		if (auras.size > 0) {
			this.player.writeObject(
				new JSONObject()
					.element("cmd", "aura+p")
					.element("tInf", `p:${this.player.avatarId}`)
					.element("auras", auras)
			);
		}

		//this.clearAuras(user);

		this.player.writeObject(
			new JSONObject()
				.element("cmd", "sAct")
				.element(
					"actions",
					new JSONObject()
						.element("active", active)
						.element("passive", passive)
				)
		);
	}

}