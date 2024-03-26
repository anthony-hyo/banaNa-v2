import type IUser from "../database/interfaces/IUser.ts";
import Player from "../player/Player";
import logger from "../util/Logger";
import GameController from "./GameController";
import type {Socket} from "net";
import PlayerNetwork from "../player/PlayerNetwork.ts";
import database from "../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {users} from "../database/drizzle/schema.ts";

export default class PlayerController {

	public static PLAYERS: Map<number, Player> = new Map<number, Player>();

	public static login(playerNetwork: PlayerNetwork, username: string, token: string): void {
		database.query.users
			/*.findFirst({
				where: and(
					eq(users.username, username),
					eq(users.token, token)
				)
			})*/
			.findFirst()
			.then((user: IUser | undefined): void => {
				if (user === undefined) {
					playerNetwork.writeArray(`loginResponse`, `false`, `-1`, username, `Player Data for '${username}' could not be retrieved.<br>Please contact the staff to resolve the issue.`);

					this.removeConnection(username);
					return;
				}

				database
					.update(users)
					.set({
						token: null
					})
					.where(eq(users.id, user.id));

				if (!GameController.instance().server.isOnline || (GameController.instance().server.isStaffOnly && user.accessId < 40)) {
					playerNetwork.writeArray(`loginResponse`, `false`, `-1`, username, `A game update/maintenance is currently ongoing.<br>Only the staff can enter the server at the moment.`);

					this.removeConnection(username);
					return;
				}

				const exitingPlayer: Player | undefined = this.findByUsername(username);

				if (exitingPlayer !== undefined) {
					playerNetwork.writeArray(`loginResponse`, `false`, `-1`, username, `You logged in from a different location.`);

					this.removeConnection(username);
				}

				const player: Player = new Player(user, playerNetwork);

				PlayerController.add(player);

				//["loginResponse","-1","true","25860","KATHLEEN","","2024-03-13T00:46:57","SETTINGS LOGIN","3.00941"]
				playerNetwork.writeArray(`loginResponse`, `true`, player.network.id, user.username, `Message of the day`, `2017-09-30T10:58:57`, GameController.instance().settings, "3.00941");

				database
					.update(users)
					.set({
						currentServerId: 1
					})
					.where(eq(users.id, user.id));
			});
	}

	public static add(player: Player): void {
		this.PLAYERS.set(player.network.id, player);
	}

	public static remove(player: Player): void {
		this.PLAYERS.delete(player.network.id);
	}

	public static find(id: number): Player | undefined {
		return this.PLAYERS.get(id);
	}

	public static findByUsername(name: string): Player | undefined {
		const nameCase: string = name.toLowerCase();

		for (let player of this.players()) {
			if (player.username == nameCase) {
				return player;
			}
		}

		return undefined;
	}

	public static players(): IterableIterator<Player> {
		return this.PLAYERS.values();
	}

	public static sockets(): Array<Socket> {
		const sockets: Array<Socket> = new Array<Socket>();

		for (let player of this.players()) {
			sockets.push(player.network.socket);
		}

		return sockets;
	}

	public static total(): number {
		return this.PLAYERS.size;
	}

	private static removeConnection(name: string): void {
		const player: Player | undefined = this.findByUsername(name);

		if (player !== undefined) {
			player.disconnect();
		}

		logger.info(`User ${name} ${(this.findByUsername(name) === undefined ? "Connection still exist" : "Connection Removed")}`);
	}

}
