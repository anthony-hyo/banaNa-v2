import type IRequest from "../../interfaces/request/IRequest.ts";
import type RequestArg from "../RequestArg.ts";
import type Player from "../../player/Player.ts";
import JSONObject from "../../util/json/JSONObject.ts";
import JSONArray from "../../util/json/JSONArray.ts";
import PlayerController from "../../controller/PlayerController.ts";

export default class RetrieveUserDatas implements IRequest {

	public readonly name: string = 'retrieveUserDatas';

	public async handler(player: Player, args: RequestArg): Promise<void> {
		console.log(args.toString());

		const jsonArray: JSONArray = new JSONArray();

		for (let id of args.list()) {
			const userId: number = Number(id);

			const playerRetrieved: Player | undefined = PlayerController.find(userId);

			for (let player1 of PlayerController.players()) {
				console.log('aaa', player1.network.id, player1.username);
			}
			console.log(playerRetrieved);

			if (!playerRetrieved) {
				continue;
			}

			jsonArray.add(new JSONObject()
				.element("uid", userId)
				.element("strFrame", playerRetrieved.position.frame)
				.element("strPad", playerRetrieved.position.pad)
				.element("data", await playerRetrieved.json(userId == player.network.id, true, false))
			);
		}

		player.network.writeObject(new JSONObject()
			.element("cmd", "initUserDatas")
			.element("a", jsonArray)
		);
	}

}
