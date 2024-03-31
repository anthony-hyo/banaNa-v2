import {differenceInDays, differenceInSeconds, differenceInYears, isAfter} from "date-fns";
import {and, eq, sql} from "drizzle-orm";
import {format} from "mysql2";
import CoreValues from "../../aqw/CoreValues";
import {Quests} from "../../aqw/Quests";
import {Rank} from "../../aqw/Rank";
import GameController from "../../controller/GameController";
import PlayerController from "../../controller/PlayerController";
import RoomController from "../../controller/RoomController";
import database from "../../database/drizzle/database";
import {areas, users, usersFactions, usersFriends, usersInventory, usersLogs} from "../../database/drizzle/schema";
import type IArea from "../../database/interfaces/IArea";
import type IClass from "../../database/interfaces/IClass";
import type IEnhancement from "../../database/interfaces/IEnhancement";
import type ISkill from "../../database/interfaces/ISkill";
import type ISkillAura from "../../database/interfaces/ISkillAura";
import type ISkillAuraEffect from "../../database/interfaces/ISkillAuraEffect";
import type IUser from "../../database/interfaces/IUser";
import type IUserFriend from "../../database/interfaces/IUserFriend";
import UserNotFoundException from "../../exceptions/UserNotFoundException";
import Guild from "../../guild/Guild";
import type Party from "../../party/Party";
import type Room from "../../room/Room";
import Scheduler from "../../scheduler/Scheduler";
import RemoveAura from "../../scheduler/tasks/RemoveAura";
import {EQUIPMENT_CAPE, EQUIPMENT_CLASS, EQUIPMENT_HELM, EQUIPMENT_WEAPON} from "../../util/Const";
import JSONArray from "../../util/json/JSONArray";
import JSONObject from "../../util/json/JSONObject";
import Avatar from "../Avatar";
import {AvatarState} from "../AvatarState";
import type AvatarStats from "../AvatarStats";
import AvatarStatus from "../AvatarStatus";
import type PlayerNetwork from "./PlayerNetwork";
import PlayerData from "./data/PlayerData";
import PlayerInventory from "./data/PlayerInventory";
import PlayerPosition from "./data/PlayerPosition";
import PlayerPreference from "./data/PlayerPreference";

export default class Player extends Avatar {

	public properties: Map<string, any> = new Map<string, any>();
	public room: Room | undefined;
	public readonly position: PlayerPosition = new PlayerPosition();
	public readonly status: AvatarStatus = new AvatarStatus(2500, 1000, 100, AvatarState.NEUTRAL);
	public readonly inventory: PlayerInventory = new PlayerInventory(this);
	public readonly preference: PlayerPreference = new PlayerPreference(this);
	public readonly data: PlayerData = new PlayerData(this);
	public party: Party | undefined = undefined;
	private readonly _databaseId: number;
	private readonly _username: string;
	private readonly _network: PlayerNetwork;
	private readonly _preferences: PlayerPreference = new PlayerPreference(this);

	constructor(user: IUser, network: PlayerNetwork) {
		super();

		this._databaseId = user.id;
		this._username = user.username;
		this._network = network;

		this._network.player = this;
	}

	public get databaseId(): number {
		return this._databaseId;
	}

	public get username(): string {
		return this._username;
	}

	public get network(): PlayerNetwork {
		return this._network;
	}

	public get preferences(): PlayerPreference {
		return this._preferences;
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
		//TODO: Kick
	}

	public disconnect(): void {

	}

	public moveToCell(frame: string, pad: string, sendUpdate: boolean): void {
		this.position.frame = frame;
		this.position.pad = pad;

		this.position.xAxis = 0;
		this.position.yAxis = 0;

		if (sendUpdate) {
			this.room!.writeArrayExcept(this, "uotls", [this.network.name, `strPad:${pad},tx:0,strFrame:${frame},ty:0`]);
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

		this.room!.writeObject(
			new JSONObject()
				.element("cmd", "uotls")
				.element("unm", this.network.name)
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

	public async getBankCount(): Promise<number> {
		const usersItemBankCount: {
			count: number
		}[] = await database
			.select({
				count: sql`COUNT(*)`.mapWith(Number)
			})
			.from(usersInventory)
			.where(
				and(
					eq(usersInventory.userId, this.databaseId),
					eq(usersInventory.isOnBank, true)
				)
			);

		return usersItemBankCount[0].count;
	}

	public async levelUp(level: number): Promise<void> {
		const newLevel: number = level >= CoreValues.getValue("intLevelMax") ? CoreValues.getValue("intLevelMax") : level;

		this.properties.set(PlayerConst.LEVEL, newLevel);

		this.sendStats(true);

		this.network.writeObject(
			new JSONObject()
				.element("cmd", "levelUp")
				.element("intLevel", newLevel)
				.element("intExpToLevel", CoreValues.getExpToLevel(newLevel))
		);

		await database
			.update(users)
			.set({
				level: newLevel,
				experience: this.databaseId,
			})
			.where(eq(users.id, this.databaseId));
	}

	public async giveRewards(exp: number, gold: number, cp: number, rep: number, factionId: number, fromId: number, npcType: string): Promise<void> {
		const xpBoost: boolean = this.properties.get(PlayerConst.BOOST_XP);
		const goldBoost: boolean = this.properties.get(PlayerConst.BOOST_GOLD);
		const repBoost: boolean = this.properties.get(PlayerConst.BOOST_REP);
		const cpBoost: boolean = this.properties.get(PlayerConst.BOOST_CP);

		const calcExp: number = xpBoost ? exp * (1 + GameController.EXP_RATE) : exp * GameController.EXP_RATE;
		const calcGold: number = goldBoost ? gold * (1 + GameController.GOLD_RATE) : gold * GameController.GOLD_RATE;
		const calcRep: number = repBoost ? rep * (1 + GameController.REP_RATE) : rep * GameController.REP_RATE;
		const calcCp: number = cpBoost ? cp * (1 + GameController.CP_RATE) : cp * GameController.CP_RATE;

		const maxLevel: number = CoreValues.getValue("intLevelMax");
		const userLevel: number = this.properties.get(PlayerConst.LEVEL);
		const expReward: number = userLevel < maxLevel ? calcExp : 0;

		const classPoints: number = this.properties.get(PlayerConst.CLASS_POINTS);
		let userCp: number = Math.min(calcCp + classPoints, 302500);

		const curRank: number = Rank.getRankFromPoints(this.properties.get(PlayerConst.CLASS_POINTS));

		const addGoldExp: JSONObject = new JSONObject()
			.element("cmd", "addGoldExp")
			.element("id", fromId)
			.element("intGold", calcGold)
			.element("typ", npcType);

		if (userLevel < maxLevel) {
			addGoldExp.element("intExp", expReward);

			if (xpBoost) {
				addGoldExp.element("bonusExp", expReward >> 1);
			}
		}

		if (curRank !== 10 && calcCp > 0) {
			addGoldExp.element("iCP", calcCp);

			if (cpBoost) {
				addGoldExp.element("bonusCP", calcCp >> 1);
			}

			this.properties.set(PlayerConst.CLASS_POINTS, userCp);
		}

		if (factionId > 1) {
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

			this.network.writeObject(
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

		this.network.writeObject(addGoldExp);

		/*const userResult: QueryResult = this.world.db.jdbc.query("SELECT Gold, Exp FROM users WHERE id = ? FOR UPDATE", this.properties.get(PlayerConst.DATABASE_ID));
		if (userResult.next()) {
			let userXp: number = userResult.getInt("Exp") + expReward;
			let userGold: number = userResult.getInt("Gold") + calcGold;
			userResult.close();
			while (userXp >= CoreValues.getExpToLevel(userLevel)) {
				userXp -= CoreValues.getExpToLevel(userLevel);
				userLevel++;
			}

			// Update Level
			if (userLevel !== this.properties.get(PlayerConst.LEVEL)) {
				this.levelUp(user, userLevel);
				userXp = 0;
			}

			if (calcGold > 0 || (expReward > 0 && userLevel !== maxLevel)) {
				this.world.db.jdbc.run("UPDATE users SET Gold = ?, Exp = ? WHERE id = ?", userGold, userXp, this.properties.get(PlayerConst.DATABASE_ID));
			}
			if (curRank !== 10 && calcCp > 0) {
				const eqp: JSONObject = this.properties.get(PlayerConst.EQUIPMENT) as JSONObject;
				if (eqp.has(EQUIPMENT_CLASS)) {
					const oldItem: JSONObject = eqp.getJSONObject(EQUIPMENT_CLASS)!;
					const itemId: number = oldItem.getInt("ItemID")!;
					this.world.db.jdbc.run("UPDATE users_items SET Quantity = ? WHERE ItemID = ? AND UserID = ?", userCp, itemId, this.properties.get(PlayerConst.DATABASE_ID));

					if (Rank.getRankFromPoints(userCp) > curRank) {
						this.loadSkills(user, this.world.items.get(itemId), userCp);
					}
				}
			}
		}

		userResult.close();*/
	}

	public hasAura(auraId: number): boolean {
		const auras: Set<RemoveAura> = this.properties.get(PlayerConst.AURAS);

		for (const ra of auras) {
			const aura: ISkillAura = ra.getAura();

			if (aura.id === auraId) {
				return true;
			}
		}

		return false;
	}

	public removeAura(ra: RemoveAura): void {
		const removeAuras: Set<RemoveAura> = this.properties.get(PlayerConst.AURAS);
		removeAuras.delete(ra);
	}

	public applyAura(aura: ISkillAura): RemoveAura {
		const ra: RemoveAura = new RemoveAura(aura, this, undefined);

		ra.setRunning(Scheduler.oneTime(ra, aura.duration));

		// noinspection JSMismatchedCollectionQueryUpdate
		const removeAuras: Set<RemoveAura> = this.properties.get(PlayerConst.AURAS);
		removeAuras.add(ra);

		return ra;
	}

	public updateStats(enhancement: IEnhancement, equipment: string): void {
		const itemStats: Map<string, number> = CoreValues.getItemStats(enhancement, equipment);

		const stats: AvatarStats = this.properties.get(PlayerConst.STATS);

		switch (equipment) {
			case EQUIPMENT_CLASS:
				for (const [key, value] of itemStats) {
					stats.armor.set(key, value);
				}
				break;
			case EQUIPMENT_WEAPON:
				for (const [key, value] of itemStats) {
					stats.weapon.set(key, value);
				}
				break;
			case EQUIPMENT_CAPE:
				for (const [key, value] of itemStats) {
					stats.cape.set(key, value);
				}
				break;
			case EQUIPMENT_HELM:
				for (const [key, value] of itemStats) {
					stats.helm.set(key, value);
				}
				break;
			default:
				throw new Error("equipment " + equipment + " cannot have stat values!");
		}
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
				ar.put(key, Math.floor(value));
			}
		}

		for (const [key, value] of stats.helm.entries()) {
			if (value > 0) {
				he.put(key, Math.floor(value));
			}
		}

		for (const [key, value] of stats.weapon.entries()) {
			if (value > 0) {
				Weapon.put(key, Math.floor(value));
			}
		}

		for (const [key, value] of stats.cape.entries()) {
			if (value > 0) {
				ba.put(key, Math.floor(value));
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

		this.network.writeObject(
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

	public dropItem(itemId: number): void;

	public dropItem(itemId: number, quantity: number): void;

	public dropItem(itemId: number, quantity?: number): void {
		//TODO: ..
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

		this.network.writeObject(
			new JSONObject()
				.element("cmd", "updateQuest")
				.element("iIndex", index)
				.element("iValue", value)
		);
	}

	public getQuestValue(index: number): number {
		return index > 99 ? Quests.lookAtValue(this.properties.get(PlayerConst.QUESTS_2) as string, index - 100) : Quests.lookAtValue(this.properties.get(PlayerConst.QUESTS_1) as string, index);
	}

	public turnInItem(itemId: number, quantity: number): boolean {
		const items: Map<number, number> = new Map<number, number>();
		//TODO: ..
		return this.turnInItems(items);
	}

	public turnInItems(items: Map<number, number>): boolean {
		//TODO: ..
		return false;
	}

	public addTemporaryItem(itemId: number, quantity: number): void {
		const inventoryTemporary: Map<number, number> = this.properties.get(PlayerConst.TEMPORARY_INVENTORY);

		const item: number | undefined = inventoryTemporary.get(itemId);

		if (item) {
			inventoryTemporary.set(itemId, item! + quantity);
			return;
		}

		inventoryTemporary.set(itemId, quantity);
	}

	public async lost(): Promise<void> {
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
		if (this.party) {
			this.party.onMemberLeave(this);
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
				client.network.writeObject(friendJSONObject);
				client.network.writeArray(friendMessage[0], [friendMessage[1]]);
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
				.element("CharID", this.network.id);
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
			.element("entID", this.network.id)
			.element("entType", "p")
			.element("intHP", this.status.health.value)
			.element("intHPMax", this.status.health.max)
			.element("intLevel", level)
			.element("intMP", this.status.mana.value)
			.element("intMPMax", this.status.mana.max)
			.element("intState", this.status.state)
			.element("showCloak", this.preference.isShowingCloak(settings))
			.element("showHelm", this.preference.isShowingHelm(settings))
			.element("strFrame", this.position.frame)
			.element("strPad", this.position.pad)
			.element("strUsername", this.username)
			.element("tx", this.position.xAxis)
			.element("ty", this.position.yAxis)
			.element("uoName", this.network.name);

		if (withNetworkId) {
			data
				.element("ID", this.properties.get(PlayerConst.PVP_TEAM));
		}

		if (withStamina) {
			data
				.element("intSP", this.status.stamina.value)
				.element("intSPMax", this.status.stamina.max);
		}

		if (this.room && this.room.data.isPvP) {
			data.element("pvpTeam", this.properties.get(PlayerConst.PVP_TEAM));
		}

		return data;
	}

	public async respawn(): Promise<void> {
		this.status.health.update = this.status.health.max;
		this.status.mana.update = this.status.mana.max;

		this.status.state = AvatarState.NEUTRAL;

		this.clearAuras();
		await this.sendUotls(true, false, true, false, false, true);
	}

	public die(): void {
		this.status.health.update = 0;
		this.status.mana.update = 0;

		this.status.state = AvatarState.DEAD;

		this.properties.set(PlayerConst.RESPAWN_TIME, Date.now());
	}

	public async join(newRoom: Room, frame: string = 'Enter', pad: string = 'Spawn'): Promise<boolean> {
		const user: IUser | undefined = await database.query.users.findFirst({
			where: eq(users.id, this.databaseId)
		});

		if (!user) {
			return false;
		}

		if (newRoom.isFull) {
			this.network.writeArray("warning", ["The destination room is currently full."]);
			return false;
		}

		const area: IArea | undefined = await database.query.areas.findFirst({
			where: eq(areas.id, newRoom.databaseId)
		});

		if (!area) {
			return false;
		}

		if (newRoom.id == this.room?.id) {
			this.network.writeArray("warning", ["You are already in this room!"]);
			return false;
		}

		if (area.requiredLevel > user.level) {
			this.network.writeArray("warning", [`You need to be at least level ${area.requiredLevel} to access this destination.`]);
			return false;
		}

		const isUpgradeOnly: boolean = isAfter(new Date(), user.dateUpgradeExpire);

		if (area.isUpgradeOnly && isUpgradeOnly) {
			this.network.writeArray("warning", ["This destination is exclusive to VIP."]);
			return false;
		}

		if (area.requiredAccessId > user.accessId) {
			this.network.writeArray("warning", ["Access denied. Destination is inaccessible."]);
			return false;
		}

		this.moveToCell(frame, pad, false);

		await RoomController.join(this, newRoom);

		await newRoom.moveToArea(this);

		return true;
	}

	private clearAuras(): void {
		const removeAuras: Set<RemoveAura> = this.properties.get(PlayerConst.AURAS) as Set<RemoveAura>;

		for (const removeAura of removeAuras) {
			removeAura.cancel();
		}

		removeAuras.clear();

		const stats: AvatarStats = this.properties.get(PlayerConst.STATS);
		stats.effects.clear();

		this.network.writeObject(new JSONObject()
			.element("cmd", "clearAuras")
		);
	}

	private applyPassiveAuras(rank: number, classObj: IClass): void {
		if (rank < 4) {
			return;
		}

		const aurap: JSONObject = new JSONObject();
		const auras: JSONArray = new JSONArray();

		const stats: AvatarStats = this.properties.get(PlayerConst.STATS);

		for (const skillId of classObj.skills) {
			const skill: ISkill = this.world.skills.get(skillId);

			if (skill.type === "passive" && skill.auraId) {
				const aura: ISkillAura = this.world.auras.get(skill.auraId);

				if (aura.effects.length != 0) {

					const auraObj: JSONObject = new JSONObject();
					const effects: JSONArray = new JSONArray();

					for (const effectId of aura.effects) {
						const ae: ISkillAuraEffect = this.world.effects.get(effectId);

						effects.add(
							new JSONObject()
								.element("typ", ae.type)
								.element("sta", ae.stat)
								.element("id", ae.id)
								.element("val", ae.value)
						);

						stats.effects.add(ae);
					}

					auraObj
						.element("nam", aura.name)
						.element("e", effects);

					auras.add(auraObj);
				}
			}
		}

		this.network.writeObject(
			aurap
				.element("auras", auras)
				.element("cmd", "aura+p")
				.element("tInf", "p:" + this.network.id),
		);
	}


}
