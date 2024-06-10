import CoreValues from "../../aqw/CoreValues.ts";
import CombatCategory from "../helper/combat/CombatCategory.ts";

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

	protected $ap: number = 0;
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
	protected $sp: number = 0;
	protected $srm: number = 0.7;
	protected $tbl: number = 0;
	protected $tcr: number = 0.05;
	protected $tdo: number = 0.04;
	protected $tha: number = 0;
	protected $thi: number = 0;
	protected $tpa: number = 0.03;
	protected $tre: number = 0.7;
	protected $str: number = 0;
	protected $end: number = 0;
	protected $wis: number = 0;
	protected $int: number = 0;
	protected $dex: number = 0;
	protected $lck: number = 0;

	protected _ap: number = 0;
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
	protected _tcr: number = 0.05;
	protected _tdo: number = 0.04;
	protected _tha: number = 0;
	protected _thi: number = 0;
	protected _tpa: number = 0.03;
	protected _tre: number = 0.7;
	public _str: number = 0;
	public _end: number = 0;
	public _wis: number = 0;
	public _int: number = 0;
	public _dex: number = 0;
	public _lck: number = 0;

	public resetValues(): void {
		this.$ap = 0;
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
		this.$sp = 0;
		this.$srm = CoreValues.getValue("baseResistValue");
		this.$tbl = CoreValues.getValue("baseBlock");
		this.$tcr = CoreValues.getValue("baseCrit");
		this.$tdo = CoreValues.getValue("baseDodge");
		this.$tha = CoreValues.getValue("baseHaste");
		this.$thi = CoreValues.getValue("baseHit");
		this.$tpa = CoreValues.getValue("baseParry");
		this.$tre = 0; // baseResist

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
		this._tre = 0; // baseResist
	}

	public get$ap(): number {
		return this.$ap;
	}

	public get$cai(): number {
		return this.$cai;
	}

	public get$cao(): number {
		return this.$cao;
	}

	public get$cdi(): number {
		return this.$cdi;
	}

	public get$cdo(): number {
		return this.$cdo;
	}

	public get$chi(): number {
		return this.$chi;
	}

	public get$cho(): number {
		return this.$cho;
	}

	public get$cmc(): number {
		return this.$cmc;
	}

	public get$cmi(): number {
		return this.$cmi;
	}

	public get$cmo(): number {
		return this.$cmo;
	}

	public get$cpi(): number {
		return this.$cpi;
	}

	public get$cpo(): number {
		return this.$cpo;
	}

	public get$sbm(): number {
		return this.$sbm;
	}

	public get$scm(): number {
		return this.$scm;
	}

	public get$sem(): number {
		return this.$sem;
	}

	public get$shb(): number {
		return this.$shb;
	}

	public get$smb(): number {
		return this.$smb;
	}

	public get$sp(): number {
		return this.$sp;
	}

	public get$srm(): number {
		return this.$srm;
	}

	public get$tbl(): number {
		return this.$tbl;
	}

	public get$tcr(): number {
		return this.$tcr;
	}

	public get$tdo(): number {
		return this.$tdo;
	}

	public get$tha(): number {
		return this.$tha;
	}

	public get$thi(): number {
		return this.$thi;
	}

	public get$tpa(): number {
		return this.$tpa;
	}

	public get$tre(): number {
		return this.$tre;
	}

}