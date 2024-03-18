import type IUser from "./IUser.ts";

export default interface IGuild {
    id: number;

    name: string;

    messageOfTheDay: string;

    maxMembers: number;
    hallSize: number;

    lastUpdated: string;

    members: IUser[];
}