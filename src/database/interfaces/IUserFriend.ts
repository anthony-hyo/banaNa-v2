import type IUser from "./IUser.ts";

export default interface IUserFriend {
    id: number;

    userId: number;
    friendId: number;

    user?: IUser;
    friend?: IUser;
}