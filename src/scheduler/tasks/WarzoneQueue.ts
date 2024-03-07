import type ITask from "../../interfaces/ITask";
import type Player from "../../player/Player";
import type Room from "../../room/Room";
import logger from "../../util/Logger";
import JSONObject from "../../util/json/JSONObject";
import Users from "../../world/Users";
import type World from "../../world/World";

export default class WarzoneQueue implements ITask {
    private static readonly MAX_QUEUE: number = 10;
    private warzoneQueues: Map<string, Player[]> = new Map();
    private world: World;

    constructor(world: World) {
        this.world = world;
        console.log("WarzoneQueue initialized.");
    }

    public run(): void {
        try {
            for (const [warzone, queue] of this.warzoneQueues.entries()) {
                if (queue.length === WarzoneQueue.MAX_QUEUE) {
                    const PVPI: JSONObject = new JSONObject()
                        .element("cmd", "PVPI")
                        .element("warzone", warzone);

                    const warzoneRoom: Room = this.world.rooms.createRoom(`bludrutbrawl-${Math.abs(PVPI.hashCode())}`);

                    for (let i: number = 0; i < WarzoneQueue.MAX_QUEUE; i++) {
                        const user: Player = queue.shift()!;
                        user.properties.set(Users.ROOM_QUEUED, warzoneRoom);

                        if (i % 2 === 0) {
                            user.properties.set(Users.PVP_TEAM, 0);
                        } else {
                            user.properties.set(Users.PVP_TEAM, 1);
                        }


                        this.world.send(["server", "A new Warzone battle has started!"], user),
                            this.world.send(PVPI, user)
                    }
                }
            }
        } catch (error: any) {
            logger.warn(error)
        }
    }

    public removeUserFromQueues(user: Player): void {
        for (const queue of this.warzoneQueues.values()) {
            queue.splice(queue.indexOf(user), 1);
        }
    }

    public queueUser(warzone: string, user: Player): void {
        const queue: Player[] = this.getWarzoneQueue(warzone);
        queue.push(user);
    }

    private getWarzoneQueue(warzone: string): Player[] {
        if (this.warzoneQueues.has(warzone)) {
            return this.warzoneQueues.get(warzone)!;
        }

        this.warzoneQueues.set(warzone, []);

        return this.warzoneQueues.get(warzone)!;
    }
}
