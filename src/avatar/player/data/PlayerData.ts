import type Player from "../Player.ts";

export default class PlayerData {

	public isAway: boolean = false;

	constructor(
		private readonly player: Player
	) {
	}

}