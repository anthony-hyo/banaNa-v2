import type Player from "../Player.ts";
import type IItem from "../../../database/interfaces/IItem.ts";

export default class PlayerData {

	public isAway: boolean = false;
	public pvpTeam: number = 0;
	public potion: IItem | undefined;
	public partyId: number | undefined = undefined;

	constructor(
		private readonly player: Player
	) {
	}

}