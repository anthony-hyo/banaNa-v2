import World from "../world/World";
import Room from "../room/Room";
import Player from "../examples/Player";

/**
 * Interface for request handling
 */
export interface IRequest {
    /**
     * Processes the request
     * @param params Request parameters
     * @param user User making the request
     * @param world Current world
     * @param room Current room
     * @throws {RequestException} Throws if an error occurs during request processing
     */
    process(params: Array<string>, user: Player, world: World, room: Room): void;
}
