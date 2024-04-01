import type IRequest from "../../../interfaces/request/IRequest.ts";
import type Player from "../../../avatar/player/Player.ts";
import type RequestArg from "../../RequestArg.ts";
import RequestType from "../../RequestType.ts";
import RequestRegister from "../../RequestRegister.ts";

@RequestRegister({
	name: "cc",
	type: RequestType.DEFAULT
})
export default class ChatCanned implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		player.room!.writeArray("cc", [args.getString(0), player.network.name]);
	}

}
