import type IRequest from "../dispatcher/IRequest.ts";
import type Player from "../player/Player.ts";
import type RequestArg from "./RequestArg.ts";
import logger from "../util/Logger.ts";

export default class RequestDefault implements IRequest {

    name: string = 'default';

    handler(player: Player, args: RequestArg): void {
        logger.warn(`${player.username}(${player.network.id}) default request called`, args.list());
    }

}