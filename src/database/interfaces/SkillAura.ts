import type SkillAuraEffect from "./SkillAuraEffect.ts";

export default interface SkillAura {
    id: number;
    name: string;
    duration: number;
    category: string;
    damageIncrease: number;
    damageTakenDecrease: number;

    effects: Array<SkillAuraEffect>
}