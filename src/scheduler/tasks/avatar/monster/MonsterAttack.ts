import type ITask from "../../../../interfaces/scheduler/ITask.ts";
import type Monster from "../../../../avatar/monster/Monster.ts";
import logger from "../../../../util/Logger.ts";

export default class MonsterRespawn implements ITask {

	constructor(
		private readonly monster: Monster
	) {
	}

	public run(): void {
		try {

		} catch (error: any) {
			logger.warn(error);
		}
	}
}
