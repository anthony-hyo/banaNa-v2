import type IDispatchable from "../interfaces/entity/IDispatchable.ts";
import JSONObject from "../util/json/JSONObject.ts";
import type Player from "../player/Player.ts";
import database from "../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {users} from "../database/drizzle/schema.ts";
import type IArea from "../database/interfaces/IArea.ts";
import PlayerConst from "../player/PlayerConst.ts";
import {Monster} from "../monster/Monster.ts";
import JSONArray from "../util/json/JSONArray.ts";
import GameController from "../controller/GameController.ts";

export default class Room implements IDispatchable {

	private readonly _players: Map<number, Player> = new Map<number, Player>();
	private readonly _monsters: Map<number, Monster> = new Map<number, Monster>();

	public isPvPDone: any;

	public blueTeamName: any;
	public redTeamName: any;

	public blueTeamScore: any;
	public redTeamScore: any;

	public pvpFactions: any;

	constructor(
		public readonly data: IArea,
		private readonly _id: number,
		private readonly _name: string,
	) {
		if (this.data.monsters) {
			for (const monster of this.data.monsters) {
				this.monsters.set(monster.monsterAreaId, new Monster(monster, this));
			}
		}
	}

	public get id(): number {
		return this._id;
	}

	public get databaseId(): number {
		return this.data.id;
	}

	public get name(): string {
		return this._name;
	}

	public get players(): Map<number, Player> {
		return this._players;
	}

	public get monsters(): Map<number, Monster> {
		return this._monsters;
	}

	public async dataAsync(): Promise<IArea> {
		return (
			await database.query.areas
				.findFirst({
					where: eq(users.id, this.databaseId)
				})
		)!;
	}


	public get isFull(): boolean {
		return this.players.size >= this.data.max_players;
	}

	public get isNotFull(): boolean {
		return !this.isFull;
	}





	public addPlayer(player: Player): void {
		this._players.set(player.network.id, player);
		player.room = this;
	}

	public removePlayer(player: Player): void {
		this._players.delete(player.network.id);
	}

	public exit(player: Player): void {
		this.writeArrayExcept(player, "exitArea", String(player.network.id), player.username);

		if (this.data.is_pvp) {
			this.writeArrayExcept(player, "server", player.username + " has left the match.");
		}
	}

	public addPvPScore(score: number, teamId: number): void {
		if (this.isPvPDone) {
			return;
		}

		switch (teamId) {
			case 0:
				this.blueTeamScore = score + this.blueTeamScore >= 1000 ? 1000 : score + this.blueTeamScore;
				break;
			case 1:
				this.redTeamScore = score + this.redTeamScore >= 1000 ? 1000 : score + this.redTeamScore;
				break;
			default:
				break;
		}
	}

	public relayPvPEvent(monster: Monster, teamId: number): void {
		const pvpe: JSONObject = new JSONObject()
			.element("cmd", "PVPE")
			.element("typ", "kill")
			.element("team", teamId);

		if (monster.data.monster!.name.includes("Restorer")) {
			pvpe.element("val", "Restorer");
			this.addPvPScore(50, teamId);
		} else if (monster.data.monster!.name.includes("Brawler")) {
			pvpe.element("val", "Brawler");
			this.addPvPScore(25, teamId);
		} else if (monster.data.monster!.name.includes("Captain")) {
			pvpe.element("val", "Captain");
			this.addPvPScore(1000, teamId);
		} else if (monster.data.monster!.name.includes("General")) {
			pvpe.element("val", "General");
			this.addPvPScore(100, teamId);
		} else if (monster.data.monster!.name.includes("Knight")) {
			pvpe.element("val", "Knight");
			this.addPvPScore(100, teamId);
		} else {
			this.addPvPScore(monster.data.monster!.level, teamId);
		}

		if (pvpe.has("val")) {
			this.writeObject(pvpe);
		}
	}

	public getPvPResult(room: Room): JSONObject {
		const pvp: JSONObject = new JSONObject()
			.element("cmd", "PVPS");

		if (!this.isPvPDone && (this.redTeamScore >= 1000 || this.blueTeamScore >= 1000)) {
			pvp.element("cmd", "PVPC");

			let winnerTeamId;

			if (this.redTeamScore >= 1000) {
				winnerTeamId = 1;

				GameController.instance().serverMessage(`<font color="#ffffff"><a href="http://augoeides.org/?profile=${this.redTeamName}" target="_blank">${this.redTeamName}</a></font> won the match against <font color="#ffffff"><a href="http://infinityarts.co/?profile=${this.blueTeamName}" target="_blank">${this.blueTeamName}</a></font>`);
			} else if (this.blueTeamScore >= 1000) {
				winnerTeamId = 0;

				GameController.instance().serverMessage(`<font color="#ffffff"><a href="http://augoeides.org/?profile=${this.blueTeamName}" target="_blank">${this.blueTeamName}</a></font> won the match against <font color="#ffffff"><a href="http://infinityarts.co/?profile=${this.redTeamName}" target="_blank">${this.redTeamName}</a></font>`);
			}

			//TODO: Optimize
			const players: Set<Player> = new Set<Player>();

			for (const user of this.players.values()) {
				if (user.properties.get(PlayerConst.PVP_TEAM) === winnerTeamId) {
					players.add(user);
				}
			}

			//TODO: room warp with players

			this.isPvPDone = true;
		}

		const pvpScore: JSONArray = new JSONArray();

		pvpScore.add(
			new JSONObject()
				.element("v", this.blueTeamScore)
		);

		pvpScore.add(
			new JSONObject()
				.element("v", this.redTeamScore)
		);

		return pvp
			.element("pvpScore", pvpScore);
	}

	public moveToArea(player: Player): void {
		const mapName: string = this.name.split("-")[0] == "house" ? this.name : this.name.split("-")[0];

		const uoBranch: JSONArray = new JSONArray();

		for (const player of this.players.values()) {
			uoBranch.add(player.getProperties());
		}

		const moveToArea: JSONObject = new JSONObject()
			.element("cmd", "moveToArea")
			.element("areaId", this.id)
			.element("areaName", this.name)
			.element("sExtra", "")
			.element("strMapFileName", this.data.file)
			.element("strMapName", mapName)
			.element("uoBranch", uoBranch)
			.element("monBranch", this.getMonBranch())
			.element("intType", 2);

		/*if (area instanceof House) {
			mta.element("houseData", (area as House).getData());
		}

		if (area instanceof Hall) {
			mta.element("guildData", this.world.users.getGuildHallData((area as Hall).getGuildId()));
			mta.element("strMapName", "guildhall");
		}*/

		if (this.data.is_pvp) {
			moveToArea
				.element("pvpTeam", player.properties.get(PlayerConst.PVP_TEAM))
				.element("PVPFactions", this.pvpFactions);

			const pvpScore: JSONArray = new JSONArray();

			pvpScore.add(
				new JSONObject()
					.element("v", this.blueTeamScore)
			);

			pvpScore.add(
				new JSONObject()
					.element("v", this.redTeamScore)
			);

			moveToArea.element("pvpScore", pvpScore);
		}

		if (this.data.monsters) {
			moveToArea
				.element("mondef", this.getMonsterDefinition())
				.element("monmap", this.getMonMap());
		}

		player.network.writeObject(moveToArea);
	}

	private getMonMap(): JSONArray {
		const monMap: JSONArray = new JSONArray();

		for (const monster of this.monsters.values()) {
			monMap.add(new JSONObject()
				.element("MonID", monster.monsterId)
				.element("MonMapID", monster.data.monsterAreaId)
				.element("bRed", 0)
				.element("intRSS", -1)
				.element("strFrame", monster.data.frame)
			);
		}

		return monMap;
	}

	private getMonsterDefinition(): JSONArray {
		const monDef: JSONArray = new JSONArray();

		for (const monster of this.monsters.values()) {
			monDef.add(
				new JSONObject()
					.element("MonID", monster.monsterId)
					.element("intHP", monster.status.health)
					.element("intHPMax", monster.status.healthMax)
					.element("intLevel", monster.data.monster!.level)
					.element("intMP", monster.status.mana)
					.element("intMPMax", monster.status.manaMax)
					.element("sRace", monster.data.monster!.typeRace!.name)
					.element("strBehave", "walk")
					.element("strElement", monster.data.monster!.typeElement!.name)
					.element("strLinkage", monster.data.monster!.linkage)
					.element("strMonFileName", monster.data.monster!.file)
					.element("strMonName", monster.data.monster!.name)
			);
		}

		return monDef;
	}

	private getMonBranch(): JSONArray {
		const monBranch: JSONArray = new JSONArray();

		for (const monster of this.monsters.values()) {
			const mon: JSONObject = new JSONObject()
				.element("MonID", String(monster.data.monsterId))
				.element("MonMapID", String(monster.data.monsterAreaId))
				.element("bRed", "0")
				.element("iLvl", monster.data.monster!.level)
				.element("intHP", monster.status.health)
				.element("intHPMax", monster.status.healthMax)
				.element("intMP", monster.status.mana)
				.element("intMPMax", monster.status.manaMax)
				.element("intState", monster.getState())
				.element("wDPS", monster.data.monster!.damagePerSecond);

			if (this.data.is_pvp) {
				const react: JSONArray = new JSONArray();

				if (monster.data.monster!.teamId > 0) {
					react.add(0);
					react.add(1);
				} else {
					react.add(1);
					react.add(0);
				}

				mon.element("react", react);
			}

			monBranch.add(mon);
		}

		return monBranch;
	}

	public writeObject(data: JSONObject): void {
		for (let [, player] of this.players) {
			player.network.writeObject(data);
		}
	}

	public writeArray(...data: any[]): void {
		for (let [, player] of this.players) {
			player.network.writeArray(data);
		}
	}

	public writeExcept(ignored: Player, data: string): void {
		for (let [networkId, player] of this.players) {
			if (networkId !== ignored.network.id) {
				player.network.write(data);
			}
		}
	}

	public writeObjectExcept(ignored: Player, data: JSONObject): void {
		for (let [networkId, player] of this.players) {
			if (networkId !== ignored.network.id) {
				player.network.writeObject(data);
			}
		}
	}

	public writeArrayExcept(ignored: Player, ...data: any[]): void {
		for (let [networkId, player] of this.players) {
			if (networkId !== ignored.network.id) {
				player.network.writeArray(data);
			}
		}
	}

}