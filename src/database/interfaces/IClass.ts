import type ISkill from "./ISkill.ts";

export default interface IClass {
    id: number;
    itemId: number;
    category: unknown;
    description: string;
    manaRegenerationMethods: string;
    statsDescription: string;

    skills: Array<ISkill>;
}