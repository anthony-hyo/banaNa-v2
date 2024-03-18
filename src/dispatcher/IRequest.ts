import type Player from "../player/Player.ts";
import type RequestArg from "../request/RequestArg.ts";

export default interface IRequest {

    name: string

    handler(player: Player, args: RequestArg): void

}