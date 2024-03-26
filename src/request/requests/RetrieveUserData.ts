import type IRequest from "../../interfaces/request/IRequest.ts";
import type RequestArg from "../RequestArg.ts";
import type Player from "../../player/Player.ts";
import JSONObject from "../../util/json/JSONObject.ts";
import PlayerController from "../../controller/PlayerController.ts";

export default class RetrieveUserData implements IRequest {

	public readonly name: string = 'retrieveUserData';

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const target: Player | undefined = PlayerController.find(args.getNumber(0));

		if (!target) {
			player.kick();
			return;
		}

		player.network.writeObject(new JSONObject()
			.element("cmd", "initUserData")
			.element("data", await target.json(false, false, true))
			.element("strFrame", target.position.frame)
			.element("strPad", target.position.pad)
			.element("uid", target.network.id)
		);
	}

}
