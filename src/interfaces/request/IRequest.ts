import type Player from "../../avatar/player/Player.ts";
import type RequestArg from "../../request/RequestArg.ts";

export default interface IRequest {

	handler(player: Player, args: RequestArg): Promise<void>;

}