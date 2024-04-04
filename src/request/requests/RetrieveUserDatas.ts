import type IRequest from "../../interfaces/request/IRequest.ts";
import type RequestArg from "../RequestArg.ts";
import type Player from "../../avatar/player/Player.ts";
import JSONObject from "../../util/json/JSONObject.ts";
import JSONArray from "../../util/json/JSONArray.ts";
import PlayerController from "../../controller/PlayerController.ts";
import RequestType from "../RequestType.ts";
import RequestRegister from "../RequestRegister.ts";

@RequestRegister({
	name: "retrieveUserDatas",
	type: RequestType.DEFAULT
})
export default class RetrieveUserDatas implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const jsonArray: JSONArray = new JSONArray();

		for (let id of args.list()) {
			const userId: number = Number(id);

			const playerRetrieved: Player | undefined = PlayerController.find(userId);

			if (!playerRetrieved) {
				continue;
			}

			jsonArray.add(new JSONObject()
				.element("uid", userId)
				.element("strFrame", playerRetrieved.position.frame)
				.element("strPad", playerRetrieved.position.pad)
				.element("data", await playerRetrieved.json(userId == player.avatarId, false, true))
			);
		}

		player.writeObject(new JSONObject()
			.element("cmd", "initUserDatas")
			.element("a", jsonArray)
		);
	}

}
