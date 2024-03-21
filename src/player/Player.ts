import Room from "../room/Room";
import PlayerNetwork from "./PlayerNetwork";
import {guilds, users, usersFactions, usersFriends, usersInventory, usersLogs} from "../database/drizzle/schema";
import database from "../database/drizzle/database";
import {and, eq, sql} from "drizzle-orm";
import type IUser from "../database/interfaces/IUser.ts";
import PlayerPreference from "./PlayerPreference.ts";
import JSONObject from "../util/json/JSONObject.ts";
import {CoreValues} from "../aqw/CoreValues.ts";
import {Rank} from "../aqw/Rank.ts";
import {EQUIPMENT_CAPE, EQUIPMENT_CLASS, EQUIPMENT_HELM, EQUIPMENT_WEAPON} from "../util/Const.ts";
import type ISkillAura from "../database/interfaces/ISkillAura.ts";
import JSONArray from "../util/json/JSONArray.ts";
import type IEnhancement from "../database/interfaces/IEnhancement.ts";
import Stats from "../world/stats/Stats.ts";
import {Quests} from "../aqw/Quests.ts";
import {Achievement} from "../aqw/Achievement.ts";
import Party from "../party/Party.ts";
import type IHair from "../database/interfaces/IHair.ts";
import type IClass from "../database/interfaces/IClass.ts";
import type ISkill from "../database/interfaces/ISkill.ts";
import type ISkillAuraEffect from "../database/interfaces/ISkillAuraEffect.ts";
import PlayerConst from "./PlayerConst.ts";
import GameController from "../controller/GameController.ts";
import RemoveAura from "../scheduler/tasks/RemoveAura.ts";
import {format} from "date-fns";
import type IUserFriend from "../database/interfaces/IUserFriend.ts";
import PlayerController from "../controller/PlayerController.ts";
import PartyController from "../party/PartyController.ts";
import Scheduler from "../scheduler/Scheduler.ts";
import type IGuild from "../database/interfaces/IGuild.ts";

export default class Player {

	public properties: Map<string, any> = new Map<string, any>();
	public room: Room | undefined;

	private readonly _databaseId: number;
	private readonly _username: string;
	private readonly _network: PlayerNetwork;

	private readonly _preferences: PlayerPreference = new PlayerPreference(this);

	constructor(user: IUser, network: PlayerNetwork) {
		this._databaseId = user.id;
		this._username = user.username;
		this._network = network;
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

	public sendUotls(showHp: boolean, showHpMax: boolean, showMp: boolean, showMpMax: boolean, showLevel: boolean, showState: boolean): void {
		const uotls: JSONObject = new JSONObject().element("cmd", "uotls");

		const o: JSONObject = new JSONObject();

		if (showHp) {
			o.element("intHP", this.properties.get(PlayerConst.HP));
		}

		if (showHpMax) {
			o.element("intHPMax", this.properties.get(PlayerConst.HP_MAX));
		}

		if (showMp) {
			o.element("intMP", this.properties.get(PlayerConst.MP));
		}

		if (showMpMax) {
			o.element("intMPMax", this.properties.get(PlayerConst.MP_MAX));
		}

		if (showLevel) {
			o.element("intLevel", this.properties.get(PlayerConst.LEVEL));
		}

		if (showState) {
			o.element("intState", this.properties.get(PlayerConst.STATE));
		}

		this.room!.writeObject(
			uotls
				.element("o", o)
				.element("unm", this.username)
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
					eq(usersInventory.is_on_bank, true)
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

	public async getGuildObject(): Promise<JSONObject> {
		const guild: IGuild | undefined = await database.query.guilds.findFirst({
			where: eq(guilds.id, this.properties.get(PlayerConst.GUILD_ID)),
			with: {
				members: {
					with: {
						currentServer: true,
					}
				}
			}
		});

		const guildJSONObject: JSONObject = new JSONObject();

		if (!guild) {
			return guildJSONObject;
		}

		const members: JSONArray = new JSONArray();

		for (let member of guild.members) {
			members.add(
				new JSONObject()
					.element("ID", member.id)
					.element("userName", member.user?.username)
					.element("Level", member.level)
					.element("Rank", member.guildRank)//TODO
					.element("Server", member.currentServerId ? member.currentServer!.name : 'Offline')
			);
		}

		return guildJSONObject.element("Name", guild.name)
			.element("MOTD", guild.messageOfTheDay.length > 0 ? guild.messageOfTheDay : "undefined")
			.element("pending", new JSONObject())
			.element("MaxMembers", guild.maxMembers)
			.element("dateUpdated", format(guild.dateUpdated, "yyyy-MM-dd'T'HH:mm:ss"))
			.element("Level", 1)
			.element("HallSize", guild.hallSize)
			//.element("guildHall", getGuildHallData(guildId))
			.element("guildHall", new JSONArray())
			.element("ul", members);
	}

	public getProperties(): JSONObject {
		const userProperties: JSONObject = new JSONObject()
			.element("afk", this.properties.get(PlayerConst.AFK))
			.element("entID", this.network.id)
			.element("entType", "p")
			.element("intHP", this.properties.get(PlayerConst.HP))
			.element("intHPMax", this.properties.get(PlayerConst.HP_MAX))
			.element("intLevel", this.properties.get(PlayerConst.LEVEL))
			.element("intMP", this.properties.get(PlayerConst.MP))
			.element("intMPMax", this.properties.get(PlayerConst.MP_MAX))
			.element("intState", this.properties.get(PlayerConst.STATE))
			.element("showCloak", true)
			.element("showHelm", true)
			.element("strFrame", this.properties.get(PlayerConst.FRAME))
			.element("strPad", this.properties.get(PlayerConst.PAD))
			.element("strUsername", this.properties.get(PlayerConst.USERNAME))
			.element("tx", this.properties.get(PlayerConst.TX))
			.element("ty", this.properties.get(PlayerConst.TY))
			.element("uoName", this.username);

		if (this.room!.data.name.includes("house") && this.room!.data.is_pvp) {
			userProperties.element("pvpTeam", this.properties.get(PlayerConst.PVP_TEAM));
		}

		return userProperties;
	}

	public updateStats(enhancement: IEnhancement, equipment: string): void {
		const itemStats: Map<string, number> = CoreValues.getItemStats(enhancement, equipment);

		const stats: Stats = this.properties.get(PlayerConst.STATS);

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

		const stats: Stats = this.properties.get(PlayerConst.STATS);
		stats.update();

		const END: number = stats.get$END() + stats.get_END();
		const WIS: number = stats.get$WIS() + stats.get_WIS();

		const intHPperEND: number = CoreValues.getValue("intHPperEND");
		const intMPperWIS: number = CoreValues.getValue("intMPperWIS");

		const addedHP: number = END * intHPperEND;

		// Calculate new HP and MP
		let userHp: number = CoreValues.getHealthByLevel(userLevel);
		userHp += addedHP;

		let userMp: number = CoreValues.getManaByLevel(userLevel) + (WIS * intMPperWIS);

		// Max
		this.properties.set(PlayerConst.HP_MAX, userHp);
		this.properties.set(PlayerConst.MP_MAX, userMp);

		// Current
		if (this.properties.get(PlayerConst.STATE) === PlayerConst.STATE_NORMAL || levelUp) {
			this.properties.set(PlayerConst.HP, userHp);
		}

		if (this.properties.get(PlayerConst.STATE) === PlayerConst.STATE_NORMAL || levelUp) {
			this.properties.set(PlayerConst.MP, userMp);
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

		if (!ba.isEmpty()) {
			tempStat.element("ba", ba);
		}

		if (!ar.isEmpty()) {
			tempStat.element("ar", ar);
		}

		if (!Weapon.isEmpty()) {
			tempStat.element("Weapon", Weapon);
		}

		if (!he.isEmpty()) {
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
				.element("wDPS", stats.wDPS),
		);
	}

	public async getFriends(): Promise<JSONArray> {
		const friends: JSONArray = new JSONArray();

		const userFriends: IUserFriend[] = await database.query.usersFriends.findMany({
			where: eq(usersFriends.userId, this.databaseId),
			with: {
				friend: {
					with: {
						currentServer: true
					}
				}
			}
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
			this.properties.set(PlayerConst.QUESTS_2, Quests.updateValue(this.properties.get(PlayerConst.QUESTS_2), (index - 100), value));

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
		return index > 99 ? Quests.lookAtValue(this.properties.get(PlayerConst.QUESTS_2) as string, (index - 100)) : Quests.lookAtValue(this.properties.get(PlayerConst.QUESTS_1) as string, index);
	}

	public async setAchievement(field: string, index: number, value: number, user: Player): Promise<void> {
		let update: object | undefined = undefined;

		switch (field) {
			case "ia0":
				this.properties.set(PlayerConst.ACHIEVEMENT, Achievement.update(this.properties.get(PlayerConst.ACHIEVEMENT), index, value));

				update = {
					achievement: this.properties.get(PlayerConst.ACHIEVEMENT)
				};
				break;
			case "id0":
				this.properties.set(PlayerConst.QUEST_DAILY_0, Achievement.update(this.properties.get(PlayerConst.QUEST_DAILY_0), index, value));

				update = {
					dailyQuests0: this.properties.get(PlayerConst.QUEST_DAILY_0)
				};
				break;
			case "id1":
				this.properties.set(PlayerConst.QUEST_DAILY_1, Achievement.update(this.properties.get(PlayerConst.QUEST_DAILY_1), index, value));

				update = {
					dailyQuests1: this.properties.get(PlayerConst.QUEST_DAILY_1)
				};
				break;
			case "id2":
				this.properties.set(PlayerConst.QUEST_DAILY_2, Achievement.update(this.properties.get(PlayerConst.QUEST_DAILY_2), index, value));

				update = {
					dailyQuests2: this.properties.get(PlayerConst.QUEST_DAILY_2)
				};
				break;
			case "im0":
				this.properties.set(PlayerConst.QUEST_MONTHLY_0, Achievement.update(this.properties.get(PlayerConst.QUEST_MONTHLY_0), index, value));

				update = {
					monthlyQuests0: this.properties.get(PlayerConst.QUEST_MONTHLY_0)
				};
				break;
		}

		if (!update) {
			return;
		}

		await database
			.update(users)
			.set(update)
			.where(eq(users.id, this.databaseId));

		this.network.writeObject(
			new JSONObject()
				.element("cmd", "setAchievement")
				.element("field", field)
				.element("index", index)
				.element("value", value)
		);
	}

	public getAchievement(field: string, index: number, user: Player): number {
		switch (field) {
			case "ia0":
				return Achievement.get(this.properties.get(PlayerConst.ACHIEVEMENT), index);
			case "id0":
				return Achievement.get(this.properties.get(PlayerConst.QUEST_DAILY_0), index);
			case "id1":
				return Achievement.get(this.properties.get(PlayerConst.QUEST_DAILY_1), index);
			case "id2":
				return Achievement.get(this.properties.get(PlayerConst.QUEST_DAILY_2), index);
			case "im0":
				return Achievement.get(this.properties.get(PlayerConst.QUEST_MONTHLY_0), index);
			default:
				return -1;
		}
	}

	public getGuildRank(rank: number): string {
		switch (rank) {
			case 0:
				return "duffer";
			case 1:
				return "member";
			case 2:
				return "officer";
			case 3:
				return "leader";
			default:
				return "";
		}
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
			inventoryTemporary.set(itemId, (item! + quantity));
			return;
		}

		inventoryTemporary.set(itemId, quantity);
	}

	public async lost(): Promise<void> {
		if (this.properties.size == 0) {
			return;
		}

		const pi: Party | undefined = PartyController.instance().getPartyInfo(this.properties.get(PlayerConst.PARTY_ID));

		if (pi) {
			if (pi.getOwner() === this.properties.get(PlayerConst.USERNAME)) {
				pi.setOwner(pi.getNextOwner());
			}

			pi.removeMember(this);

			pi.writeObject(
				new JSONObject()
					.element("cmd", "pr")
					.element("owner", pi.getOwner())
					.element("typ", "l")
					.element("unm", this.properties.get(PlayerConst.USERNAME))
			);

			if (pi.getMemberCount() <= 0) {
				pi.getOwnerObject().network.writeObject(
					new JSONObject()
						.element("cmd", "pc")
				);

				PartyController.instance().removeParty(pi.id);

				pi.getOwnerObject().properties.set(PlayerConst.PARTY_ID, -1);
			}
		}

		await database
			.update(users)
			.set({
				lastArea: this.properties.get(PlayerConst.LAST_AREA),
				currentServerId: null
			})
			.where(eq(users.id, this.databaseId));

		// UPDATE GUILD
		const guildId: number = this.properties.get(PlayerConst.GUILD_ID);

		if (guildId > 0) {
			//this.sendGuildUpdate(this.getGuildObject(guildId)); //TODO
		}

		// UPDATE FRIEND
		const updateFriend: JSONObject = new JSONObject();
		const friendInfo: JSONObject = new JSONObject();

		updateFriend.put("cmd", "updateFriend");
		friendInfo.put("iLvl", this.properties.get(PlayerConst.LEVEL));
		friendInfo.put("ID", this.properties.get(PlayerConst.DATABASE_ID));
		friendInfo.put("sName", this.properties.get(PlayerConst.USERNAME));
		friendInfo.put("sServer", "Offline");
		updateFriend.put("friend", friendInfo);

		const userFriends: IUserFriend[] = await database.query.usersFriends.findMany({
			where: eq(usersFriends.userId, this.databaseId),
			with: {
				friend: {
					with: {
						currentServer: true
					}
				}
			}
		});

		for (let userFriend of userFriends) {
			const client: Player | undefined = PlayerController.findByUsername(userFriend.friend!.username.toLowerCase());

			if (client) {
				client.network.writeObject(updateFriend);
				client.network.writeArray("server", this.username + " has logged out.");
			}
		}
	}

	public getUserData(id: number, self: boolean): JSONObject {
		const userData: JSONObject = new JSONObject();

		const hairId: number = this.properties.get(PlayerConst.HAIR_ID) as number;
		const hair: IHair = this.world.hairs.get(hairId);

		const lastArea: string = this.properties.get(PlayerConst.LAST_AREA).split("\\|")[0];

		userData
			.element("eqp", this.properties.get(PlayerConst.EQUIPMENT))
			.element("iCP", this.properties.get(PlayerConst.CLASS_POINTS))
			.element("iUpgDays", this.properties.get(PlayerConst.UPGRADE_DAYS))
			.element("intAccessLevel", this.properties.get(PlayerConst.ACCESS))
			.element("intColorAccessory", this.properties.get(PlayerConst.COLOR_ACCESSORY))
			.element("intColorBase", this.properties.get(PlayerConst.COLOR_BASE))
			.element("intColorEye", this.properties.get(PlayerConst.COLOR_EYE))
			.element("intColorHair", this.properties.get(PlayerConst.COLOR_HAIR))
			.element("intColorSkin", this.properties.get(PlayerConst.COLOR_SKIN))
			.element("intColorTrim", this.properties.get(PlayerConst.COLOR_TRIM))
			.element("intLevel", this.properties.get(PlayerConst.LEVEL))
			.element("strClassName", this.properties.get(PlayerConst.CLASS_NAME))
			.element("strGender", this.properties.get(PlayerConst.GENDER))
			.element("strHairFilename", hair.file)
			.element("strHairName", hair.name)
			.element("strUsername", this.properties.get(PlayerConst.USERNAME));

		if (this.properties.get(PlayerConst.GUILD_ID) > 0) {
			const guildData: JSONObject = this.properties.get(PlayerConst.GUILD) as JSONObject;
			const guild: JSONObject = new JSONObject();

			guild
				.element("id", this.properties.get(PlayerConst.GUILD_ID))
				.element("Name", guildData.getString("Name"))
				.element("MOTD", guildData.getString("MOTD"));

			userData
				.element("guild", guild)
				.element("guildRank", this.properties.get(PlayerConst.GUILD_RANK));
		}

		if (self) {
			const result: QueryResult = this.world.db.jdbc.query("SELECT HouseInfo, ActivationFlag, Gold, Coins, Exp, Country, Email, DateCreated, UpgradeExpire, Age, Upgraded FROM users WHERE id = ?", this.properties.get(PlayerConst.DATABASE_ID));

			if (result.next()) {
				userData
					.element("CharID", this.properties.get(PlayerConst.DATABASE_ID))
					.element("HairID", hairId)
					.element("UserID", this.network.id)
					.element("bPermaMute", this.properties.get(PlayerConst.PERMAMUTE_FLAG))
					.element("bitSuccess", "1")
					.element("dCreated", format(result.getDate("DateCreated"), "yyyy-MM-dd'T'HH:mm:ss"))
					.element("dUpgExp", format(result.getDate("UpgradeExpire"), "yyyy-MM-dd'T'HH:mm:ss"))
					.element("iAge", result.getString("Age"))
					.element("iBagSlots", this.properties.get(PlayerConst.SLOTS_BAG))
					.element("iBankSlots", this.properties.get(PlayerConst.SLOTS_BANK))
					.element("iBoostCP", 0)
					.element("iBoostG", 0)
					.element("iBoostRep", 0)
					.element("iBoostXP", 0)
					.element("iDBCP", this.properties.get(PlayerConst.CLASS_POINTS))
					.element("iDEX", 0)
					.element("iDailyAdCap", 6)
					.element("iDailyAds", 0)
					.element("iEND", 0)
					.element("iFounder", 0)
					.element("iHouseSlots", this.properties.get(PlayerConst.SLOTS_HOUSE))
					.element("iINT", 0)
					.element("iLCK", 0)
					.element("iSTR", 0)
					.element("iUpg", result.getInt("Upgraded"))
					.element("iWIS", 0)
					.element("ia0", this.properties.get(PlayerConst.ACHIEVEMENT))
					.element("ia1", this.properties.get(PlayerConst.SETTINGS))
					.element("id0", this.properties.get(PlayerConst.QUEST_DAILY_0))
					.element("id1", this.properties.get(PlayerConst.QUEST_DAILY_1))
					.element("id2", this.properties.get(PlayerConst.QUEST_DAILY_2))
					.element("im0", this.properties.get(PlayerConst.QUEST_MONTHLY_0))
					.element("intActivationFlag", result.getInt("ActivationFlag"))
					.element("intCoins", result.getInt("Coins"))
					.element("intDBExp", result.getInt("Exp"))
					.element("intDBGold", result.getInt("Gold"))
					.element("intExp", result.getInt("Exp"))
					.element("intExpToLevel", CoreValues.getExpToLevel(this.properties.get(PlayerConst.LEVEL)))
					.element("intGold", result.getInt("Gold"))
					.element("intHP", this.properties.get(PlayerConst.HP))
					.element("intHPMax", this.properties.get(PlayerConst.HP_MAX))
					.element("intHits", 1267)
					.element("intMP", this.properties.get(PlayerConst.MP))
					.element("intMPMax", this.properties.get(PlayerConst.MP_MAX))
					.element("ip0", 0)
					.element("ip1", 0)
					.element("ip2", 0)
					.element("iq0", 0)
					.element("lastArea", lastArea)
					.element("sCountry", result.getString("Country"))
					.element("sHouseInfo", result.getString("HouseInfo"))
					.element("strEmail", result.getString("Email"))
					.element("strMapName", this.room!.data.name)
					.element("strQuests", this.properties.get(PlayerConst.QUESTS_1))
					.element("strQuests2", this.properties.get(PlayerConst.QUESTS_2));
			}

			result.close();
		}

		return userData;
	}

	public respawn(): void {
		this.properties.set(PlayerConst.HP, this.properties.get(PlayerConst.HP_MAX));
		this.properties.set(PlayerConst.MP, this.properties.get(PlayerConst.MP_MAX));
		this.properties.set(PlayerConst.STATE, PlayerConst.STATE_NORMAL);

		this.clearAuras();
		this.sendUotls(true, false, true, false, false, true);
	}

	public die(): void {
		this.properties.set(PlayerConst.HP, 0);
		this.properties.set(PlayerConst.MP, 0);
		this.properties.set(PlayerConst.STATE, PlayerConst.STATE_DEAD);

		this.properties.set(PlayerConst.RESPAWN_TIME, Date.now());
	}

	private clearAuras(): void {
		const removeAuras: Set<RemoveAura> = this.properties.get(PlayerConst.AURAS) as Set<RemoveAura>;

		for (const removeAura of removeAuras) {
			removeAura.cancel();
		}

		removeAuras.clear();

		const stats: Stats = this.properties.get(PlayerConst.STATS);
		stats.effects.clear();

		this.network.writeObject(
			new JSONObject()
				.element("cmd", "clearAuras")
		);
	}

	private applyPassiveAuras(rank: number, classObj: IClass): void {
		if (rank < 4) {
			return;
		}

		const aurap: JSONObject = new JSONObject();
		const auras: JSONArray = new JSONArray();

		const stats: Stats = this.properties.get(PlayerConst.STATS);

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
