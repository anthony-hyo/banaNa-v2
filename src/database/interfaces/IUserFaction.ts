import type IFaction from "./IFaction.ts";
import type IUser from "./IUser.ts";

export default interface IUserFaction {
	id: number;

	userId: number;
	factionId: number;

	reputation: number;

	dateUpdated: Date;
	dateCreated: Date;

	user?: IUser;
	faction?: IFaction;
}