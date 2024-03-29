import type Player from "../../player/Player.ts";
import type RequestArg from "../../request/RequestArg.ts";
import {RequestType} from "../../request/RequestType.ts";

export default interface IRequest {

	name: string;
	type: RequestType;

	handler(player: Player, args: RequestArg): Promise<void>;

}