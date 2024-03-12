import Room from "../room/Room";
import PlayerNetwork from "./PlayerNetwork";
import {users, usersLogs} from "../database/drizzle/schema";
import database from "../database/drizzle/database";
import {eq} from "drizzle-orm";
import type User from "../database/interfaces/User.ts";
import PlayerPreference from "./PlayerPreference.ts";

export default class Player {

    public properties: Map<string, any> = new Map<string, any>();
    public room: Room | undefined ;

    private readonly _databaseId: number;
    private readonly _username: string;
    private readonly _network: PlayerNetwork;

    private readonly _preferences: PlayerPreference = new PlayerPreference(this);

    constructor(user: User, network: PlayerNetwork) {
        this._databaseId = user.id;
        this._username = user.username;
        this._network = network;
    }

    public get databaseId(): number {
        return this._databaseId;
    }

    public get username(): string {
        return this._username;
    }

    public get network(): PlayerNetwork {
        return this._network;
    }

    public get preferences(): PlayerPreference {
        return this._preferences;
    }

    public async data(): Promise<User> {
        return (
            await database.query.users
                .findFirst({
                    where: eq(users.id, this.databaseId)
                })
        )!;
    }

    public log(user: Player, violation: string, details: string): void {
        database
            .insert(usersLogs)
            .values({
                userId: user.databaseId,
                violation: violation,
                details: details,
            });
    }

    public kick() {
        //TODO: Kick
    }

    public disconnect() {

    }

}
