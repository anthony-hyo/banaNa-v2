import Player from "./Player";
import {Socket} from "net";
import JSONObject from "../json/JSONObject";

export default class Zone {

    private readonly users: Array<Player>;
    private readonly channels: Array<Socket>; // Assuming channel structure

    constructor() {
        this.users = [];
        this.channels = [];
    }

    public getName(): string {
        return this.name;
    }

    getRoom(id: number): any {
        return undefined;
    }

    getUserCount(): number {
        return this.users.length;
    }

    getChannelList(): any[] {
        return this.channels;
    }

    getUserList(): Player[] {
        return this.users;
    }

    getUserByName(username: string): Player | undefined {
        return this.users.find(user => user.getName() === username);
    }

    sendResponse(data: Array<string> | JSONObject, fromRoom: number, sender: Player, recipients: Array<any>): void {

    }

}
