import type Player from "../player/Player.ts";
import type IDispatchable from "../interfaces/entity/IDispatchable.ts";
import PlayerConst from "../player/PlayerConst.ts";
import type {Socket} from "net";
import type JSONObject from "../util/json/JSONObject.ts";

export default class Party implements IDispatchable {

	constructor(
		private readonly _id: number,
		private readonly members: Player[] = [],
		private owner: Player
	) {
		this.owner.properties.set(PlayerConst.PARTY_ID, this._id);
	}

	public get id(): number {
		return this._id;
	}

	public getUsers(): Array<string> {
		const partyMembers: Array<string> = [];

		for (const member of this.members) {
			partyMembers.push(member.username);
		}

		partyMembers.push(this.owner.username);

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
		user.properties.set(PlayerConst.PARTY_ID, this._id);
	}

	public removeMember(user: Player): void {
		const index: number = this.members.indexOf(user);

		if (index === -1) {
			throw new Error("Unable to remove member not in the party");
		}

		this.members.splice(index, 1);
		user.properties.set(PlayerConst.PARTY_ID, -1);
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
		return this.owner.username;
	}

	public setOwner(user: Player): void {
		this.addMember(this.owner);
		this.removeMember(user);

		this.owner = user;
		this.owner.properties.set(PlayerConst.PARTY_ID, this._id);
	}

	public getOwnerObject(): Player {
		return this.owner;
	}

	public writeObject(data: JSONObject): void {
		for (let member of this.members) {
			member.network.writeObject(data);
		}
	}

	public writeArray(command: string, data: Array<string | number>): void {
		for (let member of this.members) {
			member.network.writeArray(command, data);
		}
	}

	public writeExcept(ignored: Player, data: string): void {
		for (let member of this.members) {
			member.network.writeExcept(ignored, data);
		}
	}

	public writeObjectExcept(ignored: Player, data: JSONObject): void {
		for (let member of this.members) {
			member.network.writeObjectExcept(ignored, data);
		}
	}

	public writeArrayExcept(ignored: Player, command: string, data: Array<string | number>): void {
		for (let member of this.members) {
			member.network.writeArrayExcept(ignored, command, data);
		}
	}

}
