import type IRequest from "../../../../interfaces/request/IRequest";
import type Player from "../../../../avatar/player/Player";
import type RequestArg from "../../../RequestArg.ts";
import RequestType from "../../../RequestType.ts";
import RequestRegister from "../../../RequestRegister.ts";

@RequestRegister({
	name: "logout",
	type: RequestType.COMMAND_USER
})
export default class Logout implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		player.network.writeArray("warning", [`"Saving Data..`]);
		player.network.writeArray("warning", [`Ending Session...`]);
		player.network.writeArray("warning", [`Goodbye!`]);

		// noinspection HtmlUnknownAttribute
		player.network.write(`<msg t='sys'><body action='logout' r='0'></body></msg>`);
	}

}
