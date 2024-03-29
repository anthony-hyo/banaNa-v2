import type IRequest from "../../interfaces/request/IRequest.ts";
import type RequestArg from "../RequestArg.ts";
import type Player from "../../player/Player.ts";
import JSONObject from "../../util/json/JSONObject.ts";
import CoreValues from "../../aqw/CoreValues.ts";
import RoomController from "../../controller/RoomController.ts";
import type Room from "../../room/Room.ts";
import {RequestType} from "../RequestType.ts";

export default class RequestDefault implements IRequest {

	public readonly name: string = 'firstJoin';
	public readonly type: RequestType = RequestType.DEFAULT;

	public async handler(player: Player, args: RequestArg): Promise<void> {
		player.network.writeObject(
			new JSONObject()
				.element("cmd", "cvu")
				.element("o", CoreValues.getData())
		);

		const roomName: string = "battleon";
		const roomFrame: string = "Enter";
		const roomPad: string = "Spawn";

		const room: Room | undefined = await RoomController.look(roomName);

		if (!room) {
			//TODO: Disconnect
			return;
		}

		await player.joinRoom(room, roomFrame, roomPad);
	}

}