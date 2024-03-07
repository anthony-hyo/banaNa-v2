import {Socket} from "net";
import Player from "../examples/Player";

export default class Room {

    private readonly id: number;
    private readonly name: string;
    private readonly users: Array<Player>;
    private readonly channel: Socket;
    properties: Map<string, any>;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
        this.users = new Array<Player>();
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