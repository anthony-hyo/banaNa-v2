import type IRequest from "../../interfaces/request/IRequest.ts";
import type RequestArg from "../RequestArg.ts";
import type Player from "../../avatar/player/Player.ts";
import RequestType from "../RequestType.ts";
import RequestRegister from "../RequestRegister.ts";

@RequestRegister({
	name: "afk",
	type: RequestType.DEFAULT
})
export default class ToggleAfk implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const isAway: boolean = args.getBoolean(0);

		if (isAway != player.data.isAway) {
			player.data.isAway = isAway;
			player.writeArray("server", [(isAway ? "You are now Away From Keyboard (AFK)." : "You are no longer Away From Keyboard (AFK)")]);
			player.room?.writeArray("uotls", [player.avatarName, "afk:" + isAway]);
		}
	}

}
