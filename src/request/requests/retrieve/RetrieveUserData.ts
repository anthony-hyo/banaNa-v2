import type IRequest from "../../../interfaces/request/IRequest.ts";
import type RequestArg from "../../RequestArg.ts";
import type Player from "../../../avatar/player/Player.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import PlayerController from "../../../controller/PlayerController.ts";
import RequestType from "../../RequestType.ts";
import RequestRegister from "../../RequestRegister.ts";

@RequestRegister({
	name: "retrieveUserData",
	type: RequestType.DEFAULT
})
export default class RetrieveUserData implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const target: Player | undefined = PlayerController.find(args.getNumber(0));

		if (!target) {
			player.kick('[RetrieveUserData] target is undefined');
			return;
		}

		player.writeObject(new JSONObject()
			.element("cmd", "initUserData")
			.element("data", await target.json(false, true, false))
			.element("strFrame", target.frame)
			.element("strPad", target.pad)
			.element("uid", target.avatarId)
		);
	}

}
