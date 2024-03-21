import type Player from "../player/Player.ts";
import type RequestArg from "./RequestArg.ts";
import logger from "../util/Logger.ts";
import type IRequest from "../interfaces/request/IRequest.ts";

export default class RequestDefault implements IRequest {

    name: string = 'default';

    public async handler(player: Player, args: RequestArg): Promise<void> {
        logger.warn(`${player.username}(${player.network.id}) default request called`, args.list());
    }

}