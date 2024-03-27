import type IGuild from "../database/interfaces/IGuild.ts";
import JSONObject from "../util/json/JSONObject.ts";
import JSONArray from "../util/json/JSONArray.ts";
import {format} from "date-fns";
import type IDispatchable from "../interfaces/entity/IDispatchable.ts";
import Player from "../player/Player.ts";
import database from "../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {guilds, users} from "../database/drizzle/schema.ts";
import PlayerController from "../controller/PlayerController.ts";
import logger from "../util/Logger.ts";

export default class Guild implements IDispatchable {

	private static readonly guilds: Map<number, Guild> = new Map<number, Guild>();

	private readonly _members: Map<number, Player> = new Map<number, Player>;

	public static async findOrCreate(id: number): Promise<Guild> {
		let guild: Guild | undefined = Guild.guilds.get(id);

		if (guild) {
			return guild;
		}

		logger.debug(`Guild ${id} was not found, creating a new one.`);

		guild = new Guild(id);

		const members: { username: string }[] = await database.query.users.findMany({
			columns: {
				username: true
			},
			where: eq(users.guildId, id)
		});

		for (let member of members) {
			const player: Player | undefined = PlayerController.findByUsername(member.username);

			if (player) {
				guild.onMemberJoin(player);
			}
		}

		Guild.guilds.set(id, guild);

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

	public onMemberJoin(player: Player) {
		this.members.set(player.network.id, player);
	}

	public onMemberLeave(networkId: number) {
		this.members.delete(networkId);

		if (Guild.guilds.size === 0) {
			Guild.guilds.delete(this.id);
		}
	}

	public async update(guild: IGuild | null | undefined = undefined): Promise<void> {
		this.writeObject(new JSONObject()
			.element("cmd", "updateGuild")
			.element("guild", await this.json(guild))
		);
	}

	public async json(guild: IGuild | null | undefined = undefined): Promise<JSONObject> {
		if (!guild) {
			guild = await database.query.guilds.findFirst({
				with: {
					members: {
						with: {
							currentServer: true,
						}
					}
				},
				where: eq(guilds.id, this.id)
			});
		}

		if (!guild) {
			return new JSONObject();
		}

		const members: JSONArray = new JSONArray();

		for (let member of guild.members!) {
			members.add(
				new JSONObject()
					.element("ID", member.id)
					.element("Level", member.level)
					.element("Rank", member.guildRank)
					.element("Server", member.currentServerId ? member.currentServer!.name : 'Offline')
					.element("userName", member.user!.username)
			);
		}

		return new JSONObject()
			.element("GuildID", guild.id)
			.element("MOTD", guild.messageOfTheDay)
			.element("MaxMembers", guild.maxMembers)
			.element("Name", guild.name)
			.element("dateUpdated", format(guild.dateUpdated, "yyyy-MM-dd'T'HH:mm:ss"))
			.element("guildRep", 0)
			.element("newRep", 0)
			.element("pending", new JSONObject())
			.element("pendingOfficer", new JSONObject())
			.element("ul", members);
	}

	public writeObject(data: JSONObject): void {
		for (let member of this.members.values()) {
			member.network.writeObject(data);
		}
	}

	public writeArray(command: string, data: Array<string | number>): void {
		for (let member of this.members.values()) {
			member.network.writeArray(command, data);
		}
	}

	public writeExcept(ignored: Player, data: string): void {
		for (let member of this.members.values()) {
			member.network.writeExcept(ignored, data);
		}
	}

	public writeObjectExcept(ignored: Player, data: JSONObject): void {
		for (let member of this.members.values()) {
			member.network.writeObjectExcept(ignored, data);
		}
	}

	public writeArrayExcept(ignored: Player, command: string, data: Array<string | number>): void {
		for (let member of this.members.values()) {
			member.network.writeArrayExcept(ignored, command, data);
		}
	}

}