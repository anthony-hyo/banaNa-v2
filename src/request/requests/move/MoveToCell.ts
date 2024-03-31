import type IRequest from "../../../interfaces/request/IRequest.ts";
import type Player from "../../../avatar/player/Player.ts";
import type RequestArg from "../../RequestArg.ts";
import {RequestType} from "../../RequestType.ts";

export default class MoveToCell implements IRequest {

	public readonly name: string = 'moveToCell';
	public readonly type: RequestType = RequestType.DEFAULT;

	public async handler(player: Player, args: RequestArg): Promise<void> {
		let frame: string = args.getString(0);
		let pad: string = args.getString(1);

		player.status.endCombat();

		player.moveToCell(frame, pad, true);
	}

}
