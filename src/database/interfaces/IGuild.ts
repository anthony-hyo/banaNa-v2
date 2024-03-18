import type User from "./User.ts";

export default interface IGuild {
    id: number;

    name: string;

    messageOfTheDay: string;

    maxMembers: number;
    hallSize: number;

    lastUpdated: string;

    members: User[];
}