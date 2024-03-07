import type ItemRequirement from "./ItemRequirement.ts";
import type Class from "./Classess.ts";

export default interface Item {
    id: number;
    name: string;
    description: string;
    type: string;
    element: string;
    file: string;
    link: string;
    icon: string;
    equipment: string;
    level: number;
    dps: number;
    range: number;
    rarity: number;
    cost: number;
    quantity: number;
    stack: number;
    coins: boolean;
    temporary: boolean;
    upgrade: boolean;
    staff: boolean;
    enhId: number;
    factionId: number;
    reqReputation: number;
    reqClassId: number;
    reqClassPoints: number;
    reqQuests: string;
    questStringIndex: number;
    questStringValue: number;
    meta: string | null;

    class: Class;

    requirements: ItemRequirement[];
}


