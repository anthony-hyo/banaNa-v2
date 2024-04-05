import type IRequest from "../../../interfaces/request/IRequest.ts";
import type RequestArg from "../../RequestArg.ts";
import type Player from "../../../avatar/player/Player.ts";
import RequestType from "../../RequestType.ts";
import RequestRegister from "../../RequestRegister.ts";
import {AvatarState} from "../../../avatar/helper/AvatarState.ts";
import type IUserInventory from "../../../database/interfaces/IUserInventory.ts";
import SkillReference from "../../../avatar/helper/combat/skill/SkillReference.ts";
import type ISkill from "../../../database/interfaces/ISkill.ts";
import JSONArray from "../../../util/json/JSONArray.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import AvatarTarget from "../../../avatar/helper/AvatarTarget.ts";
import PlayerController from "../../../controller/PlayerController.ts";
import type Monster from "../../../avatar/monster/Monster.ts";
import AvatarType from "../../../avatar/helper/AvatarType.ts";
import Sarsa from "../../../avatar/helper/combat/Sarsa.ts";
import HelperCombat from "../../../util/HelperCombat.ts";
import Damage from "../../../avatar/helper/combat/Damage.ts";
import Animation from "../../../avatar/helper/combat/Animation.ts";

@RequestRegister({
	name: "gar",
	type: RequestType.DEFAULT
})
export default class GetActionResult implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const actionId: number = args.getNumber(0);

		if (player.status.state == AvatarState.DEAD || !player.room || player.room.isPvPDone) {
			player.combat.invalidSkill(actionId);
			return;
		}

		const targets: string = args.getString(1);

		const tInf: string = HelperCombat.parseTargetInfo(targets);

		if (HelperCombat.hasDuplicates(tInf.split(","))) {
			player.combat.invalidSkill(actionId);
			return;
		}

		const reference: string = HelperCombat.parseSkillReference(targets);

		const equippedClass: IUserInventory | undefined = player.inventory.equippedClass;

		if (equippedClass == undefined) {
			player.combat.invalidSkill(actionId);
			return;
		}

		let skill: ISkill | undefined;

		switch (reference) {
			case SkillReference.POTION:
				if (player.data.potion != null && player.data.potion.skillPotion) {
					const turnInItem: Map<number, number> = new Map<number, number>([[player.data.potion.id, 1]]);

					if (!player.inventory.turnInItems(turnInItem)) {
						player.log("[GetActionResult] turnInItems failed when using potions.");
						player.combat.invalidSkill(actionId);
						return;
					}

					skill = player.data.potion.skillPotion;

					//Remove potion if no quantity left/used all
					if (!player.inventory.hasItems(turnInItem)) {
						player.data.potion = undefined;
					}
				}
				break;
			case SkillReference.AUTO_ATTACK:
				skill = player.combat.skillAutoAttack;
				break;
			case SkillReference.ATTACK_1:
				skill = player.combat.skillAttack1;
				break;
			case SkillReference.ATTACK_2:
				skill = player.combat.skillAttack2;
				break;
			case SkillReference.ATTACK_3:
				skill = player.combat.skillAttack3;
				break;
			case SkillReference.ATTACK_4:
				skill = player.combat.skillAttack4;
				break;
		}

		if (skill == null || player.combat.isSkillInvalid(skill)) {
			player.combat.invalidSkill(actionId);
			return;
		}

		if (player.status.mana.value < skill.mana * player.stats.get$cmc) {
			player.writeArray("warning", ["Not enough mana!"]);
			player.combat.invalidSkill(actionId);
			return;
		}

		const skillReference: SkillReference = <SkillReference>skill.reference;

		const lastRequestTime: number | undefined = player.filter.skills.get(skillReference);

		if (lastRequestTime) {
			const now: number = Date.now();

			const cd: number = Math.round((skill.cooldown - 2000) * player.stats.get$tha);

			let requestCounter: number = player.filter.skillWarningCount;

			if (now - lastRequestTime >= cd) {
				player.filter.skillWarningCount = 0;
			} else {
				player.writeArray("warning", ["Action taken too quickly, try again in a moment."]);
				player.filter.skillWarningCount = requestCounter + 1;
				player.combat.invalidSkill(actionId);
				return;
			}
		}

		this.doAction(actionId, skill, tInf, player);

		player.filter.skills.set(skillReference, Date.now());
	}

	private doAction(actId: number, skill: ISkill, tInf: string, player: Player): void {
		const targetsArr: string[] = tInf.split(",");

		const damageResults: JSONArray = new JSONArray();

		const playerTargets: JSONObject = new JSONObject();
		const monsterTargets: JSONObject = new JSONObject();

		player.status.mana.decreaseBy(skill.mana * player.stats.get$cmc);

		const self: AvatarTarget = AvatarTarget.parse(player);

		const ct: JSONObject = new JSONObject()
			.element("cmd", "ct");

		let bounce: number = 0;

		for (const tgt of targetsArr) {
			const targetData: string[] = tgt.split(":");

			if (targetData.length <= 1) {
				continue;
			}

			const targetType: string = targetData[0];
			const targetId: number = parseInt(targetData[1]);

			switch (targetType) {
				case AvatarType.MONSTER:
					const monster: Monster | undefined = player.room?.monsters.get(targetId);

					if (monster == null || monster.status.state == AvatarState.DEAD) {
						continue;
					}

					if (monster.frame != player.frame) {
						player.combat.invalidSkill(actId);
						return;
					}

					damageResults.add(new Damage(skill, player, monster, bounce).damageResult());

					monsterTargets.element(monster.avatarId.toString(), monster.status.json());
					break;
				case AvatarType.PLAYER:
					const target: Player | undefined = PlayerController.find(targetId);

					if (!target || target.status.state != AvatarState.DEAD) {
						continue;
					}

					if (player.room?.data.isPvP && target.avatarId != player.avatarId && player.data.pvpTeam == target.data.pvpTeam || target.frame != player.frame) {
						player.combat.invalidSkill(actId);
						return;
					}

					damageResults.add(new Damage(skill, player, target, bounce).damageResult());

					playerTargets.element(player.avatarName, player.status.json());
					break;
			}

			bounce++;
		}

		ct
			.element("anims", new Animation(skill, tInf, self, player.frame).data())
			.element("sarsa", new Sarsa(self, damageResults, actId).data);

		playerTargets.element(player.avatarName, player.status.json());

		if (!monsterTargets.isEmpty) {
			ct.element("m", monsterTargets);
		}

		if (!playerTargets.isEmpty) {
			ct.element("p", playerTargets);
		}

		if (player.room?.data.isPvP) {
			player.room.writeObject(
				ct
					.element("pvp", player.room.getPvPResult)
			);
			return;
		}

		player.writeObject(ct);

		player.room?.writeObjectExcept(
			player,
			ct
				.remove("sarsa")
		);
	}


}
