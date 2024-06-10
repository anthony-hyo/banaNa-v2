import Stats from "./Stats.ts";
import CombatCategory from "../helper/combat/CombatCategory.ts";
import TypeStat from "../helper/combat/skill/TypeStat.ts";
import type JSONObject from "../../util/json/JSONObject.ts";
import logger from "../../util/Logger.ts";
import TypeStatPrimary from "../helper/combat/skill/TypeStatPrimary.ts";

export default abstract class AvatarStats extends Stats {

	protected _weaponDps: number = 0;
	protected maxAttackDmg: number = 0;
	protected minAttackDmg: number = 0;

	protected _magicDps: number = 0;
	protected maxMagicDmg: number = 0;
	protected minMagicDmg: number = 0;

	public category: CombatCategory = CombatCategory.M1;

	private readonly effects: Map<number, number> = new Map();

	public haste(): number {
		return 1 - Math.min(Math.max(this.get$tha(), -1), 0.85);
	}

	public applyEffect(effectId: number): void {
		this.effects.set(effectId, (this.effects.get(effectId) ?? 0) + 1);
	}

	public removeEffect(effectId: number): void {
		const it = this.effects.entries();
		let entry;
		while (!(entry = it.next()).done) {
			const [key, value] = entry.value;
			if (key === effectId) {
				const quantityLeft = value - 1;
				if (quantityLeft < 1) {
					this.effects.delete(key);
				} else {
					this.effects.set(key, quantityLeft);
				}
				break;
			}
		}
	}

	public applyAuraEffects(): void {
		logger.error("TODO: applyAuraEffects"); //TODO: applyAuraEffects
		/*this.effects.forEach((quantity, auraID) => {
			const auraEffect = AuraEffect.findById(auraID);

			if (auraEffect === null) {
				throw new AuraNotFoundException(`Aura ${auraID} with quantity '${quantity}' not found when applying effects`);
			}

			this.applyStatByPercent(auraEffect.type(), auraEffect.stat(), auraEffect.value() * quantity);
		});*/
	}

	public applyStatByPercent(type: string, stat: TypeStat | TypeStatPrimary, value: number): void {
		switch (stat) {
			case TypeStat.CMO: // Magic Boost
				this.$cmo = this.calculate(type, this.$cmo, value, true);
				break;
			case TypeStat.CMI: // Magic Resistance
				this.$cmi = this.calculate(type, this.$cmi, value, true);
				break;
			case TypeStat.CPO: // Physical Boost
				this.$cpo = this.calculate(type, this.$cpo, value, true);
				break;
			case TypeStat.CPI: // Physical Resistance
				this.$cpi = this.calculate(type, this.$cpi, value, true);
				break;
			case TypeStat.CAO: // Damage Boost
				this.$cao = this.calculate(type, this.$cao, value, true);
				break;
			case TypeStat.CAI: // Damage Resistance
				this.$cai = this.calculate(type, this.$cai, value, true);
				break;
			case TypeStat.CMC: // Mana Consumption
				this.$cmc = this.calculate(type, this.$cmc, value, false);
				break;
			case TypeStat.CHO: // Heal Over Time Boost
				this.$cho = this.calculate(type, this.$cho, value, true);
				break;
			case TypeStat.CHI: // Heal Over Time Intake
				this.$chi = this.calculate(type, this.$chi, value, true);
				break;
			case TypeStat.CDO: // Damage Over Time Boost
				this.$cdo = this.calculate(type, this.$cdo, value, true);
				break;
			case TypeStat.CDI: // Damage Over Time Resistance
				this.$cdi = this.calculate(type, this.$cdi, value, true);
				break;
			case TypeStat.SCM: // Stat Critical Multiplier
				this.$scm = this.calculate(type, this.$scm, value, false);
				break;
			case TypeStat.SBM: // Stat Block Multiplier
				this.$sbm = this.calculate(type, this.$sbm, value, false);
				break;
			case TypeStat.SEM: // Stat Event Multiplier TODO
				this.$sem = this.calculate(type, this.$sem, value, false);
				break;
			case TypeStat.SRM: // Stat Resist Multiplier
				this.$srm = this.calculate(type, this.$srm, value, false);
				break;
			case TypeStat.SHB: // Stat Health Boost TODO
				this.$shb = this.calculate(type, this.$shb, value, false);
				break;
			case TypeStat.SMB: // Stat Mana Boost TODO
				this.$smb = this.calculate(type, this.$smb, value, false);
				break;
			case TypeStat.TCR: // Critical
				this.$tcr = this.calculate(type, this.$tcr, value, false);
				break;
			case TypeStat.THA: // Haste
				this.$tha = this.calculate(type, this.$tha, value, false);
				break;
			case TypeStat.TDO: // Evasion
				this.$tdo = this.calculate(type, this.$tdo, value, false);
				break;
			case TypeStat.THI: // Hit
				this.$thi = this.calculate(type, this.$thi, value, false);
				break;
			case TypeStat.AP: // Attack Power
				this.$ap = this.calculate(type, this.$ap, value, false);
				break;
			case TypeStat.MP: // Magic Power
				this.$sp = this.calculate(type, this.$sp, value, false);
				break;
			case TypeStatPrimary.WISDOM: // Wisdom
				this.$wis = this.calculate(type, this.$wis, value, false);
				break;
			case TypeStatPrimary.INTELLIGENCE: // Intelligence
				this.$int = this.calculate(type, this.$int, value, false);
				break;
			case TypeStatPrimary.ENDURANCE: // Endurance
				this.$end = this.calculate(type, this.$end, value, false);
				break;
			case TypeStatPrimary.DEXTERITY: // Dexterity
				this.$dex = this.calculate(type, this.$dex, value, false);
				break;
			case TypeStatPrimary.STRENGTH: // Strength
				this.$str = this.calculate(type, this.$str, value, false);
				break;
			case TypeStatPrimary.LUCK: // Luck
				this.$lck = this.calculate(type, this.$lck, value, false);
				break;
		}
	}

	protected addStat(stu: JSONObject, stat: TypeStat | TypeStatPrimary): void {
		switch (stat) {
			case TypeStat.CMO: // Magic Boost
				stu.element("$cmo", this.$cmo);
				break;
			case TypeStat.CMI: // Magic Resistance
				stu.element("$cmi", this.$cmi);
				break;
			case TypeStat.CPO: // Physical Boost
				stu.element("$cpo", this.$cpo);
				break;
			case TypeStat.CPI: // Physical Resistance
				stu.element("$cpi", this.$cpi);
				break;
			case TypeStat.CAO: // Damage Boost
				stu.element("$cao", this.$cao);
				break;
			case TypeStat.CAI: // Damage Resistance
				stu.element("$cai", this.$cai);
				break;
			case TypeStat.CMC: // Mana Consumption
				stu.element("$cmc", this.$cmc);
				break;
			case TypeStat.CHO: // Heal Over Time Boost
				stu.element("$cho", this.$cho);
				break;
			case TypeStat.CHI: // Heal Over Time Intake
				stu.element("$chi", this.$chi);
				break;
			case TypeStat.CDO: // Damage Over Time Boost
				stu.element("$cdo", this.$cdo);
				break;
			case TypeStat.CDI: // Damage Over Time Resistance
				stu.element("$cdi", this.$cdi);
				break;
			case TypeStat.SCM: // Stat Critical Multiplier
				stu.element("$scm", this.$scm);
				break;
			case TypeStat.SBM: // Stat Block Multiplier
				stu.element("$sbm", this.$sbm);
				break;
			case TypeStat.SEM: // Stat Event Multiplier TODO
				stu.element("$sem", this.$sem);
				break;
			case TypeStat.SRM: // Stat Resist Multiplier
				stu.element("$srm", this.$srm);
				break;
			case TypeStat.SHB: // Stat Health Boost TODO
				stu.element("$shb", this.$shb);
				break;
			case TypeStat.SMB: // Stat Mana Boost TODO
				stu.element("$smb", this.$smb);
				break;
			case TypeStat.TCR: // Critical
				stu.element("$tcr", this.$tcr);
				break;
			case TypeStat.THA: // Haste
				stu.element("$tha", this.$tha);
				break;
			case TypeStat.TDO: // Evasion
				stu.element("$tdo", this.$tdo);
				break;
			case TypeStat.THI: // Hit
				stu.element("$thi", this.$thi);
				break;
			case TypeStat.AP: // Attack Power
				stu.element("$ap", this.$ap);
				break;
			case TypeStat.MP: // Magic Power
				stu.element("$sp", this.$sp);
				break;
			case TypeStatPrimary.WISDOM: // Wisdom
				stu.element("$WIS", this.get$WIS());
				break;
			case TypeStatPrimary.INTELLIGENCE: // Intelligence
				stu.element("$INT", this.get$INT());
				break;
			case TypeStatPrimary.ENDURANCE: // Endurance
				stu.element("$END", this.get$END());
				break;
			case TypeStatPrimary.DEXTERITY: // Dexterity
				stu.element("$DEX", this.get$DEX());
				break;
			case TypeStatPrimary.STRENGTH: // Strength
				stu.element("$STR", this.get$STR());
				break;
			case TypeStatPrimary.LUCK: // Luck
				stu.element("$LCK", this.get$LCK());
				break;
		}
	}

	public weaponDps(): number {
		return this._weaponDps;
	}

	public maximumAttackDamage(): number {
		return this.maxAttackDmg;
	}

	public minimumAttackDamage(): number {
		return this.minAttackDmg;
	}

	public magicDps(): number {
		return this._magicDps;
	}

	public maximumMagicDamage(): number {
		return this.maxMagicDmg;
	}

	public minimumMagicDamage(): number {
		return this.minMagicDmg;
	}

	public abstract update(): Promise<void>;

	public abstract updateEffect(statsUpdated: TypeStat[] | TypeStatPrimary[] | null): Promise<void>;

	public abstract get_DEX(): number;

	public abstract get_END(): number;

	public abstract get_INT(): number;

	public abstract get_LCK(): number;

	public abstract get_STR(): number;

	public abstract get_WIS(): number;

	public abstract get$DEX(): number;

	public abstract get$END(): number;

	public abstract get$INT(): number;

	public abstract get$LCK(): number;

	public abstract get$STR(): number;

	public abstract get$WIS(): number;

	private calculate(type: string, val: number, val2: number, checkNegative: boolean): number {
		switch (type) {
			case TypeStat.INCREASE:
				val += val2;
				break;
			case TypeStat.DECREASE:
				if (checkNegative && val - val2 < 0) {
					return 0;
				}

				val -= val2;
				break;
			default:
				val *= val2;
				break;
		}

		return val;
	}

	protected damageMinMax(aaDamage: number, wepRng: number): void {
		//double wSPD = 2;
		const weaponDamage = this._weaponDps * 2; //wSPD
		const magicDamage = this._magicDps * 2; //wSPD

		const tADMG = weaponDamage * aaDamage;
		const tMDMG = magicDamage * aaDamage;

		const iRNG = wepRng / 100;

		this.minAttackDmg = Math.floor(tADMG - tADMG * iRNG);
		this.maxAttackDmg = Math.ceil(tADMG + tADMG * iRNG);

		this.minMagicDmg = Math.floor(tMDMG - tMDMG * iRNG);
		this.maxMagicDmg = Math.ceil(tMDMG + tMDMG * iRNG);
	}

	protected statsFinal(combatCategory: CombatCategory, sp1pc: number, stats: string, statsValue: number): void {
		const baseVal = statsValue / sp1pc / 100;

		switch (stats) {
			case TypeStatPrimary.STRENGTH:
				if (combatCategory === CombatCategory.M1) {
					this.$sbm -= baseVal * 0.3;
				}

				this.$ap += combatCategory === CombatCategory.S1 ? Math.round(statsValue * 1.4) : statsValue * 2;

				if (combatCategory === CombatCategory.M1 || combatCategory === CombatCategory.M2 || combatCategory === CombatCategory.M3 || combatCategory === CombatCategory.M4 || combatCategory === CombatCategory.S1) {
					this.$tcr += combatCategory === CombatCategory.M4 ? baseVal * 0.7 : baseVal * 0.4;
				}
				break;
			case TypeStatPrimary.INTELLIGENCE:
				this.$cmi -= baseVal;

				if (combatCategory.charAt(0) === 'C' || combatCategory === CombatCategory.M3) {
					this.$cmo += baseVal;
				}

				this.$sp += combatCategory === CombatCategory.S1 ? Math.round(statsValue * 1.4) : statsValue * 2;

				if (combatCategory === CombatCategory.C1 || combatCategory === CombatCategory.C2 || combatCategory === CombatCategory.C3 || combatCategory === CombatCategory.M3 || combatCategory === CombatCategory.S1) {
					this.$tha += combatCategory === CombatCategory.C2 ? baseVal * 0.5 : baseVal * 0.3;
				}
				break;
			case TypeStatPrimary.DEXTERITY:
				if (combatCategory === CombatCategory.M1 || combatCategory === CombatCategory.M2 || combatCategory === CombatCategory.M3 || combatCategory === CombatCategory.M4 || combatCategory === CombatCategory.S1) {
					this.$thi += baseVal * 0.2;
					this.$tha += combatCategory === CombatCategory.M2 || combatCategory === CombatCategory.M4 ? baseVal * 0.5 : baseVal * 0.3;
					if (combatCategory === CombatCategory.M1 && this._tbl > 0.01) {
						this.$tbl += baseVal * 0.5;
					}
				}

				this.$tdo += ![CombatCategory.M2, CombatCategory.M3].includes(combatCategory) ? baseVal * 0.3 : baseVal * 0.5;
				break;
			case TypeStatPrimary.WISDOM:
				if ([CombatCategory.C1, CombatCategory.C2, CombatCategory.C3, CombatCategory.S1].includes(combatCategory)) {
					this.$tcr += combatCategory === CombatCategory.C1 ? baseVal * 0.7 : baseVal * 0.4;
					this.$thi += baseVal * 0.2;
				}

				this.$tdo += baseVal * 0.3;
				break;
			case TypeStatPrimary.LUCK:
				this.$sem += baseVal * 2;
				if (CombatCategory.S1 === combatCategory) {
					this.$ap += Math.round(statsValue * 1);
					this.$sp += Math.round(statsValue * 1);
					this.$tcr += baseVal * 0.3;
					this.$thi += baseVal * 0.1;
					this.$tha += baseVal * 0.3;
					this.$tdo += baseVal * 0.25;
					this.$scm += baseVal * 2.5;
				} else {
					if ([CombatCategory.M1, CombatCategory.M2, CombatCategory.M3, CombatCategory.M4].includes(combatCategory)) {
						this.$ap += Math.round(statsValue * 0.7);
					}

					if ([CombatCategory.C1, CombatCategory.C2, CombatCategory.C3, CombatCategory.M3].includes(combatCategory)) {
						this.$sp += Math.round(statsValue * 0.7);
					}

					this.$tcr += baseVal * 0.2;
					this.$thi += baseVal * 0.1;
					this.$tha += baseVal * 0.1;
					this.$tdo += baseVal * 0.1;
					this.$scm += baseVal * 5;
				}
				break;
			default:
				break;
		}
	}

}