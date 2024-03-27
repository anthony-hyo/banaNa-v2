import type Player from "./Player.ts";

export default class PlayerData {

	constructor(
		private readonly player: Player,
		public isAway: boolean = false
	) {
	}

}