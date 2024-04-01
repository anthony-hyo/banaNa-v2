import type IRequest from "../../../../interfaces/request/IRequest";
import type Player from "../../../../avatar/player/Player";
import type RequestArg from "../../../RequestArg.ts";
import RequestFactory from "../../../RequestFactory.ts";
import RequestType from "../../../RequestType.ts";
import RequestRegister from "../../../RequestRegister.ts";

@RequestRegister({
	name: "cmd",
	type: RequestType.DEFAULT
})
export default class UserCommand implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const command: string = args.getString(0);

		const request: IRequest | undefined = RequestFactory.request(RequestType.COMMAND_USER, command);

		if (!request) {
			//throw new Error(`User command not found`);
			return;
		}

		await request
			.handler(player, args);
	}

}
