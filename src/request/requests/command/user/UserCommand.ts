import type IRequest from "../../../../interfaces/request/IRequest";
import type Player from "../../../../avatar/player/Player";
import type RequestArg from "../../../RequestArg.ts";
import RequestFactory from "../../../RequestFactory.ts";
import {RequestType} from "../../../RequestType.ts";

export default class UserCommand implements IRequest {

	public readonly name: string = 'cmd';
	public readonly type: RequestType = RequestType.DEFAULT;

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const command: string = args.getString(0);

		const request: IRequest | undefined = RequestFactory.request(RequestType.COMMAND_USER, command);

		if (!request) {
			throw new Error(`User command not found`);
		}

		await request
			.handler(player, args);
	}

}
