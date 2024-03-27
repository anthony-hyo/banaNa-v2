import type IUser from "./IUser.ts";

export default interface IGuild {
	id: number;

	name: string;

	messageOfTheDay: string;

	maxMembers: number;

	dateUpdated: Date;
	dateCreated: Date;

	members?: IUser[];
}