import type IRequest from "../../../interfaces/request/IRequest.ts";
import type Player from "../../../player/Player.ts";
import type RequestArg from "../../RequestArg.ts";
import {RequestType} from "../../RequestType.ts";

export default class ChatCanned implements IRequest {

	public readonly name: string = 'cc';
	public readonly type: RequestType = RequestType.DEFAULT;

	public async handler(player: Player, args: RequestArg): Promise<void> {
		player.room!.writeArray("cc", [args.getString(0), player.network.name]);
	}

}
