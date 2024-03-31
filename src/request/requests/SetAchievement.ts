import type IRequest from "../../interfaces/request/IRequest.ts";
import type RequestArg from "../RequestArg.ts";
import type Player from "../../avatar/player/Player.ts";
import {RequestType} from "../RequestType.ts";

export default class SetAchievement implements IRequest {

	public readonly name: string = 'setAchievement';
	public readonly type: RequestType = RequestType.DEFAULT;

	public async handler(player: Player, args: RequestArg): Promise<void> {
		let field: string = args.getString(0);
		let index: number = args.getNumber(1);
		let value: number = args.getNumber(2);

		//player.updateAchievement(field, index, value);
	}

}
