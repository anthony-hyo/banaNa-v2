import type CombatAura from "../combat/CombatAura.ts";
import type ISkillAura from "../../database/interfaces/ISkillAura.ts";

export default class AvatarAuras {

	private readonly _auras: Set<CombatAura> = new Set<CombatAura>();

	public get auras(): Set<CombatAura> {
		return this._auras;
	}

	public clear(): void {
		for (const combatAura of this._auras) {
			combatAura.remove();
		}

		this._auras.clear();
	}

	public findCombatAura(skillAura: ISkillAura): CombatAura | undefined {
		for (const combatAura of this._auras) {
			if (combatAura.aura.id === skillAura.id) {
				return combatAura;
			}
		}

		return undefined;
	}

}