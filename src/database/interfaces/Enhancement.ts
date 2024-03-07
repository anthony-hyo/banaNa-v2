import type EnhancementPattern from "./EnhancementPattern.ts";

export default interface Enhancement {
    id: number;
    name: string;
    patternId: number;
    rarity: number;
    dps: number;
    level: number;

    pattern: EnhancementPattern;
}