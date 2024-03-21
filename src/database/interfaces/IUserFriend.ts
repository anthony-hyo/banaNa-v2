import type IUser from "./IUser.ts";

export default interface IUserFriend {
	id: number;

	userId: number;
	friendId: number;

	dateUpdated: Date;
	dateCreated: Date;

	user?: IUser;
	friend?: IUser;
}