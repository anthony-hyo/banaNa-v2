import type IRequest from "../../interfaces/request/IRequest.ts";
import type RequestArg from "../RequestArg.ts";
import type Player from "../../player/Player.ts";

export default class ToggleAfk implements IRequest {

	public readonly name: string = 'afk';

	public async handler(player: Player, args: RequestArg): Promise<void> {
		/*let afk: boolean = java.lang.Boolean.parseBoolean(args.getString(0));

		if (afk !== player.properties().isAfk()) {
			if (!afk) {
				player.dispatch(Message.server("You are no longer Away From Keyboard (AFK)."));
				player.handler().onIdle();
			} else {
				player.dispatch(Message.server("You are now Away From Keyboard (AFK)."));
			}

			player.properties().afk(afk);
			player.room!.dispatch(["uotls", player.network.name, "afk:" + afk]);
		}*/
	}

}
