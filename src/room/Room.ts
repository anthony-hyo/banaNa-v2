import type IDispatchable from "../interfaces/IDispatchable.ts";
import JSONObject from "../util/json/JSONObject.ts";
import type Player from "../player/Player.ts";
import database from "../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {users} from "../database/drizzle/schema.ts";
import type Area from "../database/interfaces/Area.ts";

export default class Room implements IDispatchable {

    public static readonly NONE: Room = new Room(-1, 1);

    private readonly _players: Map<number, Player> = new Map<number, Player>();

    constructor(
        private readonly _id: number,
        private readonly _databaseId: number
    ) {
    }

    public get id(): number {
        return this._id;
    }

    public get databaseId(): number {
        return this._databaseId;
    }

    public async data(): Promise<Area> {
        return (
            await database.query.maps
                .findFirst({
                    where: eq(users.id, this.databaseId)
                })
        )!;
    }

    public addPlayer(player: Player): void {
        this._players.set(player.network.id, player);
        player.room = this;
    }

    public removePlayer(player: Player): void {
        this._players.delete(player.network.id);
    }

    public get players(): Map<number, Player> {
        return this._players;
    }

    public get playersCount():number {
        return this._players.size;
    }

    public writeExcept(ignored: Player, data: string): void {
        for (let [networkId, player] of this.players) {
            if (networkId !== ignored.network.id) {
                player.network.write(data);
            }
        }
    }

    public writeObjectExcept(ignored: Player, data: JSONObject): void {
        for (let [networkId, player] of this.players) {
            if (networkId !== ignored.network.id) {
                player.network.writeObject(data);
            }
        }
    }

    public writeStringExcept(ignored: Player, ...data: any[]): void {
        for (let [networkId, player] of this.players) {
            if (networkId !== ignored.network.id) {
                player.network.writeString(data);
            }
        }
    }

    public writeObject(data: JSONObject): void {
        for (let [, player] of this.players) {
            player.network.writeObject(data);
        }
    }

    public writeString(...data: any[]): void {
        for (let [, player] of this.players) {
            player.network.writeString(data);
        }
    }

}