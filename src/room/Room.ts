import {Socket} from "net";
import type IDispatchable from "../interfaces/IDispatchable.ts";
import JSONObject from "../util/json/JSONObject.ts";
import type Player from "../player/Player.ts";

export default class Room implements IDispatchable {

    private readonly id: number;
    private readonly name: string;
    private readonly channel: Socket;
    public properties!: Map<string, any>;


    private readonly players: Array<Player> = new Array<Player>();
    private readonly monsters: Array<Player> = new Array<Player>();

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    private allPlayersExcept(networkId: number, data: object): Array<Socket> {
        return this.players
            .filter((player: Player): boolean => player.network.id !== networkId)
            .map((player: Player) => player.network.socket)
            .reduce((acc: Array<Socket>, channel: Socket) => {
                acc.push(channel);
                return acc;
            }, new Array<Socket>());
    }

    public writeObjectExcept(ignored: Player, data: JSONObject): void {
        for (const player of this.players.filter((player: Player): boolean => player.network.id !== ignored.network.id)) {
            player.network.writeObject(data);
        }
    }

    public writeStringExcept(ignored: Player, ...data: any[]): void {
        for (const player of this.players.filter((player: Player): boolean => player.network.id !== ignored.network.id)) {
            player.network.writeString(data);
        }
    }

    public writeObject(data: JSONObject): void {
        for (const player of this.players) {
            player.network.writeObject(data);
        }
    }

    public writeString(...data: any[]): void {
        for (const player of this.players) {
            player.network.writeString(data);
        }
    }


    public getProperties(): Map<string, any> {
        return this.properties;
    }

    public getAllUsers(): any {
        // Implement getAllUsers method
        return [];
    }

    public getChannellList(): string[] {
        // Implement getChannellList method
        return [];
    }

    public getId(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getUsers(): Array<Player> {
        return this.users;
    }

    public getChannel(): Socket {
        return this.channel;
    }

    public addUser(user: Player): void {
        this.users.add(user);
    }

    public removeUser(user: Player): void {
        this.users.remove(user);
    }

    public getChannellList(): Array<Socket> {
        const channels: Array<Socket> = new Array<Socket>();
        for (const user of this.users) {
            channels.push(user.channel);
        }
        return channels;
    }

    public getAllUsersButOne(user: Player): Array<Player> {
        const otherUsers: Array<Player> = new Array<Player>();
        for (const u of this.users) {
            if (u !== user) {
                otherUsers.push(u);
            }
        }
        return otherUsers;
    }

    /// --

    getId(): number {
        return 1;
    }

    getName(): string {
        return "";
    }

    addUser(user: Player): boolean {
        if (this.userCount < this.maxUsers) {
            this.users.push(user);
            this.userCount++;
            return true;
        } else {
            return false;
        }
    }

    removeUser(user: Player): void {
        const index = this.users.indexOf(user);
        if (index !== -1) {
            this.users.splice(index, 1);
            this.userCount--;
        }
    }

    getUserCount(): number {
        return this.userCount;
    }

    getMaxUsers(): number {
        return this.maxUsers;
    }

}