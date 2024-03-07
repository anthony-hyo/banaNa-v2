import type Enhancement from "./Enhancement.ts";

export default interface EnhancementPattern {
    id: number;
    name: string;
    category: 'M1' | 'M2' | 'M3' | 'M4' | 'C1' | 'C2' | 'C3' | 'S1';
    wisdom: number;
    strength: number;
    luck: number;
    dexterity: number;
    endurance: number;
    intelligence: number;

    enhancement: Enhancement
}

export interface EnhancementPatternStat {
    WIS: number;
    STR: number;
    LCK: number;
    DEX: number;
    END: number;
    INT: number;
}