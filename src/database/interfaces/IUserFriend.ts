import type User from "./User.ts";

export default interface IUserFriend {
    id: number;

    userId: number;
    friendId: number;

    user?: User;
    friend?: User;
}