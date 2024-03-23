import type IUserFaction from "./IUserFaction.ts";
import type IUserFriend from "./IUserFriend.ts";
import type IUserInventory from "./IUserInventory.ts";
import type IUserLog from "./IUserLog.ts";
import type IAccess from "./IAccess.ts";
import type ISettingLevel from "./ISettingLevel.ts";
import type IGuild from "./IGuild.ts";
import type IServer from "./IServer.ts";
import type IHair from "./IHair.ts";

export default interface IUser {
	id: number;

	username: string;
	password: string;

	token: string | null;

	email: string;

	accessId: number;

	countryCode: string;

	level: number;

	coins: number;
	gold: number;

	experience: number;

	guildId: number;
	guildRank: number;

	activationFlag: number;
	isPermanentMute: boolean;

	lastArea: string;
	currentArea: string;

	currentServerId: number | null;

	gender: unknown;
	hairId: number;

	colorSkin: string;
	colorEye: string;
	colorHair: string;
	colorBase: string;
	colorTrim: string;
	colorAccessory: string;

	slotsBag: number;
	slotsBank: number;
	slotsHouse: number;

	quests1: string;
	quests2: string;

	dailyQuests0: number;
	dailyQuests1: number;
	dailyQuests2: number;
	monthlyQuests0: number;

	achievement: number;
	settings: number;

	houseInfo: string;

	killCount: number;
	deathCount: number;

	dateClassPointBoostExpire: Date;
	dateReputationBoostExpire: Date;
	dateCoinsBoostExpire: Date;
	dateGoldBoostExpire: Date;
	dateExperienceBoostExpire: Date;
	dateUpgradeExpire: Date;
	dateLastLogin: Date;

	dateUpdated: Date;
	dateCreated: Date;

	user?: IUser;
	access?: IAccess;
	settingLevel?: ISettingLevel;
	guild?: IGuild;
	currentServer?: IServer | null;
	hair?: IHair;

	actions?: Array<IUserFaction>;
	friends?: Array<IUserFriend>;
	inventory?: Array<IUserInventory>;
	logs?: Array<IUserLog>;
}
