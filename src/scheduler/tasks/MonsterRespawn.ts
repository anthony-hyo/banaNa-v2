import type {MonsterAI} from "../../ai/MonsterAI";
import type ITask from "../../interfaces/scheduler/ITask";
import logger from "../../util/Logger.ts";

export default class MonsterRespawn implements ITask {

	private monster: MonsterAI;

	constructor(monster: MonsterAI) {
		this.monster = monster;
	}

	public run(): void {
		try {
			this.monster.restore();
			this.monster.writeArray("respawnMon", this.monster.getMapId().toString());
		} catch (error: any) {
			logger.warn(error);
		}
	}
}
