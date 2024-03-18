import type ISkillAuraEffect from "./ISkillAuraEffect.ts";

export default interface ISkillAura {
    id: number;
    name: string;
    duration: number;
    category: string;
    damageIncrease: number;
    damageTakenDecrease: number;

    effects: Array<ISkillAuraEffect>;
}