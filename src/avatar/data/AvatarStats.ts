import Stats from "./Stats.ts";
import TypeStat from "../helper/combat/skill/TypeStat.ts";
import Attribute from "../helper/combat/Attribute.ts";
import type ISkillAuraEffect from "../../database/interfaces/ISkillAuraEffect.ts";
import JSONObject from "../../util/json/JSONObject.ts";

export default abstract class AvatarStats extends Stats {

	private readonly effects: Set<ISkillAuraEffect> = new Set<ISkillAuraEffect>();

	public abstract update(effectsOnly: boolean): void;

	public abstract get get$DEX(): number;

	public abstract get get$END(): number;

	public abstract get get$INT(): number;

	public abstract get get$LCK(): number;

	public abstract get get$STR(): number;

	public abstract get get$WIS(): number;

	public abstract get get_DEX(): number;

	public abstract get get_END(): number;

	public abstract get get_INT(): number;

	public abstract get get_LCK(): number;

	public abstract get get_STR(): number;

	public abstract get get_WIS(): number;

	public applyAuraEffects(): JSONObject {
		const sta: JSONObject = new JSONObject();

		for (const ae of this.effects) {
			this.applyStatByPercent(sta, ae.type, ae.typeStat!.stat, ae.value);
		}

		return sta;
	}

	public applyEffect(effect: ISkillAuraEffect): void {
		this.effects.add(effect);
	}

	public removeEffect(effect: ISkillAuraEffect): void {
		for (const e of this.effects) {
			if (e.id === effect.id) {
				this.effects.delete(e);
			}
		}
	}

	public clearEffects(): void {
		this.effects.clear();
	}

	private applyStatByPercent(sta: JSONObject, type: string, stat: string, value: number): void {
		switch (stat) {
			case TypeStat.CMO:
				this.$cmo = Stats.calculate(type, this.$cmo, value, true); // Magic Boost

				sta
					.element("$cmo", this.$cmo);
				break;
			case TypeStat.CMI:
				this.$cmi = Stats.calculate(type, this.$cmi, value, true); // Magic Resistance

				sta
					.element("$cmi", this.$cmi);
				break;

			case TypeStat.CPO:
				this.$cpo = Stats.calculate(type, this.$cpo, value, true); // Physical Boost

				sta
					.element("$cpo", this.$cpo);
				break;
			case TypeStat.CPI:
				this.$cpi = Stats.calculate(type, this.$cpi, value, true); // Physical Resistance

				sta
					.element("$cpi", this.$cpi);
				break;

			case TypeStat.CAO:
				this.$cao = Stats.calculate(type, this.$cao, value, true); // Damage Boost

				sta
					.element("$cao", this.$cao);
				break;
			case TypeStat.CAI:
				this.$cai = Stats.calculate(type, this.$cai, value, true); // Damage Resistance

				sta
					.element("$cai", this.$cai);
				break;

			case TypeStat.CMC:
				this.$cmc = Stats.calculate(type, this.$cmc, value, false); // Mana Consumption

				sta
					.element("$cmc", this.$cmc);
				break;

			case TypeStat.CHO:
				this.$cho = Stats.calculate(type, this.$cho, value, true); // Heal Over Time Boost

				sta
					.element("$cho", this.$cho);
				break;
			case TypeStat.CHI:
				this.$chi = Stats.calculate(type, this.$chi, value, true); // Heal Over Time Intake

				sta
					.element("$chi", this.$chi);
				break;

			case TypeStat.CDO:
				this.$cdo = Stats.calculate(type, this.$cdo, value, true); // Damage Over Time Boost

				sta
					.element("$cdo", this.$cdo);
				break;
			case TypeStat.CDI:
				this.$cdi = Stats.calculate(type, this.$cdi, value, true); // Damage Over Time Resistance

				sta
					.element("$cdi", this.$cdi);
				break;

			case TypeStat.SCM:
				this.$scm = Stats.calculate(type, this.$scm, value, false); // Stat Critical Multiplier

				sta
					.element("$scm", this.$scm);
				break;
			case TypeStat.SBM:
				this.$sbm = Stats.calculate(type, this.$sbm, value, false); // Stat Block Multiplier

				sta
					.element("$sbm", this.$sbm);
				break;
			case TypeStat.SEM:
				this.$sem = Stats.calculate(type, this.$sem, value, false); // Stat Event Multiplier TODO

				sta
					.element("$sem", this.$sem);
				break;
			case TypeStat.SRM:
				this.$srm = Stats.calculate(type, this.$srm, value, false); // Stat Resist Multiplier

				sta
					.element("$srm", this.$srm);
				break;

			case TypeStat.SHB:
				this.$shb = Stats.calculate(type, this.$shb, value, false); // Stat Health Boost TODO

				sta
					.element("$shb", this.$shb);
				break;
			case TypeStat.SMB:
				this.$smb = Stats.calculate(type, this.$smb, value, false); // Stat Mana Boost TODO

				sta
					.element("$smb", this.$smb);
				break;

			case TypeStat.TCR:
				this.$tcr = Stats.calculate(type, this.$tcr, value, false); // Critical

				sta
					.element("$tcr", this.$tcr);
				break;
			case TypeStat.THA:
				this.$tha = Stats.calculate(type, this.$tha, value, false); // Haste

				sta
					.element("$tha", this.$tha);
				break;
			case TypeStat.TDO:
				this.$tdo = Stats.calculate(type, this.$tdo, value, false); // Evasion

				sta
					.element("$tdo", this.$tdo);
				break;
			case TypeStat.THI:
				this.$thi = Stats.calculate(type, this.$thi, value, false); // Hit

				sta
					.element("$thi", this.$thi);
				break;

			case TypeStat.AP:
				this.$ap = Stats.calculate(type, this.$ap, value, false); // Attack Power

				sta
					.element("$ap", this.$ap);
				break;
			case TypeStat.MP:
				this.$sp = Stats.calculate(type, this.$sp, value, false); // Magic Power

				sta
					.element("$sp", this.$sp);
				break;

			case Attribute.WISDOM:
				this.$WIS = Stats.calculate(type, this.$WIS, value, false); // Wisdom

				sta
					.element("$WIS", this.$WIS);
				break;
			case Attribute.INTELLIGENCE:
				this.$INT = Stats.calculate(type, this.$INT, value, false); // Intelligence

				sta
					.element("$INT", this.$INT);
				break;
			case Attribute.ENDURANCE:
				this.$END = Stats.calculate(type, this.$END, value, false); // Endurance

				sta
					.element("$END", this.$END);
				break;
			case Attribute.DEXTERITY:
				this.$DEX = Stats.calculate(type, this.$DEX, value, false); // Dexterity

				sta
					.element("$DEX", this.$DEX);
				break;
			case Attribute.STRENGTH:
				this.$STR = Stats.calculate(type, this.$STR, value, false); // Strength

				sta
					.element("$STR", this.$STR);
				break;
			case Attribute.LUCK:
				this.$LCK = Stats.calculate(type, this.$LCK, value, false); // Luck

				sta
					.element("$LCK", this.$LCK);
				break;
		}
	}

}