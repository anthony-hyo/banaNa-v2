import type IAreaMonster from "../../../database/interfaces/IAreaMonster.ts";
import type Monster from "../Monster.ts";

export default class MonsterData {

	constructor(
		private readonly monster: Monster,
		public readonly areaMonster: IAreaMonster
	) {
	}


}