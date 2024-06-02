import CoreValues from "../../aqw/CoreValues.ts";
import CombatCategory from "../helper/combat/CombatCategory.ts";
import TypeStat from "../helper/combat/skill/TypeStat.ts";
import Attribute from "../helper/combat/Attribute.ts";

export default abstract class Stats {

	public static readonly CAT: Map<string, Array<number>> = new Map<string, Array<number>>([
		[CombatCategory.M1, [0.27, 0.3, 0.22, 0.05, 0.1, 0.06]],
		[CombatCategory.M2, [0.2, 0.22, 0.33, 0.05, 0.1, 0.1]],
		[CombatCategory.M3, [0.24, 0.2, 0.2, 0.24, 0.07, 0.05]],
		[CombatCategory.M4, [0.3, 0.18, 0.3, 0.02, 0.06, 0.14]],
		[CombatCategory.C1, [0.06, 0.2, 0.11, 0.33, 0.15, 0.15]],
		[CombatCategory.C2, [0.08, 0.27, 0.1, 0.3, 0.1, 0.15]],
		[CombatCategory.C3, [0.06, 0.23, 0.05, 0.28, 0.28, 0.1]],
		[CombatCategory.S1, [0.22, 0.18, 0.21, 0.08, 0.08, 0.23]]
	]);

	protected static calculate(type: string, val: number, val2: number, checkNegative: boolean): number {
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

	protected $cai: number = 1;
	protected $cao: number = 1;
	protected $cdi: number = 1;
	protected $cdo: number = 1;
	protected $chi: number = 1;
	protected $cho: number = 1;
	protected $cmc: number = 1;
	protected $cmi: number = 1;
	protected $cmo: number = 1;
	protected $cpi: number = 1;
	protected $cpo: number = 1;
	protected $sbm: number = 0.7;
	protected $scm: number = 1.5;
	protected $sem: number = 0.05;
	protected $shb: number = 0;
	protected $smb: number = 0;
	protected $srm: number = 0.7;

	protected _ap: number = 0; //$ missing
	protected _cai: number = 1;
	protected _cao: number = 1;
	protected _cdi: number = 1;
	protected _cdo: number = 1;
	protected _chi: number = 1;
	protected _cho: number = 1;
	protected _cmc: number = 1;
	protected _cmi: number = 1;
	protected _cmo: number = 1;
	protected _cpi: number = 1;
	protected _cpo: number = 1;
	protected _sbm: number = 0.7;
	protected _scm: number = 1.5;
	protected _sem: number = 0.05;
	protected _shb: number = 0;
	protected _smb: number = 0;
	protected _sp: number = 0;
	protected _srm: number = 0.7;
	protected _tbl: number = 0;
	protected _tcr: number = 0;
	protected _tdo: number = 0;
	protected _tha: number = 0;
	protected _thi: number = 0;
	protected _tpa: number = 0;
	protected _tre: number = 0;

	protected $ap: number = 0;
	protected block: number = 0;
	protected $tcr: number = 0.05;
	protected $tdo: number = 0.04;
	protected $tha: number = 0;
	protected $thi: number = 0;
	protected $sp: number = 0;
	protected parry: number = 0.03;
	protected resist: number = 0;

	protected physicalDamage: number = 0;
	protected maximumPhysicalDamage: number = 0;
	protected minimumPhysicalDamage: number = 0;

	protected magicDamage: number = 0;
	protected maximumMagicDamage: number = 0;
	protected minimumMagicDamage: number = 0;

	public resetValues(): void {
		this.$cai = 1;
		this.$cao = 1;
		this.$cdi = 1;
		this.$cdo = 1;
		this.$chi = 1;
		this.$cho = 1;
		this.$cmc = 1;
		this.$cmi = 1;
		this.$cmo = 1;
		this.$cpi = 1;
		this.$cpo = 1;
		this.$sbm = CoreValues.getValue("baseBlockValue");
		this.$scm = CoreValues.getValue("baseCritValue");
		this.$sem = CoreValues.getValue("baseEventValue");
		this.$shb = 0;
		this.$smb = 0;
		this.$srm = CoreValues.getValue("baseResistValue");

		this._ap = 0;
		this._cai = 1;
		this._cao = 1;
		this._cdi = 1;
		this._cdo = 1;
		this._chi = 1;
		this._cho = 1;
		this._cmc = 1;
		this._cmi = 1;
		this._cmo = 1;
		this._cpi = 1;
		this._cpo = 1;
		this._sbm = CoreValues.getValue("baseBlockValue");
		this._scm = CoreValues.getValue("baseCritValue");
		this._sem = CoreValues.getValue("baseEventValue");
		this._shb = 0;
		this._smb = 0;
		this._sp = 0;
		this._srm = CoreValues.getValue("baseResistValue");
		this._tbl = CoreValues.getValue("baseBlock");
		this._tcr = CoreValues.getValue("baseCrit");
		this._tdo = CoreValues.getValue("baseDodge");
		this._tha = CoreValues.getValue("baseHaste");
		this._thi = CoreValues.getValue("baseHit");
		this._tpa = CoreValues.getValue("baseParry");
		this._tre = 0;

		this.$ap = 0;
		this.block = CoreValues.getValue("baseBlock");
		this.$tcr = CoreValues.getValue("baseCrit");
		this.$tdo = CoreValues.getValue("baseDodge");
		this.$tha = CoreValues.getValue("baseHaste");
		this.$thi = CoreValues.getValue("baseHit");
		this.$sp = 0;
		this.parry = CoreValues.getValue("baseParry");
		this.resist = 0; // baseResist
	}

	protected applyStats(combatCategory: CombatCategory, sp1pc: number, key: Attribute, val: number): void {
		const baseVal: number = val / sp1pc / 100;

		switch (key) {
			case Attribute.STRENGTH:
				if (combatCategory == CombatCategory.M1) {
					this.$sbm -= baseVal * 0.3;
				}

				this.$ap += combatCategory == CombatCategory.S1 ? Math.round(val * 1.4) : val * 2;

				if (combatCategory == CombatCategory.M1 || combatCategory == CombatCategory.M2 || combatCategory == CombatCategory.M3 || combatCategory == CombatCategory.M4 || combatCategory == CombatCategory.S1) {
					this.$tcr += combatCategory == CombatCategory.M4 ? baseVal * 0.7 : baseVal * 0.4;
				}
				break;
			case Attribute.INTELLIGENCE:
				this.$cmi -= baseVal;

				if (combatCategory.charAt(0) == 'C' || combatCategory == CombatCategory.M3) {
					this.$cmo += baseVal;
				}

				this.$sp += combatCategory == CombatCategory.S1 ? Math.round(val * 1.4) : val * 2;

				if (combatCategory == CombatCategory.C1 || combatCategory == CombatCategory.C2 || combatCategory == CombatCategory.C3 || combatCategory == CombatCategory.M3 || combatCategory == CombatCategory.S1) {
					this.$tha += combatCategory == CombatCategory.C2 ? baseVal * 0.5 : baseVal * 0.3;
				}
				break;
			case Attribute.DEXTERITY:
				if (combatCategory == CombatCategory.M1 || combatCategory == CombatCategory.M2 || combatCategory == CombatCategory.M3 || combatCategory == CombatCategory.M4 || combatCategory == CombatCategory.S1) {
					this.$thi += baseVal * 0.2;
					this.$tha += combatCategory == CombatCategory.M2 || combatCategory == CombatCategory.M4 ? baseVal * 0.5 : baseVal * 0.3;
					if (combatCategory == CombatCategory.M1 && this._tbl > 0.01) {
						this.block += baseVal * 0.5;
					}
				}

				this.$tdo += combatCategory != CombatCategory.M2 && combatCategory != CombatCategory.M3 ? baseVal * 0.3 : baseVal * 0.5;
				break;
			case Attribute.WISDOM:
				if (combatCategory == CombatCategory.C1 || combatCategory == CombatCategory.C2 || combatCategory == CombatCategory.C3 || combatCategory == CombatCategory.S1) {
					this.$tcr += combatCategory == CombatCategory.C1 ? baseVal * 0.7 : baseVal * 0.4;
					this.$thi += baseVal * 0.2;
				}

				this.$tdo += baseVal * 0.3;
				break;
			case Attribute.LUCK:
				this.$sem += baseVal * 2;

				if (CombatCategory.S1 == combatCategory) {
					this.$ap += Math.round(val * 1);
					this.$sp += Math.round(val * 1);
					this.$tcr += baseVal * 0.3;
					this.$thi += baseVal * 0.1;
					this.$tha += baseVal * 0.3;
					this.$tdo += baseVal * 0.25;
					this.$scm += baseVal * 2.5;
				} else {
					if (combatCategory == CombatCategory.M1 || combatCategory == CombatCategory.M2 || combatCategory == CombatCategory.M3 || combatCategory == CombatCategory.M4) {
						this.$ap += Math.round(val * 0.7);
					}

					if (combatCategory == CombatCategory.C1 || combatCategory == CombatCategory.C2 || combatCategory == CombatCategory.C3 || combatCategory == CombatCategory.M3) {
						this.$sp += Math.round(val * 0.7);
					}

					this.$tcr += baseVal * 0.2;
					this.$thi += baseVal * 0.1;
					this.$tha += baseVal * 0.1;
					this.$tdo += baseVal * 0.1;
					this.$scm += baseVal * 5;
				}
				break;
		}
	}


}