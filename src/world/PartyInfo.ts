import {Socket} from "net";
import type Player from "../player/Player";
import Users from "./Users";

export default class PartyInfo {

    constructor(
        private readonly id: number,
        private readonly members: Player[] = [],
        private owner: Player
    ) {
        this.owner.properties.set(Users.PARTY_ID, this.id);
    }

    public getUsers(): Array<string> {
        const partyMembers: Array<string> = [];

        for (const user of this.members) {
            partyMembers.push(user.properties.get(Users.USERNAME));
        }

        partyMembers.push(this.owner.properties.get(Users.USERNAME));

        return partyMembers;
    }

    public getMemberCount(): number {
        return this.members.length;
    }

    public getNextOwner(): Player {
        return this.members[0];
    }

    public isMember(user: Player): boolean {
        return this.members.includes(user);
    }

    public addMember(user: Player): void {
        if (this.members.includes(user)) {
            throw new Error("Unable to add member already in the party");
        }

        this.members.push(user);
        user.properties.set(Users.PARTY_ID, this.id);
    }

    public removeMember(user: Player): void {
        const index: number = this.members.indexOf(user);

        if (index === -1) {
            throw new Error("Unable to remove member not in the party");
        }

        this.members.splice(index, 1);
        user.properties.set(Users.PARTY_ID, -1);
    }

    public getChannelListButOne(user: Player): Socket[] {
        const partyMembers: Socket[] = [];

        for (const u of this.members) {
            if (user !== u) {
                partyMembers.push(u.network.socket);
            }
        }

        partyMembers.push(this.owner.network.socket);

        return partyMembers;
    }

    public getChannelList(): Socket[] {
        const partyMembers: Socket[] = [];

        for (const u of this.members) {
            partyMembers.push(u.network.socket);
        }

        partyMembers.push(this.owner.network.socket);

        return partyMembers;
    }

    public getOwner(): string {
        return this.owner.properties.get(Users.USERNAME);
    }

    public setOwner(user: Player): void {
        this.addMember(this.owner);
        this.removeMember(user);

        this.owner = user;
        this.owner.properties.set(Users.PARTY_ID, this.id);
    }

    public getOwnerObject(): Player {
        return this.owner;
    }
}
