import type {Monster} from "../../monster/Monster.ts";
import type ITask from "../../interfaces/scheduler/ITask";
import logger from "../../util/Logger.ts";

export default class MonsterRespawn implements ITask {

	private monster: Monster;

	constructor(monster: Monster) {
		this.monster = monster;
	}

	public run(): void {
		try {
			this.monster.restore();
			this.monster.writeArray("respawnMon", [this.monster.data.monsterAreaId]);
		} catch (error: any) {
			logger.warn(error);
		}
	}
}
