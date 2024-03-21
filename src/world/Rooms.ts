import {MonsterAI} from "../ai/MonsterAI";
import type IArea from "../database/interfaces/IArea.ts";
import type IMonster from "../database/interfaces/IMonster.ts";
import ExtensionHelper from "../examples/ExtensionHelper";
import type Zone from "../examples/Zone";
import type Room from "../room/Room";
import Random from "../util/Random";
import JSONArray from "../util/json/JSONArray";
import JSONObject from "../util/json/JSONObject";
import PlayerConst from "./PlayerConst.ts";
import type Player from "../player/Player.ts";
import GameController from "../controller/GameController.ts";

export class Rooms {

	public static readonly PVP_FACTIONS: string = "pvpfactions";
	public static readonly PVP_DONE: string = "done";
	public static readonly RED_TEAM_SCORE: string = "rscore";
	public static readonly BLUE_TEAM_SCORE: string = "bscore";
	public static readonly BLUE_TEAM_NAME: string = "bteamname";
	public static readonly RED_TEAM_NAME: string = "rteamname";
	public static readonly MONSTERS: string = "monsters";

	public static readonly ROOM_LOCKED: number = 6;
	public static readonly ROOM_STAFF_ONLY: number = 5;
	public static readonly ROOM_REQUIRE_UPGRADE: number = 4;
	public static readonly ROOM_LEVEL_LIMIT: number = 3;
	public static readonly ROOM_USER_INSIDE: number = 2;
	public static readonly ROOM_FULL: number = 1;
	public static readonly ROOM_OK: number = 0;

	private readonly zone: Zone;
	private readonly helper: ExtensionHelper;
	private readonly privKeyGenerator: Random;

	constructor(zone: Zone, world: World) {
		this.world = world;
		this.zone = zone;
		this.helper = ExtensionHelper.instance();
		this.privKeyGenerator = new Random();
	}

	public exit(room: Room, player: Player): void {
		room.writeArrayExcept(player, "exitArea", String(player.networkid()), player.username());

		if (this.world.areas.get(room.getName().split("-")[0]) != null && this.world.areas.get(room.getName().split("-")[0]).isPvP()) {
			room.writeArrayExcept(player, "server", player.username() + " has left the match.");
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

		if (this.checkLimits(roomToJoin, player) == Rooms.ROOM_OK) {
			this.joinRoom(roomToJoin, player, roomFrame, roomPad);
		}
	}

	public joinRoom(room: Room, player: Player, frame: string = "Enter", pad: string = "Spawn"): void {
		if (room == null || player == null) {
			return;
		}

		player.properties.put(PlayerConst.FRAME, frame);
		player.properties.put(PlayerConst.PAD, pad);
		player.properties.put(PlayerConst.TX, 0);
		player.properties.put(PlayerConst.TY, 0);

		this.helper.joinRoom(player, player.getRoom(), room.getId(), true, "", false, true);
		this.moveToArea(room, player);

		player.network.writeArray("server", "You joined \"" + room.getName() + "\"!");
	}

	public lookForRoom(name: string): Room {
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

	public checkLimits(room: Room, player: Player): number {
		if (room == null) {
			throw new Error("room is null");
		}

		const areaName: string = room.getName().split("-")[0].equals("house") ? room.getName() : room.getName().split("-")[0];
		const area: IArea = this.world.areas.get(areaName);

		if (area.reqLevel > parseInt(player.properties.get(PlayerConst.LEVEL))) {
			player.network.writeArray("warning", "\"" + areaName + "\" requires level " + area.reqLevel + " and above to enter.");
			return Rooms.ROOM_LEVEL_LIMIT;
		} else if (area.pvp) {
			player.network.writeArray("warning", "\"" + areaName + "\" is locked zone.");
			return Rooms.ROOM_LOCKED;
		} else if (area.staff && !(player.isAdmin() || player.isModerator())) {
			player.network.writeArray("warning", "\"" + areaName + "\" is not a recognized map name.");
			return Rooms.ROOM_STAFF_ONLY;
		} else if (area.upgrade && parseInt(player.properties.get(PlayerConst.UPGRADE_DAYS)) <= 0) {
			player.network.writeArray("warning", "\"" + areaName + "\" is member only.");
			return Rooms.ROOM_REQUIRE_UPGRADE;
		} else if (room.contains(player.username())) {
			player.network.writeArray("warning", "Cannot join a room you are currently in!");
			return Rooms.ROOM_USER_INSIDE;
		} else if (area instanceof Hall && (area as Hall).getGuildId() != parseInt(player.properties.get(PlayerConst.GUILD_ID))) {
			player.network.writeArray("warning", "You cannot access other guild halls!");
			return Rooms.ROOM_LOCKED;
		} else if (room.howManyUsers() >= room.getMaxUsers()) {
			player.network.writeArray("warning", "Room join failed, destination room is full.");
			return Rooms.ROOM_FULL;
		}

		return Rooms.ROOM_OK;
	}

	public generateRoom(name: string): Room {
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

	public createRoom(name: string): Room {
		const map: Map<string, string> = new Map<string, string>();

		const mapName: string = name.split("-")[0].equals("house") ? name : name.split("-")[0];
		const area: IArea = this.world.areas.get(mapName);

		map.set("isGame", "false");
		map.set("maxU", String(area.maxPlayers));
		map.set("name", name);
		map.set("uCount", "false");

		const room: Room = this.helper.createRoom(this.zone, map, null, false, true);

		const monsters: Map<number, MonsterAI> = new Map<number, MonsterAI>();

		if (area.monsters.length != 0) {
			for (const mapMonster of area.monsters) {
				const monster: MonsterAI = new MonsterAI(mapMonster, room);
				monsters.set(mapMonster.monMapId, monster);
			}
		}

		if (area.pvp) {
			room.properties.set(Rooms.PVP_DONE, false);
			room.properties.set(Rooms.BLUE_TEAM_SCORE, 0);
			room.properties.set(Rooms.RED_TEAM_SCORE, 0);

			const b: JSONObject = new JSONObject();
			b.put("id", 8);
			b.put("sName", "Infinity");
			room.properties.set(Rooms.BLUE_TEAM_NAME, "Team Infinity");

			const r: JSONObject = new JSONObject();
			r.put("id", 7);
			r.put("sName", "Arts");
			room.properties.set(Rooms.RED_TEAM_NAME, "Team Arts");

			const PVPFactions: JSONArray = new JSONArray();
			PVPFactions.add(b);
			PVPFactions.add(r);

			room.properties.set(Rooms.PVP_FACTIONS, PVPFactions);
		}

		room.properties.set(Rooms.MONSTERS, monsters);

		return room;
	}

	public addPvPScore(room: Room, score: number, teamId: number): void {
		if (room.properties.get(Rooms.PVP_DONE) as boolean) {
			return;
		}

		const rScore: number = room.properties.get(Rooms.RED_TEAM_SCORE) as number;
		const bScore: number = room.properties.get(Rooms.BLUE_TEAM_SCORE) as number;
		switch (teamId) {
			case 0:
				room.properties.set(Rooms.BLUE_TEAM_SCORE, (score + bScore) >= 1000 ? 1000 : (score + bScore));
				break;
			case 1:
				room.properties.set(Rooms.RED_TEAM_SCORE, (score + rScore) >= 1000 ? 1000 : (score + rScore));
				break;
			default:
				break;
		}
	}

	public relayPvPEvent(ai: MonsterAI, teamId: number): void {
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
			this.world.send(pvpe, room.getChannellList());
		}
	}

	public getPvPResult(room: Room): JSONObject {
		const pvpcmd: JSONObject = new JSONObject()
			.element("cmd", "PVPS");

		const bs: JSONObject = new JSONObject();
		const rs: JSONObject = new JSONObject();

		const redScore: number = room.properties.get(Rooms.RED_TEAM_SCORE) as number;
		const blueScore: number = room.properties.get(Rooms.BLUE_TEAM_SCORE) as number;

		rs.put("v", redScore);
		bs.put("v", blueScore);

		if (!(room.properties.get(Rooms.PVP_DONE) as boolean) && (redScore >= 1000 || blueScore >= 1000)) {
			pvpcmd.put("cmd", "PVPC");

			const rName: string = room.properties.get(Rooms.RED_TEAM_NAME) as string;
			const bName: string = room.properties.get(Rooms.BLUE_TEAM_NAME) as string;

			if (redScore >= 1000) {
				GameController.instance().serverMessage(`<font color="#ffffff"><a href="http://augoeides.org/?profile=${rName}" target="_blank">${rName}</a></font> won the match against <font color="#ffffff"><a href="http://infinityarts.co/?profile=${bName}" target="_blank">${bName}</a></font>`);

				const users: Set<Player> = new Set<Player>();

				for (const user of room.getAllUsers()) {
					if (user.properties.get(PlayerConst.PVP_TEAM) === 1) {
						users.add(user);
					}
				}

				this.world.scheduleTask(new WarpUser(this.world, users), 5, TimeUnit.SECONDS);
			} else if (blueScore >= 1000) {
				GameController.instance().serverMessage(`<font color="#ffffff"><a href="http://augoeides.org/?profile=${bName}" target="_blank">${bName}</a></font> won the match against <font color="#ffffff"><a href="http://infinityarts.co/?profile=${rName}" target="_blank">${rName}</a></font>`);

				const users: Set<Player> = new Set<Player>();

				for (const user of room.getAllUsers()) {
					if (user.properties.get(PlayerConst.PVP_TEAM) === 0) {
						users.add(user);
					}
				}

				this.world.scheduleTask(new WarpUser(this.world, users), 9, TimeUnit.SECONDS);
			}

			room.properties.set(Rooms.PVP_DONE, true);
		}

		const pvpScore: JSONArray = new JSONArray();

		pvpScore.add(bs);
		pvpScore.add(rs);

		pvpcmd.put("pvpScore", pvpScore);

		return pvpcmd;
	}

	private moveToArea(room: Room, player: Player): void {
		const mta: JSONObject = new JSONObject();
		const mapName: string = room.getName().split("-")[0].equals("house") ? room.getName() : room.getName().split("-")[0];
		const area: IArea = this.world.areas.get(mapName);
		const uoBranch: JSONArray = new JSONArray();

		const users: Player[] = room.getAllUsers();

		for (const userInRoom of users) {
			const userObj: JSONObject = this.world.users.getProperties(userInRoom, room);
			uoBranch.add(userObj);
		}

		mta.element("cmd", "moveToArea");
		mta.element("areaId", room.getId());
		mta.element("areaName", room.getName());
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
				.element("PVPFactions", room.properties.get(Rooms.PVP_FACTIONS));

			const bs: JSONObject = new JSONObject();
			bs.put("v", room.properties.get(Rooms.BLUE_TEAM_SCORE));

			const rs: JSONObject = new JSONObject();
			rs.put("v", room.properties.get(Rooms.RED_TEAM_SCORE));

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

	private getMonBranch(room: Room, area: IArea): JSONArray {
		const monBranch: JSONArray = new JSONArray();
		const monsters: Map<number, MonsterAI> = room.properties.get(Rooms.MONSTERS) as Map<number, MonsterAI>;

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


}
