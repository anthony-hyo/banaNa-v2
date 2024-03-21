import Player from "./Player.ts";
import PlayerConst from "../player/PlayerConst.ts";
import {Rank} from "../aqw/Rank.ts";
import type IItem from "../database/interfaces/IItem.ts";
import type ISkill from "../database/interfaces/ISkill.ts";
import JSONArray from "../util/json/JSONArray.ts";
import JSONObject from "../util/json/JSONObject.ts";

export default class PlayerEquipment {

	constructor(private readonly player: Player, private readonly properties: Map<string, any>) {
	}

	public updateClass(player: Player, item: IItem, classPoints: number): void {
		const updateClass: JSONObject = new JSONObject();

		updateClass.put("cmd", "updateClass");
		updateClass.put("iCP", classPoints);
		updateClass.put("sClassCat", item.class.category);
		updateClass.put("sDesc", item.class.description);
		updateClass.put("sStats", item.class.statsDescription);
		updateClass.put("uid", player.network.id);

		if (item.class.manaRegenerationMethods.includes(":")) {
			const aMRM: JSONArray = new JSONArray();

			for (const s of item.class.manaRegenerationMethods.split(",")) {
				aMRM.add(s + "\r");
			}

			updateClass.put("aMRM", aMRM);
		} else {
			updateClass.put("aMRM", item.class.manaRegenerationMethods);
		}

		updateClass.put("sClassName", item.name);

		this.player.network.writeObject(updateClass);

		// Update User Properties
		player.properties.set(PlayerConst.CLASS_POINTS, classPoints);
		player.properties.set(PlayerConst.CLASS_NAME, item.name);
		player.properties.set(PlayerConst.CLASS_CATEGORY, item.class.category);

		player.room?.writeObjectExcept(
			player,
			new JSONObject()
				.element("cmd", "updateClass")
				.element("iCP", classPoints)
				.element("sClassCat", item.class.category)
				.element("sClassName", item.name)
				.element("uid", player.network.id)
		);

		this.loadSkills(player, item, classPoints);
	}

	private loadSkills(user: Player, item: IItem, classPoints: number): void {
		const rank: number = Rank.getRankFromPoints(classPoints);

		const skills: Map<string, number> = user.properties.get(PlayerConst.SKILLS);

		const active: JSONArray = new JSONArray();
		const passive: JSONArray = new JSONArray();
		const sAct: JSONObject = new JSONObject();

		sAct.put("cmd", "sAct");

		for (const skillId of item.class.skills) {
			const skill: ISkill = this.world.skills.get(skillId);

			if (skill.type === "passive") {
				const passObj: JSONObject = new JSONObject();

				passObj.put("desc", skill.description);
				passObj.put("fx", skill.effects);
				passObj.put("icon", skill.icon);
				passObj.put("id", skillId);
				passObj.put("nam", skill.name);
				passObj.put("range", skill.range);
				passObj.put("ref", skill.reference);
				passObj.put("tgt", skill.target);
				passObj.put("typ", skill.type);

				const arrAuras: JSONArray = new JSONArray();
				arrAuras.add(new JSONObject());

				passObj.put("auras", arrAuras);

				if (rank < 4) {
					passObj.put("isOK", false);
				} else {
					passObj.put("isOK", true);
				}

				passive.add(passObj);

				skills.set(skill.reference, skillId);
			} else {
				const actObj: JSONObject = new JSONObject();

				actObj.element("anim", skill.animation)
					.element("cd", String(skill.cooldown))
					.element("damage", skill.damage)
					.element("desc", skill.description);

				if (skill.dsrc.length != 0) {
					actObj.element("dsrc", skill.dsrc);
				}

				actObj.element("fx", skill.effects)
					.element("icon", skill.icon)
					.element("id", skillId)
					.element("isOK", true)
					.element("mp", String(skill.mana))
					.element("nam", skill.name)
					.element("range", String(skill.range))
					.element("ref", skill.reference);

				if (skill.strl.length != 0) {
					actObj.element("strl", skill.strl);
				}

				actObj.element("tgt", skill.target)
					.element("typ", skill.type);

				if (rank < 2 && skill.reference === "a2") {
					actObj.element("isOK", false);
				}

				if (rank < 3 && skill.reference === "a3") {
					actObj.element("isOK", false);
				}

				if (rank < 5 && skill.reference === "a4") {
					actObj.element("isOK", false);
				}

				if (skill.hitTargets > 0) {
					actObj.element("tgtMax", skill.hitTargets)
						.element("tgtMin", "1");
				}

				if (skill.reference === "aa") {
					actObj.element("auto", true)
						.element("typ", "aa");

					active.element(0, actObj);
				} else if (skill.reference === "a1") {
					active.element(1, actObj);
				} else if (skill.reference === "a2") {
					if (rank < 2) {
						actObj.element("isOK", false);
					}

					active.element(2, actObj);
				} else if (skill.reference === "a3") {
					if (rank < 3) {
						actObj.element("isOK", false);
					}

					active.element(3, actObj);
				} else if (skill.reference === "a4") {
					if (rank < 5) {
						actObj.element("isOK", false);
					}

					active.element(4, actObj);
				}

				skills.set(skill.reference, skillId);
			}
		}

		active.element(
			5,
			new JSONObject()
				.element("anim", "Cheer")
				.element("cd", "" + 60000)
				.element("desc", "Equip a potion or scroll from your inventory to use it here.")
				.element("fx", "")
				.element("icon", "icu1")
				.element("isOK", true)
				.element("mp", "" + 0)
				.element("nam", "Potions")
				.element("range", 808)
				.element("ref", "i1")
				.element("str1", "")
				.element("tgt", "f")
				.element("typ", "i")
		);

		sAct.put(
			"actions",
			new JSONObject()
				.element("active", active)
				.element("passive", passive)
		);

		this.clearAuras(user);
		this.applyPassiveAuras(user, rank, item.classObj);

		this.player.network.writeObject(sAct);
	}

}