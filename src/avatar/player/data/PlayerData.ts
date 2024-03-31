import type Player from "../Player.ts";

export default class PlayerData {

	public isAway: boolean = false;
	public pvpTeam: number = 0;

	constructor(
		private readonly player: Player
	) {
	}

}