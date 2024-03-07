import type Skill from "./Skill.ts";

export default interface Class {
    id: number;
    itemId: number;
    category: unknown;
    description: string;
    manaRegenerationMethods: string;
    statsDescription: string;

    skills: Array<Skill>
}