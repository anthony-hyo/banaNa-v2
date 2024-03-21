import type IDispatchable from "../interfaces/entity/IDispatchable.ts";
import JSONObject from "../util/json/JSONObject.ts";
import type Player from "../player/Player.ts";
import database from "../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {maps, users} from "../database/drizzle/schema.ts";
import type IArea from "../database/interfaces/IArea.ts";
import type RoomData from "./RoomData.ts";
import PlayerConst from "../player/PlayerConst.ts";
import {Monster} from "../monster/Monster.ts";
import JSONArray from "../util/json/JSONArray.ts";
import IMonster from "../database/interfaces/IMonster.ts";
import GameController from "../controller/GameController.ts";
import RoomConst from "./RoomConst.ts";

export default class Room implements IDispatchable {

	public static readonly NONE: Room = new Room(-1, 1);
	public data!: RoomData;
	private readonly _players: Map<number, Player> = new Map<number, Player>();

	public properties: Map<string, any> = new Map<string, any>();

	constructor(
		private readonly _id: number,
		private readonly _databaseId: number,
		private readonly _name: string
	) {
	}

	public get id(): number {
		return this._id;
	}

	public get databaseId(): number {
		return this._databaseId;
	}

	public get name(): string {
		return this._name;
	}

	public get players(): Map<number, Player> {
		return this._players;
	}

	public get playersCount(): number {
		return this._players.size;
	}

	public async dataAsync(): Promise<IArea> {
		return (
			await database.query.maps
				.findFirst({
					where: eq(users.id, this.databaseId)
				})
		)!;
	}

	public addPlayer(player: Player): void {
		this._players.set(player.network.id, player);
		player.room = this;
	}

	public removePlayer(player: Player): void {
		this._players.delete(player.network.id);
	}


	public exit(player: Player): void {
		this.writeArrayExcept(player, "exitArea", String(player.networkid()), player.username());

		if (this.world.areas.get(this.getName().split("-")[0]) != null && this.world.areas.get(this.getName().split("-")[0]).isPvP()) {
			this.writeArrayExcept(player, "server", player.username() + " has left the match.");
		}
	}

	public basicRoomJoin(player: Player, roomName: string, roomFrame: string = "Enter", roomPad: string = "Spawn"): void {
		const mapName: string = roomName.split("-")[0];
		if (!this.world.areas.containsKey(mapName)) {
			player.network.writeArray("warning", "\"" + mapName + "\" is not a recognized map name.");
			return;
		}

		let roomToJoin: Room = this.lookForRoom(roomName);

		if (roomToJoin == null) {
			roomToJoin = this.generateRoom(roomName);
		}

		if (this.checkLimits(roomToJoin, player) == RoomConst.ROOM_OK) {
			this.joinRoom(roomToJoin, player, roomFrame, roomPad);
		}
	}

	public joinRoom(player: Player, frame: string = "Enter", pad: string = "Spawn"): void {
		if (player == null) {
			return;
		}

		player.properties.set(PlayerConst.FRAME, frame);
		player.properties.set(PlayerConst.PAD, pad);
		player.properties.set(PlayerConst.TX, 0);
		player.properties.set(PlayerConst.TY, 0);

		this.helper.joinRoom(player, player.room, this.getId(), true, "", false, true);

		this.moveToArea(player);

		player.network.writeArray("server", "You joined \"" + this.getName() + "\"!");
	}

	public lookForRoom(name: string): Room { //TODO delete
		let room: Room = this.zone.getRoomByName(name);

		if (room != null) {
			return room;
		} else {
			const arr: string[] = name.split("-");
			const areaName: string = arr[0];

			if (arr.length > 1) {
				try {
					const roomKey: number = parseInt(arr[1]);

					if (roomKey > 90000) {
						return this.generateRoom(name);
					}
				} catch (nre) {
				}
			}

			for (let i: number = 1; i < 1000; i++) {
				const search: string = areaName + "-" + i;
				const test: Room = this.zone.getRoomByName(search);

				if (test != null) {
					if (test.getMaxUsers() > test.howManyUsers()) {
						return test;
					}
				}
			}
		}

		return null;
	}

	public checkLimits(player: Player): number {
		const areaName: string = this.getName().split("-")[0].equals("house") ? this.getName() : this.getName().split("-")[0];

		if (this.data.required_level > parseInt(player.properties.get(PlayerConst.LEVEL))) {
			player.network.writeArray("warning", "\"" + areaName + "\" requires level " + this.data.required_level + " and above to enter.");
			return RoomConst.ROOM_LEVEL_LIMIT;
		} else if (this.data.is_pvp) {
			player.network.writeArray("warning", "\"" + areaName + "\" is locked zone.");
			return RoomConst.ROOM_LOCKED;
		} else if (this.data.is_staff_only && !(player.isAdmin() || player.isModerator())) {
			player.network.writeArray("warning", "\"" + areaName + "\" is not a recognized map name.");
			return RoomConst.ROOM_STAFF_ONLY;
		} else if (this.data.is_upgrade_only && parseInt(player.properties.get(PlayerConst.UPGRADE_DAYS)) <= 0) {
			player.network.writeArray("warning", "\"" + areaName + "\" is member only.");
			return RoomConst.ROOM_REQUIRE_UPGRADE;
		} else if (this.players.has(player.network.id)) {
			player.network.writeArray("warning", "Cannot join a room you are currently in!");
			return RoomConst.ROOM_USER_INSIDE;
		} else if (area instanceof Hall && (area as Hall).getGuildId() != parseInt(player.properties.get(PlayerConst.GUILD_ID))) {
			player.network.writeArray("warning", "You cannot access other guild halls!");
			return RoomConst.ROOM_LOCKED;
		} else if (this.playersCount >= this.data.max_players) {
			player.network.writeArray("warning", "Room join failed, destination room is full.");
			return RoomConst.ROOM_FULL;
		}

		return RoomConst.ROOM_OK;
	}

	public generateRoom(name: string): Room { //TODO: delete
		if (name.includes("-")) {
			try {
				const roomKey: number = parseInt(name.split("-")[1]);
				if (roomKey >= 90000) {
					const generatedName: string = name.split("-")[0] + "-" + (this.privKeyGenerator.nextInt(9999) + 90000);
					return this.createRoom(generatedName);
				} else if (roomKey >= 1000) {
					const generatedName: string = name.split("-")[0] + "-" + roomKey;
					return this.createRoom(generatedName);
				}
			} catch (nre) {
			}
		}

		const areaName: string = name.split("-")[0];
		for (let i: number = 1; i < 1000; i++) {
			const search: string = areaName + "-" + i;
			const test: Room = this.zone.getRoomByName(search);
			if (test == null) {
				return this.createRoom(search);
			}
		}

		return null;
	}

	public static async createRoom(name: string): Promise<Room> {//TODO: move
		const map: Map<string, string> = new Map<string, string>();

		const mapName: string = name.split("-")[0] == "house" ? name : name.split("-")[0];

		const data: IArea | undefined = await database.query.maps.findFirst({
			where: eq(maps.name, mapName),
			with: {
				mapCells: true,
				mapItems: {
					with: {
						item: true
					}
				},
				mapMonsters: {
					with: {
						monster: true,
					}
				},
			}
		});

		map.set("isGame", "false");
		map.set("maxU", room.data.max_players);
		map.set("name", name);
		map.set("uCount", "false");

		const room: Room = room.helper.createRoom(room.zone, map, null, false, true);

		const monsters: Map<number, Monster> = new Map<number, Monster>();

		if (room.data.monsters!.length != 0) {
			for (const mapMonster of room.data.monsters!) {
				monsters.set(mapMonster.monMapId, new Monster(mapMonster, room));
			}
		}

		if (room.data.is_pvp) {
			room.properties.set(RoomConst.PVP_DONE, false);
			room.properties.set(RoomConst.BLUE_TEAM_SCORE, 0);
			room.properties.set(RoomConst.RED_TEAM_SCORE, 0);

			room.properties.set(RoomConst.BLUE_TEAM_NAME, "Team Blue");

			room.properties.set(RoomConst.RED_TEAM_NAME, "Team Red\"");

			const PVPFactions: JSONArray = new JSONArray();

			PVPFactions.add(
				new JSONObject()
					.element("id", 8)
					.element("sName", "Blue")
			);

			PVPFactions.add(
				new JSONObject()
					.element("id", 7)
					.element("sName", "Red")
			);

			room.properties.set(RoomConst.PVP_FACTIONS, PVPFactions);
		}

		room.properties.set(RoomConst.MONSTERS, monsters);

		return room;
	}

	public addPvPScore(score: number, teamId: number): void {
		if (this.properties.get(RoomConst.PVP_DONE) as boolean) {
			return;
		}

		const rScore: number = this.properties.get(RoomConst.RED_TEAM_SCORE) as number;
		const bScore: number = this.properties.get(RoomConst.BLUE_TEAM_SCORE) as number;
		switch (teamId) {
			case 0:
				this.properties.set(RoomConst.BLUE_TEAM_SCORE, score + bScore >= 1000 ? 1000 : score + bScore);
				break;
			case 1:
				this.properties.set(RoomConst.RED_TEAM_SCORE, score + rScore >= 1000 ? 1000 : score + rScore);
				break;
			default:
				break;
		}
	}

	public relayPvPEvent(ai: Monster, teamId: number): void {
		const monster: IMonster = this.world.monsters.get(ai.monsterId);
		const monName: string = monster.name;
		const room: Room = ai.getRoom();

		const pvpe: JSONObject = new JSONObject()
			.element("cmd", "PVPE")
			.element("typ", "kill")
			.element("team", teamId);

		if (monName.includes("Restorer")) {
			pvpe.element("val", "Restorer");
			this.addPvPScore(room, 50, teamId);
		} else if (monName.includes("Brawler")) {
			pvpe.element("val", "Brawler");
			this.addPvPScore(room, 25, teamId);
		} else if (monName.includes("Captain")) {
			pvpe.element("val", "Captain");
			this.addPvPScore(room, 1000, teamId);
		} else if (monName.includes("General")) {
			pvpe.element("val", "General");
			this.addPvPScore(room, 100, teamId);
		} else if (monName.includes("Knight")) {
			pvpe.element("val", "Knight");
			this.addPvPScore(room, 100, teamId);
		} else {
			this.addPvPScore(room, monster.level, teamId);
		}

		if (pvpe.has("val")) {
			this.world.send(pvpe, this.getChannellList());
		}
	}

	public getPvPResult(room: Room): JSONObject {
		const pvpcmd: JSONObject = new JSONObject()
			.element("cmd", "PVPS");

		const bs: JSONObject = new JSONObject();
		const rs: JSONObject = new JSONObject();

		const redScore: number = this.properties.get(RoomConst.RED_TEAM_SCORE) as number;
		const blueScore: number = this.properties.get(RoomConst.BLUE_TEAM_SCORE) as number;

		rs.put("v", redScore);
		bs.put("v", blueScore);

		if (!(this.properties.get(RoomConst.PVP_DONE) as boolean) && (redScore >= 1000 || blueScore >= 1000)) {
			pvpcmd.put("cmd", "PVPC");

			const rName: string = this.properties.get(RoomConst.RED_TEAM_NAME) as string;
			const bName: string = this.properties.get(RoomConst.BLUE_TEAM_NAME) as string;

			if (redScore >= 1000) {
				GameController.instance().serverMessage(`<font color="#ffffff"><a href="http://augoeides.org/?profile=${rName}" target="_blank">${rName}</a></font> won the match against <font color="#ffffff"><a href="http://infinityarts.co/?profile=${bName}" target="_blank">${bName}</a></font>`);

				const users: Set<Player> = new Set<Player>();

				for (const user of this.getAllUsers()) {
					if (user.properties.get(PlayerConst.PVP_TEAM) === 1) {
						users.add(user);
					}
				}

				this.world.scheduleTask(new WarpUser(this.world, users), 5, TimeUnit.SECONDS);
			} else if (blueScore >= 1000) {
				GameController.instance().serverMessage(`<font color="#ffffff"><a href="http://augoeides.org/?profile=${bName}" target="_blank">${bName}</a></font> won the match against <font color="#ffffff"><a href="http://infinityarts.co/?profile=${rName}" target="_blank">${rName}</a></font>`);

				const users: Set<Player> = new Set<Player>();

				for (const user of this.getAllUsers()) {
					if (user.properties.get(PlayerConst.PVP_TEAM) === 0) {
						users.add(user);
					}
				}

				this.world.scheduleTask(new WarpUser(this.world, users), 9, TimeUnit.SECONDS);
			}

			this.properties.set(RoomConst.PVP_DONE, true);
		}

		const pvpScore: JSONArray = new JSONArray();

		pvpScore.add(bs);
		pvpScore.add(rs);

		pvpcmd.put("pvpScore", pvpScore);

		return pvpcmd;
	}

	private moveToArea(player: Player): void {
		const mta: JSONObject = new JSONObject();
		const mapName: string = this.getName().split("-")[0].equals("house") ? this.getName() : this.getName().split("-")[0];
		const area: IArea = this.world.areas.get(mapName);
		const uoBranch: JSONArray = new JSONArray();

		const users: Player[] = this.getAllUsers();

		for (const userInRoom of users) {
			const userObj: JSONObject = this.world.users.getProperties(userInRoom, room);
			uoBranch.add(userObj);
		}

		mta.element("cmd", "moveToArea");
		mta.element("areaId", this.getId());
		mta.element("areaName", this.getName());
		mta.element("sExtra", "");
		mta.element("strMapFileName", area.file);
		mta.element("strMapName", mapName);
		mta.element("uoBranch", uoBranch);
		mta.element("monBranch", this.getMonBranch(room, area));
		mta.element("intType", 2);

		/*if (area instanceof House) {
			mta.element("houseData", (area as House).getData());
		}

		if (area instanceof Hall) {
			mta.element("guildData", this.world.users.getGuildHallData((area as Hall).getGuildId()));
			mta.element("strMapName", "guildhall");
		}*/

		if (area.pvp) {
			mta
				.element("pvpTeam", player.properties.get(PlayerConst.PVP_TEAM))
				.element("PVPFactions", this.properties.get(RoomConst.PVP_FACTIONS));

			const bs: JSONObject = new JSONObject();
			bs.put("v", this.properties.get(RoomConst.BLUE_TEAM_SCORE));

			const rs: JSONObject = new JSONObject();
			rs.put("v", this.properties.get(RoomConst.RED_TEAM_SCORE));

			const pvpScore: JSONArray = new JSONArray();
			pvpScore.add(bs);
			pvpScore.add(rs);

			mta.element("pvpScore", pvpScore);
		}

		if (area.monsters.length != 0) {
			mta
				.element("mondef", this.getMonsterDefinition(area))
				.element("monmap", this.getMonMap(area));
		}

		player.network.writeObject(mta);
	}

	private getMonMap(area: IArea): JSONArray {
		const monMap: JSONArray = new JSONArray();
		for (const mapMonster of area.monsters) {
			const monInfo: JSONObject = new JSONObject();

			monInfo.put("MonID", String(mapMonster.monsterId));
			monInfo.put("MonMapID", String(mapMonster.getMonMapId()));
			monInfo.put("bRed", 0);
			monInfo.put("intRSS", String(-1));
			monInfo.put("strFrame", mapMonster.getFrame());

			monMap.add(monInfo);
		}
		return monMap;
	}

	private getMonsterDefinition(area: IArea): JSONArray {
		const monDef: JSONArray = new JSONArray();

		for (const mapMonster of area.monsters) {
			const monInfo: JSONObject = new JSONObject();

			const monster: IMonster = this.world.monsters.get(mapMonster.monsterId);

			monInfo.put("MonID", String(mapMonster.monsterId));
			monInfo.put("intHP", monster.health);
			monInfo.put("intHPMax", monster.health);
			monInfo.put("intLevel", monster.level);
			monInfo.put("intMP", monster.mana);
			monInfo.put("intMPMax", monster.mana);
			monInfo.put("sRace", monster.race);
			monInfo.put("strBehave", "walk");
			monInfo.put("strElement", monster.element);
			monInfo.put("strLinkage", monster.linkage);
			monInfo.put("strMonFileName", monster.file);
			monInfo.put("strMonName", monster.name);

			monDef.add(monInfo);
		}

		return monDef;
	}

	private getMonBranch(area: IArea): JSONArray {
		const monBranch: JSONArray = new JSONArray();
		const monsters: Map<number, Monster> = this.properties.get(RoomConst.MONSTERS) as Map<number, Monster>;

		for (const actMon of monsters.values()) {
			const mon: JSONObject = new JSONObject();

			const monster: IMonster = this.world.monsters.get(actMon.monsterId);

			mon.put("MonID", String(actMon.monsterId));
			mon.put("MonMapID", String(actMon.getMapId()));
			mon.put("bRed", "0");
			mon.put("iLvl", monster.level);
			mon.put("intHP", actMon.health);
			mon.put("intHPMax", monster.health);
			mon.put("intMP", actMon.mana);
			mon.put("intMPMax", monster.mana);
			mon.put("intState", actMon.getState());
			mon.put("wDPS", monster.damage_per_second);

			if (area.pvp) {
				const react: JSONArray = new JSONArray();

				if (monster.teamId > 0) {
					react.add(0);
					react.add(1);
				} else {
					react.add(1);
					react.add(0);
				}

				mon.put("react", react);
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