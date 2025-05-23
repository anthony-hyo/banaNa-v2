import type Player from "../avatar/player/Player.ts";
import type IDispatchable from "../interfaces/entity/IDispatchable.ts";
import JSONObject from "../util/json/JSONObject.ts";
import logger from "../util/Logger.ts";

export default class Party implements IDispatchable {

	private static readonly parties: Map<number, Party> = new Map<number, Party>();

	private readonly _members: Map<number, Player> = new Map<number, Player>;

	private _owner!: Player;

	public static async findOrCreate(id: number): Promise<Party> {
		let guild: Party | undefined = Party.parties.get(id);

		if (guild) {
			return guild;
		}

		logger.debug(`Party ${id} was not found, creating a new one.`);

		guild = new Party(id);

		Party.parties.set(id, guild);

		return guild;
	}

	constructor(
		private readonly _id: number,
	) {
	}

	public get id(): number {
		return this._id;
	}

	public get members(): Map<number, Player> {
		return this._members;
	}

	public get owner(): Player {
		return this._owner;
	}

	public set owner(player: Player) {
		this._owner = player;
	}

	public onMemberJoin(player: Player): void {
		this.members.set(player.avatarId, player);
		player.partyId = this.id;
	}

	public onMemberLeave(player: Player): void {
		this.writeObject(new JSONObject()
			.element("cmd", "pr")
			.element("owner", this.owner.username)
			.element("typ", "l")
			.element("unm", player.username)
		);

		this.members.delete(player.avatarId);

		player.partyId = undefined;

		if (this.members.size <= 1) {
			this.writeObject(new JSONObject()
				.element("cmd", "pc")
			);

			Party.parties.delete(this.id);
			return;
		}

		if (this.owner.avatarId === player.avatarId) {
			const firstMember = this.members.values().next().value;

			if (firstMember !== undefined) {
				this.owner = firstMember;
			}
		}
	}

	public writeObject(data: JSONObject): void {
		for (let member of this._members.values()) {
			member.writeObject(data);
		}
	}

	public writeArray(command: string, data: Array<string | number>): void {
		for (let member of this._members.values()) {
			member.writeArray(command, data);
		}
	}

	public writeExcept(ignored: Player, data: string): void {
		for (let member of this._members.values()) {
			member.writeExcept(ignored, data);
		}
	}

	public writeObjectExcept(ignored: Player, data: JSONObject): void {
		for (let member of this._members.values()) {
			member.writeObjectExcept(ignored, data);
		}
	}

	public writeArrayExcept(ignored: Player, command: string, data: Array<string | number>): void {
		for (let member of this._members.values()) {
			member.writeArrayExcept(ignored, command, data);
		}
	}

}
