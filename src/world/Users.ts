import Room from "../room/Room";
import {Rank} from "../aqw/Rank";
import {Quests} from "../aqw/Quests";
import {Achievement} from "../aqw/Achievement";
import Stats from "./stats/Stats";
import type Player from "../player/Player.ts";
import {CoreValues} from "../aqw/CoreValues.ts";
import type SkillAuraEffect from "../database/interfaces/SkillAuraEffect.ts";
import type SkillAura from "../database/interfaces/SkillAura.ts";
import type Skill from "../database/interfaces/Skill.ts";
import type Class from "../database/interfaces/Classess.ts";
import type Hair from "../database/interfaces/Hair.ts";
import type PartyInfo from "./PartyInfo.ts";
import type Enhancement from "../database/interfaces/Enhancement.ts";
import {EQUIPMENT_CAPE, EQUIPMENT_CLASS, EQUIPMENT_HELM, EQUIPMENT_WEAPON} from "../util/Const.ts";
import JSONObject from "../util/json/JSONObject.ts";
import JSONArray from "../util/json/JSONArray.ts";

export default class Users {

    public static readonly ACCESS: string = "access";
    public static readonly ACHIEVEMENT: string = "ia0";
    public static readonly PERMAMUTE_FLAG: string = "permamute";
    public static readonly AFK: string = "afk";
    public static readonly FRAME: string = "frame";
    public static readonly HP: string = "hp";
    public static readonly HP_MAX: string = "hpmax";
    public static readonly MP: string = "mp";
    public static readonly MP_MAX: string = "mpmax";
    public static readonly LEVEL: string = "level";
    public static readonly PAD: string = "pad";
    public static readonly STATE: string = "state";
    public static readonly TARGETS: string = "targets";
    public static readonly TX: string = "tx";
    public static readonly TY: string = "ty";
    public static readonly USERNAME: string = "username";
    public static readonly CLASS_NAME: string = "classname";
    public static readonly CLASS_POINTS: string = "cp";
    public static readonly CLASS_CATEGORY: string = "classcat";
    public static readonly COLOR_ACCESSORY: string = "coloraccessory";
    public static readonly COLOR_BASE: string = "colorbase";
    public static readonly COLOR_EYE: string = "coloreye";
    public static readonly COLOR_HAIR: string = "colorhair";
    public static readonly COLOR_SKIN: string = "colorskin";
    public static readonly COLOR_TRIM: string = "colortrim";
    public static readonly DATABASE_ID: string = "dbId";
    public static readonly GENDER: string = "gender";
    public static readonly UPGRADE_DAYS: string = "upgdays";
    public static readonly AURAS: string = "auras";
    public static readonly EQUIPMENT: string = "equipment";
    public static readonly GUILD_RANK: string = "guildrank";
    public static readonly GUILD: string = "guildobj";
    public static readonly GUILD_ID: string = "guildid";
    public static readonly PARTY_ID: string = "partyId";
    public static readonly PVP_TEAM: string = "pvpteam";
    public static readonly REQUESTED_FRIEND: string = "requestedfriend";
    public static readonly REQUESTED_PARTY: string = "requestedparty";
    public static readonly REQUESTED_DUEL: string = "requestedduel";
    public static readonly REQUESTED_GUILD: string = "requestedguild";
    public static readonly HAIR_ID: string = "hairId";
    public static readonly LAST_AREA: string = "lastarea";
    public static readonly SETTINGS: string = "settings";
    public static readonly BOOST_XP: string = "xpboost";
    public static readonly BOOST_GOLD: string = "goldboost";
    public static readonly BOOST_CP: string = "cpboost";
    public static readonly BOOST_REP: string = "repboost";
    public static readonly SLOTS_BAG: string = "bagslots";
    public static readonly SLOTS_BANK: string = "bankslots";
    public static readonly SLOTS_HOUSE: string = "houseslots";
    public static readonly ITEM_WEAPON: string = "weaponitem";
    public static readonly ITEM_WEAPON_ENHANCEMENT: string = "weaponitemenhancement";
    public static readonly ITEM_HOUSE_INVENTORY: string = "houseitems";
    public static readonly DROPS: string = "drops";
    public static readonly TEMPORARY_INVENTORY: string = "tempinventory";
    public static readonly STATS: string = "stats";
    public static readonly QUESTS: string = "quests";
    public static readonly QUESTS_1: string = "quests1";
    public static readonly QUESTS_2: string = "quests2";
    public static readonly QUEST_DAILY_0: string = "dailyquests0";
    public static readonly QUEST_DAILY_1: string = "dailyquests1";
    public static readonly QUEST_DAILY_2: string = "dailyquests2";
    public static readonly QUEST_MONTHLY_0: string = "monthlyquests0";
    public static readonly REGENERATION: string = "regenaration";
    public static readonly RESPAWN_TIME: string = "respawntime";
    public static readonly LAST_MESSAGE_TIME: string = "lastmessagetime";
    public static readonly REQUEST_COUNTER: string = "requestcounter";
    public static readonly REQUEST_WARNINGS_COUNTER: string = "requestwarncounter";
    public static readonly REQUEST_LAST: string = "requestlast";
    public static readonly REQUEST_REPEATED_COUNTER: string = "requestrepeatedcounter";
    public static readonly REQUEST_LAST_MILLISECONDS: string = "requestlastmili";
    public static readonly ROOM_QUEUED: string = "roomqueued";
    public static readonly SKILLS: string = "skills";
    public static readonly STATE_DEAD: number = 0;
    public static readonly STATE_NORMAL: number = 1;
    public static readonly STATE_COMBAT: number = 2;

    private readonly world!: World;

    public sendUotls(user: Player, showHp: boolean, showHpMax: boolean, showMp: boolean, showMpMax: boolean, showLevel: boolean, showState: boolean): void {
        const uotls: JSONObject = new JSONObject();
        const o: JSONObject = new JSONObject();

        uotls.put("cmd", "uotls");

        if (showHp) {
            o.put("intHP", user.properties.get(Users.HP));
        }

        if (showHpMax) {
            o.put("intHPMax", user.properties.get(Users.HP_MAX));
        }

        if (showMp) {
            o.put("intMP", user.properties.get(Users.MP));
        }

        if (showMpMax) {
            o.put("intMPMax", user.properties.get(Users.MP_MAX));
        }

        if (showLevel) {
            o.put("intLevel", user.properties.get(Users.LEVEL));
        }

        if (showState) {
            o.put("intState", user.properties.get(Users.STATE));
        }

        uotls.put("o", o);
        uotls.put("unm", user.getName());

        this.world.send(uotls, this.world.zone.getRoom(user.room.getId()).getChannellList());
    }

    public getBankCount(user: Player): number {
        let bankCount: number = 0;
        const bankResult: QueryResult = this.world.db.jdbc.query("SELECT ItemID FROM users_items WHERE Bank = 1 AND UserID = ?", user.properties.get(Users.DATABASE_ID));

        while (bankResult.next()) {
            const itemid: number = bankResult.getInt("ItemID");
            if (!this.world.items.get(itemid).isCoins()) {
                bankCount++;
            }
        }
        bankResult.close();

        return bankCount;
    }

    public levelUp(user: Player, level: number): void {
        const levelUp: JSONObject = new JSONObject();

        const newLevel: number = level >= CoreValues.getValue("intLevelMax") ? CoreValues.getValue("intLevelMax") : level;

        levelUp.put("cmd", "levelUp");
        levelUp.put("intLevel", newLevel);
        levelUp.put("intExpToLevel", this.world.getExpToLevel(newLevel));

        user.properties.set(Users.LEVEL, newLevel);

        this.sendStats(user, true);

        this.world.db.jdbc.run("UPDATE users SET Level = ?, Exp = 0 WHERE id = ?", newLevel, user.properties.get(Users.DATABASE_ID));

        user.network.writeObject(levelUp);
    }

    public giveRewards(user: Player, exp: number, gold: number, cp: number, rep: number, factionId: number, fromId: number, npcType: string): void {
        const xpBoost: boolean = user.properties.get(Users.BOOST_XP) as boolean;
        const goldBoost: boolean = user.properties.get(Users.BOOST_GOLD) as boolean;
        const repBoost: boolean = user.properties.get(Users.BOOST_REP) as boolean;
        const cpBoost: boolean = user.properties.get(Users.BOOST_CP) as boolean;

        const calcExp: number = xpBoost ? exp * (1 + this.world.EXP_RATE) : exp * this.world.EXP_RATE;
        const calcGold: number = goldBoost ? gold * (1 + this.world.GOLD_RATE) : gold * this.world.GOLD_RATE;
        const calcRep: number = repBoost ? rep * (1 + this.world.REP_RATE) : rep * this.world.REP_RATE;
        const calcCp: number = cpBoost ? cp * (1 + this.world.CP_RATE) : cp * this.world.CP_RATE;

        const maxLevel: number = CoreValues.getValue("intLevelMax");
        const userLevel: number = user.properties.get(Users.LEVEL) as number;
        const expReward: number = userLevel < maxLevel ? calcExp : 0;

        const classPoints: number = user.properties.get(Users.CLASS_POINTS) as number;
        let userCp: number = (calcCp + classPoints) >= 302500 ? 302500 : (calcCp + classPoints);

        const curRank: number = Rank.getRankFromPoints(user.properties.get(Users.CLASS_POINTS) as number);

        const addGoldExp: JSONObject = new JSONObject()
            .element("cmd", "addGoldExp")
            .element("id", fromId)
            .element("intGold", calcGold)
            .element("typ", npcType);

        if (userLevel < maxLevel) {
            addGoldExp.element("intExp", expReward);

            if (xpBoost) {
                addGoldExp.element("bonusExp", expReward / 2);
            }
        }

        if (curRank !== 10 && calcCp > 0) {
            addGoldExp.element("iCP", calcCp);

            if (cpBoost) {
                addGoldExp.element("bonusCP", calcCp / 2);
            }

            user.properties.set(Users.CLASS_POINTS, userCp);
        }

        if (factionId > 1) {
            const rewardRep: number = calcRep >= 302500 ? 302500 : calcRep;

            addGoldExp.element("FactionID", factionId)
                .element("iRep", calcRep);

            if (repBoost) {
                addGoldExp.element("bonusRep", calcRep / 2);
            }

            if (this.world.db.jdbc.queryForBoolean("SELECT COUNT(*) AS rowcount FROM users_factions WHERE UserID = ? AND FactionID = ?", user.properties.get(Users.DATABASE_ID), factionId)) {
                this.world.db.jdbc.run("UPDATE users_factions SET Reputation = (Reputation + ?) WHERE UserID = ? AND FactionID = ?", rewardRep, user.properties.get(Users.DATABASE_ID), factionId);
            } else {
                this.world.db.jdbc.holdConnection();
                this.world.db.jdbc.run("INSERT INTO users_factions (UserID, FactionID, Reputation) VALUES (?, ?, ?)", user.properties.get(Users.DATABASE_ID), factionId, rewardRep);
                const charFactionId: number = Long.valueOf(this.world.db.jdbc.getLastInsertId()).intValue();
                this.world.db.jdbc.releaseConnection();

                this.world.send(
                    new JSONObject()
                        .element("cmd", "addFaction")
                        .element("faction", new JSONObject()
                            .element("FactionID", factionId)
                            .element("bitSuccess", 1)
                            .element("CharFactionID", charFactionId)
                            .element("sName", this.world.factions.get(factionId))
                            .element("iRep", calcRep)
                        ),
                    user
                );
            }
        }

        user.network.writeObject(addGoldExp);


        const userResult: QueryResult = this.world.db.jdbc.query("SELECT Gold, Exp FROM users WHERE id = ? FOR UPDATE", user.properties.get(Users.DATABASE_ID));
        if (userResult.next()) {
            let userXp: number = userResult.getInt("Exp") + expReward;
            let userGold: number = userResult.getInt("Gold") + calcGold;
            userResult.close();
            while (userXp >= this.world.getExpToLevel(userLevel)) {
                userXp -= this.world.getExpToLevel(userLevel);
                userLevel++;
            }

            // Update Level
            if (userLevel !== user.properties.get(Users.LEVEL)) {
                this.levelUp(user, userLevel);
                userXp = 0;
            }

            if (calcGold > 0 || (expReward > 0 && userLevel !== maxLevel)) {
                this.world.db.jdbc.run("UPDATE users SET Gold = ?, Exp = ? WHERE id = ?", userGold, userXp, user.properties.get(Users.DATABASE_ID));
            }
            if (curRank !== 10 && calcCp > 0) {
                const eqp: JSONObject = user.properties.get(Users.EQUIPMENT) as JSONObject;
                if (eqp.has(EQUIPMENT_CLASS)) {
                    const oldItem: JSONObject = eqp.getJSONObject(EQUIPMENT_CLASS)!;
                    const itemId: number = oldItem.getInt("ItemID")!;
                    this.world.db.jdbc.run("UPDATE users_items SET Quantity = ? WHERE ItemID = ? AND UserID = ?", userCp, itemId, user.properties.get(Users.DATABASE_ID));

                    if (Rank.getRankFromPoints(userCp) > curRank) {
                        this.loadSkills(user, this.world.items.get(itemId), userCp);
                    }
                }
            }
        }

        userResult.close();
    }

    public hasAura(user: Player, auraId: number): boolean {
        const auras: Set<RemoveAura> = user.properties.get(Users.AURAS);
        for (const ra of auras) {
            const aura: SkillAura = ra.getAura();
            if (aura.getId() === auraId) {
                return true;
            }
        }
        return false;
    }

    public removeAura(user: Player, ra: RemoveAura): void {
        const auras: Set<RemoveAura> = user.properties.get(Users.AURAS);
        auras.delete(ra);
    }

    public applyAura(user: Player, aura: SkillAura): RemoveAura {
        const auras: Set<RemoveAura> = user.properties.get(Users.AURAS);

        const ra: RemoveAura = new RemoveAura(this.world, aura, user);
        ra.setRunning(this.world.scheduleTask(ra, aura.getDuration(), TimeUnit.SECONDS));

        auras.add(ra);

        return ra;
    }

    public getGuildObject(guildId: number): JSONObject {
        const guild: JSONObject = new JSONObject();

        const result: QueryResult = this.world.db.jdbc.query("SELECT * FROM guilds WHERE id = ?", guildId);
        if (result.next()) {
            const members: JSONArray = new JSONArray();

            guild.put("Name", result.getString("Name"));
            guild.put("MOTD", result.getString("MessageOfTheDay").length > 0 ? result.getString("MessageOfTheDay") : "undefined");
            guild.put("pending", new JSONObject());
            guild.put("MaxMembers", result.getInt("MaxMembers"));
            guild.put("dateUpdated", new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").format(result.getDate("LastUpdated")));
            guild.put("Level", 1);
            guild.put("HallSize", result.getInt("HallSize"));
            //guild.put("guildHall", getGuildHallData(guildId));
            guild.put("guildHall", new JSONArray());

            result.close();

            const memberResult: QueryResult = this.world.db.jdbc.query("SELECT id, Name, Level, CurrentServer, Rank FROM users_guilds JOIN users WHERE id = UserID AND users_guilds.GuildID = ?", guildId);
            while (memberResult.next()) {
                const member: JSONObject = new JSONObject();

                member.put("ID", memberResult.getInt("id"));
                member.put("userName", memberResult.getString("Name"));
                member.put("Level", memberResult.getString("Level"));
                member.put("Rank", memberResult.getInt("Rank"));
                member.put("Server", memberResult.getString("CurrentServer"));
                members.add(member);
            }
            memberResult.close();
            guild.put("ul", members);
        }
        result.close();

        return guild;
    }

    public getProperties(user: Player, room: Room): JSONObject {
        const userprop: JSONObject = new JSONObject();

        userprop.put("afk", user.properties.get(Users.AFK) as boolean);
        userprop.put("entID", user.getUserId());
        userprop.put("entType", "p");
        userprop.put("intHP", user.properties.get(Users.HP) as number);
        userprop.put("intHPMax", user.properties.get(Users.HP_MAX) as number);
        userprop.put("intLevel", user.properties.get(Users.LEVEL) as number);
        userprop.put("intMP", user.properties.get(Users.MP) as number);
        userprop.put("intMPMax", user.properties.get(Users.MP_MAX) as number);
        userprop.put("intState", user.properties.get(Users.STATE) as number);
        userprop.put("showCloak", true);
        userprop.put("showHelm", true);
        userprop.put("strFrame", user.properties.get(Users.FRAME) as string);
        userprop.put("strPad", user.properties.get(Users.PAD) as string);
        userprop.put("strUsername", user.properties.get(Users.USERNAME) as string);
        userprop.put("tx", user.properties.get(Users.TX) as number);
        userprop.put("ty", user.properties.get(Users.TY) as number);
        userprop.put("uoName", user.getName());

        if (!room.getName().includes("house") && this.world.areas.get(room.getName().split("-")[0]).isPvP()) {
            userprop.put("pvpTeam", user.properties.get(Users.PVP_TEAM) as number);
        }

        return userprop;
    }

    public updateStats(user: Player, enhancement: Enhancement, equipment: string): void {
        const itemStats: Map<string, number> = CoreValues.getItemStats(enhancement, equipment);
        const stats: Stats = user.properties.get(Users.STATS) as Stats;

        if (equipment === EQUIPMENT_CLASS) {
            for (const [key, value] of itemStats) {
                stats.armor.set(key, value);
            }
        } else if (equipment === EQUIPMENT_WEAPON) {
            for (const [key, value] of itemStats) {
                stats.weapon.set(key, value);
            }
        } else if (equipment === EQUIPMENT_CAPE) {
            for (const [key, value] of itemStats) {
                stats.cape.set(key, value);
            }
        } else if (equipment === EQUIPMENT_HELM) {
            for (const [key, value] of itemStats) {
                stats.helm.set(key, value);
            }
        } else {
            throw new Error("equipment " + equipment + " cannot have stat values!");
        }
    }

    public sendStats(user: Player, levelUp: boolean): void {
        const stu: JSONObject = new JSONObject();
        const tempStat: JSONObject = new JSONObject();

        const userLevel: number = user.properties.get(Users.LEVEL) as number;
        const stats: Stats = user.properties.get(Users.STATS) as Stats;
        stats.update();

        const END: number = stats.get$END() + stats.get_END();
        const WIS: number = stats.get$WIS() + stats.get_WIS();

        const intHPperEND: number = CoreValues.getValue("intHPperEND");
        const intMPperWIS: number = CoreValues.getValue("intMPperWIS");

        const addedHP: number = END * intHPperEND;

        // Calculate new HP and MP
        let userHp: number = this.world.getHealthByLevel(userLevel);
        userHp += addedHP;

        let userMp: number = this.world.getManaByLevel(userLevel) + (WIS * intMPperWIS);

        // Max
        user.properties.set(Users.HP_MAX, userHp);
        user.properties.set(Users.MP_MAX, userMp);

        // Current
        if (user.properties.get(Users.STATE) === Users.STATE_NORMAL || levelUp) {
            user.properties.set(Users.HP, userHp);
        }

        if (user.properties.get(Users.STATE) === Users.STATE_NORMAL || levelUp) {
            user.properties.set(Users.MP, userMp);
        }

        this.world.users.sendUotls(user, true, true, true, true, levelUp, false);

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

        this.world.send(
            stu.element("tempSta", tempStat)
                .element("cmd", "stu")
                .element("sta", stat)
                .element("wDPS", stats.wDPS),
            user
        );
    }

    public getFriends(user: Player): JSONArray {
        const friends: JSONArray = new JSONArray();
        const result: QueryResult = this.world.db.jdbc.query("SELECT id, Level, Name, CurrentServer FROM users LEFT JOIN users_friends ON FriendID = id WHERE UserID = ?", user.properties.get(Users.DATABASE_ID));

        while (result.next()) {
            friends.add(new JSONObject()
                .element("iLvl", result.getInt("Level"))
                .element("ID", result.getInt("id"))
                .element("sName", result.getString("Name"))
                .element("sServer", result.getString("CurrentServer"))
            );
        }

        result.close();
        return friends;
    }

    public dropItem(user: Player, itemId: number): void;

    public dropItem(user: Player, itemId: number, quantity: number): void;

    public dropItem(user: Player, itemId: number, quantity?: number): void {
        //TODO: ..
    }

    public setQuestValue(user: Player, index: number, value: number): void {
        if (index > 99) {
            user.properties.set(Users.QUESTS_2, Quests.updateValue(user.properties.get(Users.QUESTS_2) as string, (index - 100), value));
            this.world.db.jdbc.run("UPDATE users SET Quests2 = ? WHERE id =  ?", user.properties.get(Users.QUESTS_2), user.properties.get(Users.DATABASE_ID));
        } else {
            user.properties.set(Users.QUESTS_1, Quests.updateValue(user.properties.get(Users.QUESTS_1) as string, index, value));
            this.world.db.jdbc.run("UPDATE users SET Quests = ? WHERE id = ?", user.properties.get(Users.QUESTS_1), user.properties.get(Users.DATABASE_ID));
        }

        const updateQuest: JSONObject = new JSONObject();
        updateQuest.put("cmd", "updateQuest");
        updateQuest.put("iIndex", index);
        updateQuest.put("iValue", value);

        user.network.writeObject(updateQuest);
    }

    public getQuestValue(user: Player, index: number): number {
        if (index > 99) {
            return Quests.lookAtValue(user.properties.get(Users.QUESTS_2) as string, (index - 100));
        }
        return Quests.lookAtValue(user.properties.get(Users.QUESTS_1) as string, index);
    }

    public setAchievement(field: string, index: number, value: number, user: Player): void {
        if (field === "ia0") {
            user.properties.set(Users.ACHIEVEMENT, Achievement.update(user.properties.get(Users.ACHIEVEMENT), index, value));
            this.world.db.jdbc.run("UPDATE users SET Achievement = ? WHERE id = ?", user.properties.get(Users.ACHIEVEMENT), user.properties.get(Users.DATABASE_ID));
        } else if (field === "id0") {
            user.properties.set(Users.QUEST_DAILY_0, Achievement.update(user.properties.get(Users.QUEST_DAILY_0), index, value));
            this.world.db.jdbc.run("UPDATE users SET DailyQuests0 = ? WHERE id = ?", user.properties.get(Users.QUEST_DAILY_0), user.properties.get(Users.DATABASE_ID));
        } else if (field === "id1") {
            user.properties.set(Users.QUEST_DAILY_1, Achievement.update(user.properties.get(Users.QUEST_DAILY_1), index, value));
            this.world.db.jdbc.run("UPDATE users SET DailyQuests1 = ? WHERE id = ?", user.properties.get(Users.QUEST_DAILY_1), user.properties.get(Users.DATABASE_ID));
        } else if (field === "id2") {
            user.properties.set(Users.QUEST_DAILY_2, Achievement.update(user.properties.get(Users.QUEST_DAILY_2), index, value));
            this.world.db.jdbc.run("UPDATE users SET DailyQuests2 = ? WHERE id = ?", user.properties.get(Users.QUEST_DAILY_2), user.properties.get(Users.DATABASE_ID));
        } else if (field === "im0") {
            user.properties.set(Users.QUEST_MONTHLY_0, Achievement.update(user.properties.get(Users.QUEST_MONTHLY_0), index, value));
            this.world.db.jdbc.run("UPDATE users SET MonthlyQuests0 = ? WHERE id = ?", user.properties.get(Users.QUEST_MONTHLY_0), user.properties.get(Users.DATABASE_ID));
        }

        const sa: JSONObject = new JSONObject();
        sa.put("cmd", "setAchievement");
        sa.put("field", field);
        sa.put("index", index);
        sa.put("value", value);

        user.network.writeObject(sa);
    }

    public getAchievement(field: string, index: number, user: Player): number {
        if (field === "ia0") {
            return Achievement.get(user.properties.get(Users.ACHIEVEMENT) as number, index);
        } else if (field === "id0") {
            return Achievement.get(user.properties.get(Users.QUEST_DAILY_0) as number, index);
        } else if (field === "id1") {
            return Achievement.get(user.properties.get(Users.QUEST_DAILY_1) as number, index);
        } else if (field === "id2") {
            return Achievement.get(user.properties.get(Users.QUEST_DAILY_2) as number, index);
        } else if (field === "im0") {
            return Achievement.get(user.properties.get(Users.QUEST_MONTHLY_0) as number, index);
        } else {
            return -1;
        }
    }

    public getGuildRank(rank: number): string {
        let rankName: string = "";
        switch (rank) {
            case 0:
                rankName = "duffer";
                break;
            case 1:
                rankName = "member";
                break;
            case 2:
                rankName = "officer";
                break;
            case 3:
                rankName = "leader";
                break;
            default:
                break;
        }

        return rankName;
    }

    public turnInItem(user: Player, itemId: number, quantity: number): boolean {
        const items: Map<number, number> = new Map<number, number>();
        //TODO: ..
        return this.turnInItems(user, items);
    }

    public turnInItems(user: Player, items: Map<number, number>): boolean {
        //TODO: ..
        return false;
    }

    public addTemporaryItem(user: Player, itemId: number, quantity: number): void {
        const tempInventory: Map<number, number> = user.properties.get(Users.TEMPORARY_INVENTORY);
        if (tempInventory.has(itemId)) {
            const deltaQuantity: number = (tempInventory.get(itemId) + quantity);
            tempInventory.set(itemId, deltaQuantity);
        } else {
            tempInventory.set(itemId, quantity);
        }
    }

    public lost(user: Player): void {
        if (!user || user.properties.isEmpty()) {
            return;
        }

        // UPDATE PARTY
        const partyId: number = user.properties.get(Users.PARTY_ID);
        if (partyId > 0) {
            const pi: PartyInfo = this.world.parties.getPartyInfo(partyId);

            if (pi.getOwner() === user.properties.get(Users.USERNAME)) {
                pi.setOwner(pi.getNextOwner());
            }

            pi.removeMember(user);

            const pr: JSONObject = new JSONObject();
            pr.put("cmd", "pr");
            pr.put("owner", pi.getOwner());
            pr.put("typ", "l");
            pr.put("unm", user.properties.get(Users.USERNAME));

            this.world.send(pr, pi.getChannelListButOne(user));
            user.network.writeObject(pr);

            if (pi.getMemberCount() <= 0) {
                const pc: JSONObject = new JSONObject();
                pc.put("cmd", "pc");
                pi.getOwnerObject().network.writeObject(pc);
                this.world.parties.removeParty(partyId);
                pi.getOwnerObject().properties.put(Users.PARTY_ID, -1);
            }
        }

        this.world.db.jdbc.run("UPDATE users SET LastArea = ?, CurrentServer = 'Offline' WHERE id = ?", user.properties.get(Users.LAST_AREA), user.properties.get(Users.DATABASE_ID));

        // UPDATE GUILD
        const guildId: number = user.properties.get(Users.GUILD_ID);
        if (guildId > 0) {
            this.world.sendGuildUpdate(this.getGuildObject(guildId));
        }

        // UPDATE FRIEND
        const updateFriend: JSONObject = new JSONObject();
        const friendInfo: JSONObject = new JSONObject();

        updateFriend.put("cmd", "updateFriend");
        friendInfo.put("iLvl", user.properties.get(Users.LEVEL));
        friendInfo.put("ID", user.properties.get(Users.DATABASE_ID));
        friendInfo.put("sName", user.properties.get(Users.USERNAME));
        friendInfo.put("sServer", "Offline");
        updateFriend.put("friend", friendInfo);

        const result: QueryResult = this.world.db.jdbc.query("SELECT Name FROM users LEFT JOIN users_friends ON FriendID = id WHERE UserID = ?", user.properties.get(Users.DATABASE_ID));
        while (result.next()) {
            const client: Player = this.world.zone.getUserByName(result.getString("Name").toLowerCase());
            if (client) {
                client.network.writeObject(updateFriend);
                client.network.writeString("server", user.getName() + " has logged out.");
            }
        }
        result.close();
    }

    public getUserData(id: number, self: boolean): JSONObject {
        const userData: JSONObject = new JSONObject();

        const user: Player = this.helper.getUserById(id);

        if (user !== null) {
            const hairId: number = user.properties.get(Users.HAIR_ID) as number;
            const hair: Hair = this.world.hairs.get(hairId);

            let lastArea: string = user.properties.get(Users.LAST_AREA) as string;
            lastArea = lastArea.split("\\|")[0];

            userData.put("eqp", user.properties.get(Users.EQUIPMENT));
            userData.put("iCP", user.properties.get(Users.CLASS_POINTS));
            userData.put("iUpgDays", user.properties.get(Users.UPGRADE_DAYS));
            userData.put("intAccessLevel", user.properties.get(Users.ACCESS));
            userData.put("intColorAccessory", user.properties.get(Users.COLOR_ACCESSORY));
            userData.put("intColorBase", user.properties.get(Users.COLOR_BASE));
            userData.put("intColorEye", user.properties.get(Users.COLOR_EYE));
            userData.put("intColorHair", user.properties.get(Users.COLOR_HAIR));
            userData.put("intColorSkin", user.properties.get(Users.COLOR_SKIN));
            userData.put("intColorTrim", user.properties.get(Users.COLOR_TRIM));
            userData.put("intLevel", user.properties.get(Users.LEVEL));
            userData.put("strClassName", user.properties.get(Users.CLASS_NAME));
            userData.put("strGender", user.properties.get(Users.GENDER));
            userData.put("strHairFilename", hair.file);
            userData.put("strHairName", hair.name);
            userData.put("strUsername", user.properties.get(Users.USERNAME));

            if (user.properties.get(Users.GUILD_ID) > 0) {
                const guildData: JSONObject = user.properties.get(Users.GUILD) as JSONObject;
                const guild: JSONObject = new JSONObject();

                guild.put("id", user.properties.get(Users.GUILD_ID));
                guild.put("Name", guildData.getString("Name"));
                guild.put("MOTD", guildData.getString("MOTD"));

                userData.put("guild", guild);
                userData.put("guildRank", user.properties.get(Users.GUILD_RANK));
            }

            if (self) {
                const result: QueryResult = this.world.db.jdbc.query("SELECT HouseInfo, ActivationFlag, Gold, Coins, Exp, Country, Email, DateCreated, UpgradeExpire, Age, Upgraded FROM users WHERE id = ?", user.properties.get(Users.DATABASE_ID));

                if (result.next()) {
                    userData.put("CharID", user.properties.get(Users.DATABASE_ID));
                    userData.put("HairID", hairId);
                    userData.put("UserID", user.getUserId());
                    userData.put("bPermaMute", user.properties.get(Users.PERMAMUTE_FLAG));
                    userData.put("bitSuccess", "1");
                    userData.put("dCreated", new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").format(result.getDate("DateCreated")));
                    userData.put("dUpgExp", new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").format(result.getDate("UpgradeExpire")));
                    userData.put("iAge", result.getString("Age"));
                    userData.put("iBagSlots", user.properties.get(Users.SLOTS_BAG));
                    userData.put("iBankSlots", user.properties.get(Users.SLOTS_BANK));
                    userData.put("iBoostCP", 0);
                    userData.put("iBoostG", 0);
                    userData.put("iBoostRep", 0);
                    userData.put("iBoostXP", 0);
                    userData.put("iDBCP", user.properties.get(Users.CLASS_POINTS));
                    userData.put("iDEX", 0);
                    userData.put("iDailyAdCap", 6);
                    userData.put("iDailyAds", 0);
                    userData.put("iEND", 0);
                    userData.put("iFounder", 0);
                    userData.put("iHouseSlots", user.properties.get(Users.SLOTS_HOUSE));
                    userData.put("iINT", 0);
                    userData.put("iLCK", 0);
                    userData.put("iSTR", 0);
                    userData.put("iUpg", result.getInt("Upgraded"));
                    userData.put("iWIS", 0);
                    userData.put("ia0", user.properties.get(Users.ACHIEVEMENT));
                    userData.put("ia1", user.properties.get(Users.SETTINGS));
                    userData.put("id0", user.properties.get(Users.QUEST_DAILY_0));
                    userData.put("id1", user.properties.get(Users.QUEST_DAILY_1));
                    userData.put("id2", user.properties.get(Users.QUEST_DAILY_2));
                    userData.put("im0", user.properties.get(Users.QUEST_MONTHLY_0));
                    userData.put("intActivationFlag", result.getInt("ActivationFlag"));
                    userData.put("intCoins", result.getInt("Coins"));
                    userData.put("intDBExp", result.getInt("Exp"));
                    userData.put("intDBGold", result.getInt("Gold"));
                    userData.put("intExp", result.getInt("Exp"));
                    userData.put("intExpToLevel", this.world.getExpToLevel(user.properties.get(Users.LEVEL)));
                    userData.put("intGold", result.getInt("Gold"));
                    userData.put("intHP", user.properties.get(Users.HP));
                    userData.put("intHPMax", user.properties.get(Users.HP_MAX));
                    userData.put("intHits", 1267);
                    userData.put("intMP", user.properties.get(Users.MP));
                    userData.put("intMPMax", user.properties.get(Users.MP_MAX));
                    userData.put("ip0", 0);
                    userData.put("ip1", 0);
                    userData.put("ip2", 0);
                    userData.put("iq0", 0);
                    userData.put("lastArea", lastArea);
                    userData.put("sCountry", result.getString("Country"));
                    userData.put("sHouseInfo", result.getString("HouseInfo"));
                    userData.put("strEmail", result.getString("Email"));
                    userData.put("strMapName", zone.getRoom(user.room.getId()).getName().split("-")[0]);
                    userData.put("strQuests", user.properties.get(Users.QUESTS_1));
                    userData.put("strQuests2", user.properties.get(Users.QUESTS_2));
                }

                result.close();
            }
        }

        return userData;
    }

    public respawn(user: Player): void {
        user.properties.set(Users.HP, user.properties.get(Users.HP_MAX));
        user.properties.set(Users.MP, user.properties.get(Users.MP_MAX));
        user.properties.set(Users.STATE, Users.STATE_NORMAL);

        this.clearAuras(user);
        this.sendUotls(user, true, false, true, false, false, true);
    }

    public die(user: Player): void {
        user.properties.set(Users.HP, 0);
        user.properties.set(Users.MP, 0);
        user.properties.set(Users.STATE, Users.STATE_DEAD);

        user.properties.set(Users.RESPAWN_TIME, System.currentTimeMillis());
    }

    private clearAuras(user: Player): void {
        const auras: Set<RemoveAura> = user.properties.get(Users.AURAS) as Set<RemoveAura>;
        for (const ra of auras) {
            ra.cancel();
        }

        auras.clear();

        const stats: Stats = user.properties.get(Users.STATS) as Stats; // Get user stats
        stats.effects.clear();

        const ca: JSONObject = new JSONObject();
        ca.put("cmd", "clearAuras");

        user.network.writeObject(ca);
    }

    private applyPassiveAuras(user: Player, rank: number, classObj: Class): void {
        if (rank < 4) {
            return;
        }

        const aurap: JSONObject = new JSONObject();
        const auras: JSONArray = new JSONArray();

        const stats: Stats = user.properties.get(Users.STATS) as Stats; // Get user stats

        for (const skillId of classObj.skills) {
            const skill: Skill = this.world.skills.get(skillId);

            if (skill.type === "passive" && skill.auraId) {
                const aura: SkillAura = this.world.auras.get(skill.auraId);

                if (aura.effects.length != 0) {

                    const auraObj: JSONObject = new JSONObject();
                    const effects: JSONArray = new JSONArray();

                    for (const effectId of aura.effects) {
                        const ae: SkillAuraEffect = this.world.effects.get(effectId);

                        const effect: JSONObject = new JSONObject();

                        effect.put("typ", ae.type);
                        effect.put("sta", ae.stat);
                        effect.put("id", ae.id);
                        effect.put("val", ae.value);

                        effects.add(effect);

                        stats.effects.add(ae);
                    }

                    auraObj.put("nam", aura.name);
                    auraObj.put("e", effects);

                    auras.add(auraObj);
                }
            }
        }

        this.world.send(
            aurap.element("auras", auras)
                .element("cmd", "aura+p")
                .element("tInf", "p:" + user.getUserId()),
            user
        );
    }

}
