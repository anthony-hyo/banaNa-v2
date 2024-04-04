import {differenceInDays, differenceInSeconds, differenceInYears, format, isAfter} from "date-fns";
import {eq, sql} from "drizzle-orm";
import CoreValues from "../../aqw/CoreValues.ts";
import {Quests} from "../../aqw/Quests.ts";
import {Rank} from "../../aqw/Rank.ts";
import GameController from "../../controller/GameController.ts";
import PlayerController from "../../controller/PlayerController.ts";
import RoomController from "../../controller/RoomController.ts";
import database from "../../database/drizzle/database.ts";
import {areas, users, usersFactions, usersFriends, usersInventory, usersLogs} from "../../database/drizzle/schema.ts";
import type IArea from "../../database/interfaces/IArea.ts";
import type IEnhancement from "../../database/interfaces/IEnhancement.ts";
import type IUser from "../../database/interfaces/IUser.ts";
import type IUserFriend from "../../database/interfaces/IUserFriend.ts";
import UserNotFoundException from "../../exceptions/UserNotFoundException.ts";
import Guild from "../../guild/Guild.ts";
import Party from "../../party/Party.ts";
import type Room from "../../room/Room.ts";
import {DELIMITER, EQUIPMENT_CAPE, EQUIPMENT_CLASS, EQUIPMENT_HELM, EQUIPMENT_WEAPON} from "../../util/Const.ts";
import JSONArray from "../../util/json/JSONArray.ts";
import JSONObject from "../../util/json/JSONObject.ts";
import Avatar from "../Avatar.ts";
import {AvatarState} from "../helper/AvatarState.ts";
import AvatarStats from "../data/AvatarStats.ts";
import PlayerData from "./data/PlayerData.ts";
import PlayerInventory from "./data/PlayerInventory.ts";
import PlayerPosition from "./data/PlayerPosition.ts";
import PlayerPreference from "./data/PlayerPreference.ts";
import type IUserInventory from "../../database/interfaces/IUserInventory.ts";
import logger from "../../util/Logger.ts";
import AvatarCombat from "../data/AvatarCombat.ts";
import AvatarType from "../helper/AvatarType.ts";
import AvatarAuras from "../data/AvatarAuras.ts";
import PlayerStatus from "./data/PlayerStatus.ts";
import type IDispatchable from "../../interfaces/entity/IDispatchable.ts";
import type {Socket} from "bun";
import type INetworkData from "../../interfaces/network/INetworkData.ts";
import Network from "../../network/Network.ts";

export default class Player extends Avatar implements IDispatchable {

	private readonly _id: number;
	private readonly _name: string;

	private readonly _databaseId: number;
	private readonly _username: string;

	private readonly _socket: Socket<INetworkData>;

	public _room: Room | undefined;

	private _frame: string = 'Enter';

	private _pad: string = 'Enter';

	public readonly _auras: AvatarAuras = new AvatarAuras(this);
	public readonly _combat: AvatarCombat = new AvatarCombat(this);
	public readonly _status: PlayerStatus = new PlayerStatus(this, 2500, 1000, 100);
	public readonly _stats: AvatarStats = new AvatarStats(this);

	public readonly _data: PlayerData = new PlayerData(this);
	public readonly _inventory: PlayerInventory = new PlayerInventory(this);
	public readonly _position: PlayerPosition = new PlayerPosition();
	public readonly _preferences: PlayerPreference = new PlayerPreference(this);

	public partyId: number | undefined = undefined;

	constructor(user: IUser, socket: Socket<INetworkData>) {
		super();

		this._id = Network.increaseAndGet;
		this._name = user.username.toLowerCase();

		this._databaseId = user.id;
		this._username = user.username;

		this._socket = socket;
	}

	public override get avatarId(): number {
		return this._id;
	}

	public override get avatarName(): string {
		return this._name;
	}

	public override get databaseId(): number {
		return this._databaseId;
	}

	public get username(): string {
		return this._username;
	}

	public override get type(): AvatarType {
		return AvatarType.PLAYER;
	}

	public override get room(): Room | undefined {
		return this._room;
	}

	public override set room(room: Room) {
		this._room = room;
	}

	public override get frame(): string {
		return this._frame;
	}

	public override set frame(frame: string) {
		this._frame = frame;
	}

	public get pad(): string {
		return this._pad;
	}

	public set pad(pad: string) {
		this._pad = pad;
	}

	public override get auras(): AvatarAuras {
		return this._auras;
	}

	public override get combat(): AvatarCombat {
		return this._combat;
	}

	public override get stats(): AvatarStats {
		return this._stats;
	}

	public override get status(): PlayerStatus {
		return this._status;
	}

	public get data(): PlayerData {
		return this._data;
	}

	public get inventory(): PlayerInventory {
		return this._inventory;
	}

	public get position(): PlayerPosition {
		return this._position;
	}

	public get preferences(): PlayerPreference {
		return this._preferences;
	}









	public write(data: string): void {
		logger.debug(`[Player] sending '${data}'`);
		this._socket.write(data + DELIMITER);
	}

	public writeObject(data: JSONObject): void {
		this.write(JSON.stringify({
			t: `xt`,
			b: {
				r: -1,
				o: data.toJSON()
			},
		}));
	}

	public writeArray(command: string, data: Array<string | number>): void {
		this.write(`%xt%${command}%-1%${data.join('%')}%`);
	}

	public writeExcept(ignored: Player, data: string): void {
		if (ignored.avatarId == this.avatarId) {
			return;
		}

		this.write(data);
	}

	public writeObjectExcept(ignored: Player, data: JSONObject): void {
		if (ignored.avatarId == this.avatarId) {
			return;
		}

		this.writeObject(data);
	}

	public writeArrayExcept(ignored: Player, command: string, data: Array<string | number>): void {
		if (ignored.avatarId == this.avatarId) {
			return;
		}

		this.writeArray(command, data);
	}







	public async join(newRoom: Room, frame: string = 'Enter', pad: string = 'Spawn'): Promise<boolean> {
		const user: IUser | undefined = await database.query.users.findFirst({
			where: eq(users.id, this.databaseId)
		});

		if (!user) {
			return false;
		}

		if (newRoom.isFull) {
			this.writeArray("warning", ["The destination room is currently full."]);
			return false;
		}

		const area: IArea | undefined = await database.query.areas.findFirst({
			where: eq(areas.id, newRoom.databaseId)
		});

		if (!area) {
			return false;
		}

		if (newRoom.id == this.room?.id) {
			this.writeArray("warning", ["You are already in this room!"]);
			return false;
		}

		if (area.requiredLevel > user.level) {
			this.writeArray("warning", [`You need to be at least level ${area.requiredLevel} to access this destination.`]);
			return false;
		}

		const isUpgradeOnly: boolean = isAfter(new Date(), user.dateUpgradeExpire);

		if (area.isUpgradeOnly && isUpgradeOnly) {
			this.writeArray("warning", ["This destination is exclusive to VIP."]);
			return false;
		}

		if (area.requiredAccessId > user.accessId) {
			this.writeArray("warning", ["Access denied. Destination is inaccessible."]);
			return false;
		}

		this.moveToCell(frame, pad, false);

		await RoomController.join(this, newRoom);

		await newRoom.moveToArea(this);

		return true;
	}

	public moveToCell(frame: string, pad: string, sendUpdate: boolean): void {
		this.frame = frame;
		this.pad = pad;

		this.position.move(0, 0);

		if (sendUpdate) {
			this.room?.writeArrayExcept(this, "uotls", [this.avatarName, `strPad:${pad},tx:0,strFrame:${frame},ty:0`]);
		}
	}


	public log(violation: string, details: string): void {
		database
			.insert(usersLogs)
			.values({
				userId: this.databaseId,
				details: details,
			});
	}


	public kick(): void {
		logger.silly('>>>>>>>>> kick');
		//TODO: kick
	}

	public async disconnect(): Promise<void> {
		logger.silly('>>>>>>>>> disconnect');

		const user: IUser | undefined = await database.query.users.findFirst({
			with: {
				guild: {
					with: {
						members: {
							with: {
								currentServer: true,
							}
						}
					}
				},
				hair: true,
				friends: true
			},
			where: eq(users.id, this.databaseId)
		});

		if (!user) {
			throw new UserNotFoundException("The user could not be found in the database.");
		}

		//Party
		if (this.partyId) {
			const party: Party = await Party.findOrCreate(this.partyId);

			party.onMemberLeave(this);
		}

		//Guild
		if (user.guildId) {
			const guild: Guild = await Guild.findOrCreate(user.guildId);

			await guild.update(user.guild);
		}

		//Friend
		const friendJSONObject: JSONObject = new JSONObject()
			.element("cmd", "updateFriend")
			.element("friend", new JSONObject()
				.element("iLvl", user.level)
				.element("ID", this.databaseId)
				.element("sName", this.username)
				.element("sServer", "Offline")
			);

		const friendMessage: [string, string] = [
			'server',
			`${this.username} has logged out.`
		];

		const userFriends: IUserFriend[] = await database.query.usersFriends.findMany({
			with: {
				friend: true
			},
			where: eq(usersFriends.userId, this.databaseId)
		});

		for (let userFriend of userFriends) {
			const client: Player | undefined = PlayerController.findByUsername(userFriend.friend!.username);

			if (client) {
				client.writeObject(friendJSONObject);
				client.writeArray(friendMessage[0], [friendMessage[1]]);
			}
		}
	}


	public async json(self: boolean, withNetworkId: boolean, withEquipment: boolean): Promise<JSONObject> {
		const user: IUser | undefined = await database.query.users.findFirst({
			with: {
				guild: {
					with: {
						members: {
							with: {
								currentServer: true,
							}
						}
					}
				},
				hair: true,
				...(withEquipment ? {
					inventory: {
						with: {
							item: {
								with: {
									typeItem: true,
									enhancement: true,
								}
							}
						}
					}
				} : {}),
			},
			where: eq(users.id, this.databaseId)
		});

		const data: JSONObject = new JSONObject();

		if (!user) {
			return data;
		}

		if (withNetworkId) {
			data
				.element("CharID", this.avatarId);
		}

		const dateNow: Date = new Date();

		data
			.element("guildRank", user.guildRank)
			.element("iUpgDays", differenceInDays(dateNow, user.dateUpgradeExpire))
			.element("intAccessLevel", user.accessId)
			.element("intColorAccessory", user.colorAccessory)
			.element("intColorBase", user.colorBase)
			.element("intColorEye", user.colorHair)
			.element("intColorHair", user.colorHair)
			.element("intColorSkin", user.colorSkin)
			.element("intColorTrim", user.colorTrim)
			.element("intLevel", user.level)
			.element("strGender", user.hair!.gender)
			.element("strHairFilename", user.hair!.file)
			.element("strHairName", user.hair!.name)
			.element("strUsername", user.username);

		if (self) {
			data
				.element("HairID", user.hairId)
				.element("UserID", user.id)
				//.element("bBuyer", 1)
				.element("bPermaMute", user.isPermanentMute)
				.element("bitSuccess", 1)
				//.element("bitWatched", 0)
				.element("dCreated", format(user.dateCreated, "yyyy-MM-dd'T'HH:mm:ss"))
				//.element("dRefReset", )
				.element("dUpgExp", format(user.dateUpgradeExpire, "yyyy-MM-dd'T'HH:mm:ss"))
				.element("iAge", differenceInYears(dateNow, user.dateBirth))
				.element("iBagSlots", user.slotsBag)
				.element("iBankSlots", user.slotsBank)
				.element("iBoostCP", differenceInSeconds(user.dateClassPointBoostExpire, dateNow))
				.element("iBoostG", differenceInSeconds(user.dateGoldBoostExpire, dateNow))
				.element("iBoostRep", differenceInSeconds(user.dateReputationBoostExpire, dateNow))
				.element("iBoostXP", differenceInSeconds(user.dateExperienceBoostExpire, dateNow))
				//.element("iDBCP", 0)
				.element("iDEX", 0)
				//.element("iDailyAdCap", 0)
				//.element("iDailyAds", 0)
				.element("iEND", 0)
				//.element("iFounder", 0)
				.element("iHouseSlots", user.slotsHouse)
				.element("iINT", 0)
				.element("iLCK", 0)
				//.element("iRefExp", 0)
				//.element("iRefGold", 0)
				.element("iSTR", 0)
				.element("iUpg", 2)
				.element("iWIS", 0)
				.element("ia0", 0)
				.element("ia1", 0)
				.element("id0", 0)
				.element("id1", 0)
				.element("id2", 0)
				.element("id3", 0)
				.element("id4", 0)
				.element("id5", 0)
				.element("im0", 0)
				.element("intActivationFlag", user.activationFlag)
				.element("intCoins", user.coins)
				//.element("intDBExp", 0)
				//.element("intDBGold", 0)
				//.element("intDays", 0)
				//.element("intDaysPlayed", 0)
				.element("intExp", user.experience)
				.element("intExpToLevel", CoreValues.getExpToLevel(user.level))
				.element("intGold", user.gold)
				.element("intHP", this.status.health.value)
				.element("intHits", user.level)
				.element("intMP", this.status.mana.value)
				.element("ip0", 0)
				.element("ip1", 0)
				.element("ip10", 0)
				.element("ip11", 0)
				.element("ip12", 0)
				.element("ip13", 0)
				.element("ip14", 0)
				.element("ip15", 0)
				.element("ip16", 0)
				.element("ip17", 0)
				.element("ip18", 0)
				.element("ip19", 0)
				.element("ip2", 0)
				.element("ip20", 0)
				.element("ip21", 0)
				.element("ip22", 0)
				.element("ip3", 0)
				.element("ip4", 0)
				.element("ip5", 0)
				.element("ip6", 0)
				.element("ip7", 0)
				.element("ip8", 0)
				.element("ip9", 0)
				.element("iq0", 0)
				.element("iw0", 0)
				.element("lastArea", user.lastArea)
				//.element("numHouses", 0)
				.element("sCountry", user.countryCode)
				.element("sHouseInfo", user.houseInfo)
				.element("strEmail", user.email)
				.element("strIP", "")
				.element("strMapName", this.room!.data.name)
				.element("strQuests", user.quests1)
				.element("strQuests2", user.quests2)
				.element("strQuests3", user.quests3)
				.element("strQuests4", user.quests4)
				.element("strQuests5", user.quests5)
				.element("strQuests6", user.quests6);
		}

		if (user.guildId) {
			if (self) {
				const guild: Guild = await Guild.findOrCreate(user.guildId);

				data
					.element("guild", await guild.json(user.guild));
			} else {
				data
					.element("guild", new JSONObject()
						.element("Name", user.guild!.name)
					);
			}
		}

		const equipment: JSONObject = new JSONObject();

		if (withEquipment) {
			for (const inventoryItem of user.inventory!) {
				const equipData: JSONObject = new JSONObject()
					.element("ItemID", inventoryItem.itemId)
					.element("sLink", inventoryItem.item!.linkage)
					.element("sFile", inventoryItem.item!.file);

				if (inventoryItem.item!.meta != null) {
					equipData
						.element("sMeta", inventoryItem.item!.meta);
				}

				switch (inventoryItem.item!.typeItem!.equipment) {
					case 'Weapon':
						equipData
							.element("sType", inventoryItem.item!.typeItem!.name);
						break;
					case 'ar':
						data
							.element("iCP", inventoryItem.quantity)
							.element("strClassName", inventoryItem.item!.name);
						break;
				}

				equipment
					.element(inventoryItem.item!.typeItem!.equipment, equipData);
			}
		}

		return data.element("eqp", equipment);
	}

	public async jsonPartial(withNetworkId: boolean, withStamina: boolean): Promise<JSONObject> {
		const { level, settings } = await database.query.users.findFirst({
			columns: {
				level: true,
				settings: true
			},
			where: eq(users.id, this.databaseId)
		}) || {};

		if (level == undefined || settings == undefined) {
			return new JSONObject();
		}

		const data: JSONObject = new JSONObject()
			.element("afk", this.data.isAway)
			.element("entID", this.avatarId)
			.element("entType", "p")
			.element("intHP", this.status.health.value)
			.element("intHPMax", this.status.health.max)
			.element("intLevel", level)
			.element("intMP", this.status.mana.value)
			.element("intMPMax", this.status.mana.max)
			.element("intState", this.status.state)
			.element("showCloak", this.preferences.isShowingCloak(settings))
			.element("showHelm", this.preferences.isShowingHelm(settings))
			.element("strFrame", this.frame)
			.element("strPad", this.pad)
			.element("strUsername", this.username)
			.element("tx", this.position.x)
			.element("ty", this.position.y)
			.element("uoName", this.avatarName);

		if (withNetworkId) {
			data
				.element("ID", this.avatarId);
		}

		if (withStamina) {
			data
				.element("intSP", this.status.stamina.value)
				.element("intSPMax", this.status.stamina.max);
		}

		if (this.room?.data.isPvP) {
			data.element("pvpTeam", this.data.pvpTeam);
		}

		return data;
	}


	public async levelUp(level: number): Promise<void> {
		const newLevel: number = level >= CoreValues.getValue("intLevelMax") ? CoreValues.getValue("intLevelMax") : level;

		this.sendStats(true);

		this.writeObject(
			new JSONObject()
				.element("cmd", "levelUp")
				.element("intLevel", newLevel)
				.element("intExpToLevel", CoreValues.getExpToLevel(newLevel))
		);

		await database
			.update(users)
			.set({
				level: newLevel,
				experience: 0,
			})
			.where(eq(users.id, this.databaseId));
	}

	public async giveRewards(exp: number, gold: number, cp: number, rep: number, factionId: number, fromId: number, npcType: string): Promise<void> {
		const user: {
			level: number,
			dateClassPointBoostExpire: Date,
			dateReputationBoostExpire: Date,
			dateGoldBoostExpire: Date,
			dateExperienceBoostExpire: Date
		} | undefined = await database.query.users.findFirst({
			columns: {
				level: true,
				dateClassPointBoostExpire: true,
				dateGoldBoostExpire: true,
				dateReputationBoostExpire: true,
				dateExperienceBoostExpire: true,
			},
			where: eq(users.id, this.databaseId)
		});

		if (!user) {
			throw new UserNotFoundException("The user could not be found in the database.");
		}

		const dateNow: Date = new Date();

		const cpBoost: boolean = user.dateClassPointBoostExpire >= dateNow;
		const goldBoost: boolean = user.dateGoldBoostExpire >= dateNow;
		const repBoost: boolean = user.dateReputationBoostExpire >= dateNow;
		const xpBoost: boolean = user.dateExperienceBoostExpire >= dateNow;

		const calcExp: number = xpBoost ? exp * (1 + GameController.EXP_RATE) : exp * GameController.EXP_RATE;
		const calcGold: number = goldBoost ? gold * (1 + GameController.GOLD_RATE) : gold * GameController.GOLD_RATE;
		const calcRep: number = repBoost ? rep * (1 + GameController.REP_RATE) : rep * GameController.REP_RATE;
		const calcCp: number = cpBoost ? cp * (1 + GameController.CP_RATE) : cp * GameController.CP_RATE;

		const maxLevel: number = CoreValues.getValue("intLevelMax");
		const expReward: number = user.level < maxLevel ? calcExp : 0;

		const addGoldExp: JSONObject = new JSONObject()
			.element("cmd", "addGoldExp")
			.element("id", fromId)
			.element("intGold", calcGold)
			.element("typ", npcType);

		if (user.level < maxLevel) {
			addGoldExp.element("intExp", expReward);

			if (xpBoost) {
				addGoldExp.element("bonusExp", expReward >> 1);
			}
		}

		const equippedClass: IUserInventory | undefined = this.inventory.equippedClass;

		if (!equippedClass) {
			this.kick();
			return;
		}

		let classPoints: number = equippedClass.quantity;

		let rank: number = Rank.getRankFromPoints(classPoints);

		if (rank < 10 && calcCp > 0) {
			addGoldExp.element("iCP", calcCp);

			if (cpBoost) {
				addGoldExp.element("bonusCP", calcCp >> 1);
			}

			//TODO: Max quantity 302500
			await database
				.update(usersInventory)
				.set({
					quantity: sql`${usersInventory.quantity} + ${calcCp}`,
				})
				.where(eq(usersInventory.id, equippedClass.id));

			if (Rank.getRankFromPoints(equippedClass.quantity + calcCp) > rank) {
				this.inventory.loadSkills();
			}
		}

		if (factionId > 0) {
			const rewardRep: number = Math.min(calcRep, 302500);

			addGoldExp
				.element("FactionID", factionId)
				.element("iRep", calcRep);

			if (repBoost) {
				addGoldExp.element("bonusRep", calcRep >> 1);
			}

			const factionResult = await database
				.insert(usersFactions)
				.values({
					userId: this.databaseId,
					factionId: factionId,
					reputation: rewardRep,
				})
				.onDuplicateKeyUpdate({
					set: {
						reputation: sql`${usersFactions.reputation}
                        + rewardRep`,
					}
				});

			this.writeObject(
				new JSONObject()
					.element("cmd", "addFaction")
					.element("faction", new JSONObject()
						.element("FactionID", factionId)
						.element("bitSuccess", 1)
						.element("CharFactionID", factionResult[0].insertId)
						.element("sName", "Nname") //TODO: Faction name
						.element("iRep", calcRep)
					)
			);
		}

		this.writeObject(addGoldExp);
	}

	public updateStats(enhancement: IEnhancement, equipment: string): void {
		const itemStats: Map<string, number> = CoreValues.getItemStats(enhancement, equipment);

		switch (equipment) {
			case EQUIPMENT_CLASS:
				for (const [key, value] of itemStats) {
					this.stats.armor.set(key, value);
				}
				break;
			case EQUIPMENT_WEAPON:
				for (const [key, value] of itemStats) {
					this.stats.weapon.set(key, value);
				}
				break;
			case EQUIPMENT_CAPE:
				for (const [key, value] of itemStats) {
					this.stats.cape.set(key, value);
				}
				break;
			case EQUIPMENT_HELM:
				for (const [key, value] of itemStats) {
					this.stats.helm.set(key, value);
				}
				break;
			default:
				throw new Error("equipment " + equipment + " cannot have stat values!");
		}
	}


	public async sendUotls(withHealth: boolean, withHealthMax: boolean, withMana: boolean, withManaMax: boolean, withLevel: boolean, withState: boolean): Promise<void> {
		const { level } = await database.query.users.findFirst({
			columns: {
				level: true,
				settings: true
			},
			where: eq(users.id, this.databaseId)
		}) || {};

		if (level == undefined) {
			throw new UserNotFoundException("The user could not be found in the database.");
		}

		this.room?.writeObject(
			new JSONObject()
				.element("cmd", "uotls")
				.element("unm", this.avatarName)
				.element("o", new JSONObject()
					.elementIf(withHealth, "intHP", this.status.health.value)
					.elementIf(withHealthMax, "intHPMax", this.status.health.max)
					.elementIf(withMana, "intMP", this.status.mana.value)
					.elementIf(withManaMax, "intMPMax", this.status.mana.max)
					.elementIf(withLevel, "intLevel", level)
					.elementIf(withState, "intState", this.status.state)
				)
		);
	}

	public sendStats(levelUp: boolean): void {
		const stu: JSONObject = new JSONObject();
		const tempStat: JSONObject = new JSONObject();

		const userLevel: number = this.properties.get(PlayerConst.LEVEL);

		const stats: AvatarStats = this.properties.get(PlayerConst.STATS);
		stats.update();

		const END: number = stats.get$END() + stats.get_END();
		const WIS: number = stats.get$WIS() + stats.get_WIS();

		const intHPperEND: number = CoreValues.getValue("intHPperEND");
		const intMPperWIS: number = CoreValues.getValue("intMPperWIS");

		const addedHP: number = END * intHPperEND;

		// Calculate new HP and MP
		let userHp: number = CoreValues.getHealthByLevel(userLevel);
		userHp += addedHP;

		let userMp: number = CoreValues.getManaByLevel(userLevel) + WIS * intMPperWIS;

		// Max
		this.status.health.max = userHp;
		this.status.mana.max = userMp;

		// Current
		if (this.status.state === AvatarState.NEUTRAL || levelUp) {
			this.status.health.update = userHp;
		}

		if (this.status.state === AvatarState.NEUTRAL || levelUp) {
			this.status.mana.update = userMp;
		}

		this.sendUotls(true, true, true, true, levelUp, false);

		const stat: JSONObject = new JSONObject(stats);

		const ba: JSONObject = new JSONObject();
		const he: JSONObject = new JSONObject();
		const Weapon: JSONObject = new JSONObject();

		const ar: JSONObject = new JSONObject();

		for (const [key, value] of stats.armor.entries()) {
			if (value > 0) {
				ar.element(key, Math.floor(value));
			}
		}

		for (const [key, value] of stats.helm.entries()) {
			if (value > 0) {
				he.element(key, Math.floor(value));
			}
		}

		for (const [key, value] of stats.weapon.entries()) {
			if (value > 0) {
				Weapon.element(key, Math.floor(value));
			}
		}

		for (const [key, value] of stats.cape.entries()) {
			if (value > 0) {
				ba.element(key, Math.floor(value));
			}
		}

		if (!ba.isEmpty) {
			tempStat.element("ba", ba);
		}

		if (!ar.isEmpty) {
			tempStat.element("ar", ar);
		}

		if (!Weapon.isEmpty) {
			tempStat.element("Weapon", Weapon);
		}

		if (!he.isEmpty) {
			tempStat.element("he", he);
		}

		tempStat.element(
			"innate",
			new JSONObject()
				.element("INT", stats.innate.get("INT"))
				.element("STR", stats.innate.get("STR"))
				.element("DEX", stats.innate.get("DEX"))
				.element("END", stats.innate.get("END"))
				.element("LCK", stats.innate.get("LCK"))
				.element("WIS", stats.innate.get("WIS"))
		);

		this.writeObject(
			stu
				.element("tempSta", tempStat)
				.element("cmd", "stu")
				.element("sta", stat)
				.element("wDPS", stats.physicalDamage),
		);
	}

	public async getFriends(): Promise<JSONArray> {
		const friends: JSONArray = new JSONArray();

		const userFriends: IUserFriend[] = await database.query.usersFriends.findMany({
			with: {
				friend: {
					with: {
						currentServer: true
					}
				}
			},
			where: eq(usersFriends.userId, this.databaseId)
		});

		for (let userFriend of userFriends) {
			friends.add(new JSONObject()
				.element("iLvl", userFriend.friend!.level)
				.element("ID", userFriend.friend!.id)
				.element("sName", userFriend.friend!.user!.username)
				.element("sServer", userFriend.friend!.currentServerId ? 'Offline' : userFriend.friend!.currentServer!.name)
			);
		}

		return friends;
	}

	public async setQuestValue(index: number, value: number): Promise<void> {
		let update: object;

		if (index > 99) {
			this.properties.set(PlayerConst.QUESTS_2, Quests.updateValue(this.properties.get(PlayerConst.QUESTS_2), index - 100, value));

			update = {
				quests2: this.properties.get(PlayerConst.QUESTS_2)
			};
		} else {
			this.properties.set(PlayerConst.QUESTS_1, Quests.updateValue(this.properties.get(PlayerConst.QUESTS_1), index, value));

			update = {
				quests1: this.properties.get(PlayerConst.QUESTS_1)
			};
		}

		await database
			.update(users)
			.set(update)
			.where(eq(users.id, this.databaseId));

		this.writeObject(
			new JSONObject()
				.element("cmd", "updateQuest")
				.element("iIndex", index)
				.element("iValue", value)
		);
	}

	public getQuestValue(index: number): number {
		return index > 99 ? Quests.lookAtValue(this.properties.get(PlayerConst.QUESTS_2) as string, index - 100) : Quests.lookAtValue(this.properties.get(PlayerConst.QUESTS_1) as string, index);
	}


}
