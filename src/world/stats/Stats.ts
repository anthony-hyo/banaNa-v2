import Users from "../Users";

import type Player from "../../player/Player.ts";
import type Enhancement from "../../database/interfaces/Enhancement.ts";
import type Item from "../../database/interfaces/Item.ts";
import type Skill from "../../database/interfaces/Skill.ts";
import type SkillAuraEffect from "../../database/interfaces/SkillAuraEffect.ts";
import {CoreValues} from "../../aqw/CoreValues.ts";
import JSONObject from "../../util/json/JSONObject.ts";

export default class Stats {

    public static readonly classCatMap: Map<string, number[]> = new Map([
        ["M1", [0.27, 0.3, 0.22, 0.05, 0.1, 0.06]],
        ["M2", [0.2, 0.22, 0.33, 0.05, 0.1, 0.1]],
        ["M3", [0.24, 0.2, 0.2, 0.24, 0.07, 0.05]],
        ["M4", [0.3, 0.18, 0.3, 0.02, 0.06, 0.14]],
        ["C1", [0.06, 0.2, 0.11, 0.33, 0.15, 0.15]],
        ["C2", [0.08, 0.27, 0.1, 0.3, 0.1, 0.15]],
        ["C3", [0.06, 0.23, 0.05, 0.28, 0.28, 0.1]],
        ["S1", [0.22, 0.18, 0.21, 0.08, 0.08, 0.23]]
    ]);

    public static readonly ratioByEquipment: Map<string, number> = new Map([
        ["he", 0.25],
        ["ar", 0.25],
        ["ba", 0.2],
        ["Weapon", 0.33]
    ]);

    public wDPS: number = 0;
    public innate: Map<string, number> = new Map<string, number>();
    public weapon: Map<string, number> = new Map<string, number>();
    public helm: Map<string, number> = new Map<string, number>();
    public armor: Map<string, number> = new Map<string, number>();
    public cape: Map<string, number> = new Map<string, number>();
    public effects: Set<SkillAuraEffect> = new Set<SkillAuraEffect>();
    private $cai: number = 1.0;
    private $cao: number = 1.0;
    private $cdi: number = 1.0;
    private $cdo: number = 1.0;
    private $chi: number = 1.0;
    private $cho: number = 1.0;
    private $cmc: number = 1.0;
    private $cmi: number = 1.0;
    private $cmo: number = 1.0;
    private $cpi: number = 1.0;
    private $cpo: number = 1.0;
    private $sbm: number = 0.7;
    private $scm: number = 1.5;
    private $sem: number = 0.05;
    private $shb: number = 0.0;
    private $smb: number = 0.0;
    private $srm: number = 0.7;
    private attackPower: number = 0.0;
    private magicPower: number = 0.0;
    private block: number = 0.0;
    private criticalHit: number = 0.05;
    private evasion: number = 0.04;
    private haste: number = 0.0;
    private hit: number = 0.0;
    private parry: number = 0.03;
    private resist: number = 0.7;
    private _ap: number = 0.0;
    private _cai: number = 1.0;
    private _cao: number = 1.0;
    private _cdi: number = 1.0;
    private _cdo: number = 1.0;
    private _chi: number = 1.0;
    private _cho: number = 1.0;
    private _cmc: number = 1.0;
    private _cmi: number = 1.0;
    private _cmo: number = 1.0;
    private _cpi: number = 1.0;
    private _cpo: number = 1.0;
    private _sbm: number = 0.7;
    private _scm: number = 1.5;
    private _sem: number = 0.05;
    private _shb: number = 0.0;
    private _smb: number = 0.0;
    private _sp: number = 0.0; //magic power
    private _srm: number = 0.7;
    private _tbl: number = 0.0;
    private _tcr: number = 0.0; //total crit
    private _tdo: number = 0.0; //total dodge
    //private mDPS: number = 0;
    private _tha: number = 0.0; //total haste
    private _thi: number = 0.0; //total hit
    private _tpa: number = 0.0;
    private _tre: number = 0.0;
    private minDmg: number = 0;
    private maxDmg: number = 0;

    public constructor(private readonly player: Player) {
        //IN ORDER DO NOT TOUCH
        this.innate.set("STR", 0.0);
        this.innate.set("END", 0.0);
        this.innate.set("DEX", 0.0);
        this.innate.set("INT", 0.0);
        this.innate.set("WIS", 0.0);
        this.innate.set("LCK", 0.0);

        this.weapon.set("STR", 0.0);
        this.weapon.set("END", 0.0);
        this.weapon.set("DEX", 0.0);
        this.weapon.set("INT", 0.0);
        this.weapon.set("WIS", 0.0);
        this.weapon.set("LCK", 0.0);

        this.helm.set("STR", 0.0);
        this.helm.set("END", 0.0);
        this.helm.set("DEX", 0.0);
        this.helm.set("INT", 0.0);
        this.helm.set("WIS", 0.0);
        this.helm.set("LCK", 0.0);

        this.armor.set("STR", 0.0);
        this.armor.set("END", 0.0);
        this.armor.set("DEX", 0.0);
        this.armor.set("INT", 0.0);
        this.armor.set("WIS", 0.0);
        this.armor.set("LCK", 0.0);

        this.cape.set("STR", 0.0);
        this.cape.set("END", 0.0);
        this.cape.set("DEX", 0.0);
        this.cape.set("INT", 0.0);
        this.cape.set("WIS", 0.0);
        this.cape.set("LCK", 0.0);
    }

    public sendStatChanges(stat: Stats, effects: Set<SkillAuraEffect>): void {
        const stu: JSONObject = new JSONObject();
        const sta: JSONObject = new JSONObject();

        for (let ae of effects) {
            if (ae.stat === "tha") {
                sta.put("$tha", this.haste);
            } else if (ae.stat === "tdo") {
                sta.put("$tdo", this.evasion);
            } else if (ae.stat === "thi") {
                sta.put("$thi", this.hit);
            } else if (ae.stat === "tcr") {
                sta.put("$tcr", this.criticalHit);
            }
        }

        stu.put("cmd", "stu");
        stu.put("sta", sta);

        this.player.network.writeObject(stu);
    }

    public update(): void {
        this.initInnateStats();
        this.applyCoreStatRatings();
        this.applyAuraEffects();
        this.initDamage();
    }

    public get$DEX(): number {
        return Math.floor(this.weapon.get("DEX")! + this.armor.get("DEX")! + this.helm.get("DEX")! + this.cape.get("DEX")!);
    }

    public get$END(): number {
        return Math.floor(this.weapon.get("END")! + this.armor.get("END")! + this.helm.get("END")! + this.cape.get("END")!);
    }

    public get$INT(): number {
        return Math.floor(this.weapon.get("INT")! + this.armor.get("INT")! + this.helm.get("INT")! + this.cape.get("INT")!);
    }

    public get$LCK(): number {
        return Math.floor(this.weapon.get("LCK")! + this.armor.get("LCK")! + this.helm.get("LCK")! + this.cape.get("LCK")!);
    }

    public get$STR(): number {
        return Math.floor(this.weapon.get("STR")! + this.armor.get("STR")! + this.helm.get("STR")! + this.cape.get("STR")!);
    }

    public get$WIS(): number {
        return Math.floor(this.weapon.get("WIS")! + this.armor.get("WIS")! + this.helm.get("WIS")! + this.cape.get("WIS")!);
    }

    public get$ap(): number {
        return this.attackPower;
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
        return this.magicPower;
    }

    public get$srm(): number {
        return this.$srm;
    }

    public get$tbl(): number {
        return this.block;
    }

    public get$tcr(): number {
        return this.criticalHit;
    }

    public get$tdo(): number {
        return this.evasion;
    }

    public get$tha(): number {
        return this.haste;
    }

    public get$thi(): number {
        return this.hit;
    }

    public get$tpa(): number {
        return this.parry;
    }

    public get$tre(): number {
        return this.resist;
    }

    public get_DEX(): number {
        return this.innate.get("DEX")!;
    }

    public get_END(): number {
        return this.innate.get("END")!;
    }

    public get_INT(): number {
        return this.innate.get("INT")!;
    }

    public get_LCK(): number {
        return this.innate.get("LCK")!;
    }

    public get_STR(): number {
        return this.innate.get("STR")!;
    }

    public get_WIS(): number {
        return this.innate.get("WIS")!;
    }

    public get_ap(): number {
        return this._ap;
    }

    public get_cai(): number {
        return this._cai;
    }

    public get_cao(): number {
        return this._cao;
    }

    public get_cdi(): number {
        return this._cdi;
    }

    public get_cdo(): number {
        return this._cdo;
    }

    public get_chi(): number {
        return this._chi;
    }

    public get_cho(): number {
        return this._cho;
    }

    public get_cmc(): number {
        return this._cmc;
    }

    public get_cmi(): number {
        return this._cmi;
    }

    public get_cmo(): number {
        return this._cmo;
    }

    public get_cpi(): number {
        return this._cpi;
    }

    public get_cpo(): number {
        return this._cpo;
    }

    public get_sbm(): number {
        return this._sbm;
    }

    public get_scm(): number {
        return this._scm;
    }

    public get_sem(): number {
        return this._sem;
    }

    public get_shb(): number {
        return this._shb;
    }

    public get_smb(): number {
        return this._smb;
    }

    public get_sp(): number {
        return this._sp;
    }

    public get_srm(): number {
        return this._srm;
    }

    public get_tbl(): number {
        return this._tbl;
    }

    public get_tcr(): number {
        return this._tcr;
    }

    public get_tdo(): number {
        return this._tdo;
    }

    public get_tha(): number {
        return this._tha;
    }

    public get_thi(): number {
        return this._thi;
    }

    public get_tpa(): number {
        return this._tpa;
    }

    public get_tre(): number {
        return this._tre;
    }

    public getMinDmg(): number {
        return this.minDmg;
    }

    public getMaxDmg(): number {
        return this.maxDmg;
    }

    private applyAuraEffects(): void {
        for (let ae of this.effects) {
            switch (ae.stat) {
                case "tha":
                    if (ae.type === "+") {
                        this.haste += ae.value;
                    } else if (ae.type === "-") {
                        this.haste -= ae.value;
                    } else {
                        this.haste *= ae.value;
                    }
                    break;
                case "tdo":
                    if (ae.type === "+") {
                        this.evasion += ae.value;
                    } else if (ae.type === "-") {
                        this.evasion -= ae.value;
                    } else {
                        this.evasion *= ae.value;
                    }
                    break;
                case "thi":
                    if (ae.type === "+") {
                        this.hit += ae.value;
                    } else if (ae.type === "-") {
                        this.hit -= ae.value;
                    } else {
                        this.hit *= ae.value;
                    }
                    break;
                case "tcr":
                    if (ae.type === "+") {
                        this.criticalHit += ae.value;
                    } else if (ae.type === "-") {
                        this.criticalHit -= ae.value;
                    } else {
                        this.criticalHit *= ae.value;
                    }
                    break;
            }
        }
    }

    private initInnateStats(): void {
        let level: number = parseInt(this.player.properties.get("level"));
        let cat: string = this.player.properties.get("classcat");

        let innateStat: number = CoreValues.getInnateStats(level);
        let ratios: number[] = <number[]>Stats.classCatMap.get(cat);

        let keyEntry: IterableIterator<string> = this.innate.keys();

        let i: number = 0;
        for (let key of keyEntry) {
            let stat: number = Math.round(ratios[i] * innateStat);
            this.innate.set(key, stat);
            i++;
        }
    }

    private resetValues(): void {
        this._ap = 0.0;
        this.attackPower = 0.0;
        this._sp = 0.0;
        this.magicPower = 0.0;
        this._tbl = 0.0;
        this._tpa = 0.0;
        this._tdo = 0.0;
        this._tcr = 0.0;
        this._thi = 0.0;
        this._tha = 0.0;
        this._tre = 0.0;
        this.block = CoreValues.getValue("baseBlock")!;
        this.parry = CoreValues.getValue("baseParry")!;
        this.evasion = CoreValues.getValue("baseDodge")!;
        this.criticalHit = CoreValues.getValue("baseCrit")!;
        this.hit = CoreValues.getValue("baseHit")!;
        this.haste = CoreValues.getValue("baseHaste")!;
        this.resist = 0.0; //baseResist
        this._cpo = 1.0;
        this._cpi = 1.0;
        this._cao = 1.0;
        this._cai = 1.0;
        this._cmo = 1.0;
        this._cmi = 1.0;
        this._cdo = 1.0;
        this._cdi = 1.0;
        this._cho = 1.0;
        this._chi = 1.0;
        this._cmc = 1.0;
        this.$cpo = 1.0;
        this.$cpi = 1.0;
        this.$cao = 1.0;
        this.$cai = 1.0;
        this.$cmo = 1.0;
        this.$cmi = 1.0;
        this.$cdo = 1.0;
        this.$cdi = 1.0;
        this.$cho = 1.0;
        this.$chi = 1.0;
        this.$cmc = 1.0;
        this._scm = CoreValues.getValue("baseCritValue")!;
        this._sbm = CoreValues.getValue("baseBlockValue")!;
        this._srm = CoreValues.getValue("baseResistValue")!;
        this._sem = CoreValues.getValue("baseEventValue")!;
        this.$scm = CoreValues.getValue("baseCritValue")!;
        this.$sbm = CoreValues.getValue("baseBlockValue")!;
        this.$srm = CoreValues.getValue("baseResistValue")!;
        this.$sem = CoreValues.getValue("baseEventValue")!;
        this._shb = 0.0;
        this._smb = 0.0;
        this.$shb = 0.0;
        this.$smb = 0.0;
    }

    private applyCoreStatRatings(): void {
        const cat: string = this.player.properties.get(Users.CLASS_CATEGORY) as string;
        const enhancement: Enhancement = this.player.properties.get(Users.ITEM_WEAPON_ENHANCEMENT);
        const level: number = this.player.properties.get(Users.LEVEL) as number;

        const wLvl: number = enhancement ? enhancement.level : 1;
        let iDPS: number = enhancement ? enhancement.dps : 100;
        iDPS = iDPS === 0 ? 100 : iDPS;
        iDPS = iDPS / 100;

        const intAPtoDPS: number = CoreValues.getValue("intAPtoDPS")!;
        const PCDPSMod: number = CoreValues.getValue("PCDPSMod")!;
        //const intSPtoDPS: number = CoreValues.getValue("intSPtoDPS");

        const hpTgt: number = CoreValues.getBaseHPByLevel(level);
        const TTD: number = 20;
        const tDPS: number = (hpTgt / 20) * 0.7;
        const sp1pc: number = (2.25 * tDPS) / (100 / intAPtoDPS) / 2;

        this.resetValues();

        for (const key in this.innate) {
            let val: number = this.innate.get(key)! + this.armor.get(key)! + this.weapon.get(key)! + this.helm.get(key)! + this.cape.get(key)!;

            if (key === "STR") {
                const bias1: number = sp1pc;
                if (cat === "M1") {
                    this.$sbm -= (val / bias1 / 100) * 0.3;
                }
                if (cat === "S1") {
                    this.attackPower += Math.round(val * 1.4);
                } else {
                    this.attackPower += val * 2;
                }
                if (["M1", "M2", "M3", "M4", "S1"].includes(cat)) {
                    this.criticalHit += (val / bias1 / 100) * (cat === "M4" ? 0.7 : 0.4);
                }
            } else if (key === "INT") {
                const bias1: number = sp1pc;
                this.$cmi -= val / bias1 / 100;
                if (cat[0] === "C" || cat === "M3") {
                    this.$cmo += val / bias1 / 100;
                }
                if (cat === "S1") {
                    this.magicPower += Math.round(val * 1.4);
                } else {
                    this.magicPower += val * 2;
                }
                if (["C1", "C2", "C3", "M3", "S1"].includes(cat)) {
                    this.haste += (val / bias1 / 100) * (cat === "C2" ? 0.5 : 0.3);
                }
            } else if (key === "DEX") {
                const bias1: number = sp1pc;
                if (["M1", "M2", "M3", "M4", "S1"].includes(cat)) {
                    if (!cat.startsWith("C")) {
                        this.hit += (val / bias1 / 100) * 0.2;
                    }
                    if (["M2", "M4"].includes(cat)) {
                        this.haste += (val / bias1 / 100) * 0.5;
                    } else {
                        this.haste += (val / bias1 / 100) * 0.3;
                    }
                    if (cat === "M1" && this._tbl > 0.01) {
                        this.block += (val / bias1 / 100) * 0.5;
                    }
                }
                if (!["M2", "M3"].includes(cat)) {
                    this.evasion += (val / bias1 / 100) * 0.3;
                } else {
                    this.evasion += (val / bias1 / 100) * 0.5;
                }
            } else if (key === "WIS") {
                const bias1: number = sp1pc;
                if (["C1", "C2", "C3", "S1"].includes(cat)) {
                    if (cat === "C1") {
                        this.criticalHit += (val / bias1 / 100) * 0.7;
                    } else {
                        this.criticalHit += (val / bias1 / 100) * 0.4;
                    }
                    this.hit += (val / bias1 / 100) * 0.2;
                }
                this.evasion += (val / bias1 / 100) * 0.3;
            } else if (key === "LCK") {
                const bias1: number = sp1pc;
                this.$sem += (val / bias1 / 100) * 2;
                if (cat === "S1") {
                    this.attackPower += Math.round(val * 1);
                    this.magicPower += Math.round(val * 1);
                    this.criticalHit += (val / bias1 / 100) * 0.3;
                    this.hit += (val / bias1 / 100) * 0.1;
                    this.haste += (val / bias1 / 100) * 0.3;
                    this.evasion += (val / bias1 / 100) * 0.25;
                    this.$scm += (val / bias1 / 100) * 2.5;
                } else {
                    if (["M1", "M2", "M3", "M4"].includes(cat)) {
                        this.attackPower += Math.round(val * 0.7);
                    }
                    if (["C1", "C2", "C3", "M3"].includes(cat)) {
                        this.magicPower += Math.round(val * 0.7);
                    }
                    this.criticalHit += (val / bias1 / 100) * 0.2;
                    this.hit += (val / bias1 / 100) * 0.1;
                    this.haste += (val / bias1 / 100) * 0.1;
                    this.evasion += (val / bias1 / 100) * 0.1;
                    this.$scm += (val / bias1 / 100) * 5;
                }
            }
        }

        this.wDPS = Math.round((CoreValues.getBaseHPByLevel(wLvl) / TTD) * iDPS * PCDPSMod + Math.round(this.attackPower / intAPtoDPS));
        // this.mDPS = Math.round(((this.world.getBaseHPByLevel(wLvl) / TTD) * iDPS * PCDPSMod) + Math.round(($sp / intSPtoDPS)));
    }

    private initDamage(): void {
        //Calculate Damage

        let userSkills: Map<string, any> = this.player.properties.get("skills");
        let weaponItem: Item = this.player.properties.get("weaponitem");

        if (userSkills && weaponItem) {
            const autoAttack: Skill | undefined = this.world.skills.get(userSkills.get("aa"));

            if (!autoAttack) {
                throw new Error("not allowed to have class without auto attack");
            }

            const wSPD: number = 2.0;
            const wDMG: number = this.wDPS * wSPD;
            const wepDPS: number = weaponItem.dps;
            const wepRng: number = weaponItem.range;
            const iRNG: number = wepRng / 100.0;
            const tDMG: number = wDMG * autoAttack.damage;

            this.minDmg = Math.floor(tDMG - tDMG * iRNG + wepDPS);
            this.maxDmg = Math.ceil(tDMG + tDMG * iRNG + wepDPS);
        }
    }

}
