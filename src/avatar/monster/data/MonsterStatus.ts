import AvatarStatus from "../../data/AvatarStatus.ts";
import Player from "../../player/Player.ts";
import type Monster from "../Monster.ts";
import {AvatarState} from "../../helper/AvatarState.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import Scheduler from "../../../scheduler/Scheduler.ts";
import MonsterRespawn from "../../../scheduler/tasks/MonsterRespawn.ts";
import type IMonster from "../../../database/interfaces/IMonster.ts";
import type IMonsterDrop from "../../../database/interfaces/IMonsterDrop.ts";
import GameController from "../../../controller/GameController.ts";
import PlayerController from "../../../controller/PlayerController.ts";
import AvatarType from "../../helper/AvatarType.ts";

export default class MonsterStatus extends AvatarStatus {

	constructor(
		public readonly monster: Monster,
		health: number, mana: number
	) {
		super(health, mana);
	}

	public restore(): void {
		this.state = AvatarState.NEUTRAL;

		this.health.resetToFull();
		this.mana.resetToFull();

		//this.targets.clear();

		const monInfo: JSONObject = new JSONObject()
			.element("intHP", this.health.value)
			.element("intMP", this.mana.value)
			.element("intState", this.state);

		const mtls: JSONObject = new JSONObject()
			.element("cmd", "mtls")
			.element("id", this.data.areaMonster.monsterAreaId)
			.element("o", monInfo);

		this.writeObject(mtls);
	}

	public async die(): Promise<void> {
		if (this.state === 0) {
			return;
		}

		this.attacking?.cancel();

		for (const ra of this.auras) {
			ra.run();
			ra.cancel();
		}

		this.auras.clear();

		this.health = 0;
		this.mana = 0;
		this.state = 0;

		Scheduler.oneTime(new MonsterRespawn(this), 4);

		const monster: IMonster = this.world.monsters.get(this.monsterId)!;

		const drops: Set<IMonsterDrop> = new Set<IMonsterDrop>();

		for (const md of monster.monstersDrops) {
			if (Math.random() <= md.chance * GameController.DROP_RATE) {
				drops.add(md);
			}
		}

		for (const networkId of this.targets) {
			const player: Player | undefined = PlayerController.find(networkId);

			if (player) {
				for (const drop of drops) {
					player.dropItem(drop.itemId, drop.quantity);
				}

				await player.giveRewards(monster.experience, monster.gold, monster.classPoints, 0, -1, player.avatarId, AvatarType.MONSTER);
			}
		}
	}

}