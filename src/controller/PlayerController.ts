import type IUser from "../database/interfaces/IUser.ts";
import Player from "../avatar/player/Player";
import logger from "../util/Logger";
import GameController from "./GameController";
import database from "../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {users} from "../database/drizzle/schema.ts";
import type INetworkData from "../interfaces/network/INetworkData.ts";
import type {Socket} from "bun";
import NetworkEncoder from "../network/NetworkEncoder.ts";

export default class PlayerController {

	public static PLAYERS: Map<number, Player> = new Map<number, Player>();

	public static async login(socket: Socket<INetworkData>, username: string, token: string): Promise<void> {
		const user: IUser | undefined = await database.query.users
			/*.findFirst({
				where: and(
					eq(users.username, username),
					eq(users.token, token)
				)
			})*/
			.findFirst()

		const avatarName: string = user!.username.toLowerCase();

		if (user === undefined) {
			NetworkEncoder.writeArray(socket, `loginResponse`, [`false`, `-1`, avatarName, `Player Data for '${avatarName}' could not be retrieved.<br>Please contact the staff to resolve the issue.`]);

			await this.removeConnection(avatarName);
			return;
		}

		if (!GameController.instance().server.isOnline || (GameController.instance().server.isStaffOnly && user.accessId < 40)) {
			NetworkEncoder.writeArray(socket, `loginResponse`, [`false`, `-1`, avatarName, `A game update/maintenance is currently ongoing.<br>Only the staff can enter the server at the moment.`]);

			database
				.update(users)
				.set({
					token: null
				})
				.where(eq(users.id, user.id));

			await this.removeConnection(avatarName);
			return;
		}

		const exitingPlayer: Player | undefined = this.findByUsername(avatarName);

		if (exitingPlayer !== undefined) {
			NetworkEncoder.writeArray(socket, `loginResponse`, [`false`, `-1`, avatarName, `You logged in from a different location.`]);

			await this.removeConnection(avatarName);
		}

		const player: Player = new Player(user, socket);

		socket.data.player = player;

		PlayerController.add(player);

		NetworkEncoder.writeArray(socket, `loginResponse`, [`true`, player.avatarId, avatarName, ``, `2017-09-30T10:58:57`, GameController.instance().settings, "3.00941"]);

		database
			.update(users)
			.set({
				token: null,
				currentServerId: 1
			})
			.where(eq(users.id, user.id));
	}

	public static add(player: Player): void {
		this.PLAYERS.set(player.avatarId, player);
	}

	public static remove(player: Player): void {
		this.PLAYERS.delete(player.avatarId);
	}

	public static find(id: number): Player | undefined {
		return this.PLAYERS.get(id);
	}

	public static findByUsername(name: string): Player | undefined {
		const nameCase: string = name.toLowerCase();

		for (let player of this.players()) {
			if (player.avatarName == nameCase) {
				return player;
			}
		}

		return undefined;
	}

	public static players(): IterableIterator<Player> {
		return this.PLAYERS.values();
	}

	public static total(): number {
		return this.PLAYERS.size;
	}

	private static async removeConnection(name: string): Promise<void> {
		const player: Player | undefined = this.findByUsername(name);

		if (player !== undefined) {
			await player.disconnect();
		}

		logger.info(`User ${name} ${(this.findByUsername(name) === undefined ? "Connection still exist" : "Connection Removed")}`);
	}

}
