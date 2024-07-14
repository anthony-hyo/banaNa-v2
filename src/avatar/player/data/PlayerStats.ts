import AvatarStats from "../../data/AvatarStats.ts";
import CoreValues from "../../../aqw/CoreValues.ts";
import type Player from "../Player.ts";
import type IUserInventory from "../../../database/interfaces/IUserInventory.ts";
import database from "../../../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {users} from "../../../database/drizzle/schema.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import CombatCategory from "../../helper/combat/CombatCategory.ts";
import Attribute from "../../helper/combat/Attribute.ts";
import TypeStatPrimary from "../../helper/combat/skill/TypeStatPrimary.ts";
import TypeStat from "../../helper/combat/skill/TypeStat.ts";
import {AvatarState} from "../../helper/AvatarState.ts";
import type ISkill from "../../../database/interfaces/ISkill.ts";

export default class PlayerStats extends AvatarStats {

	public readonly innateStats: Map<Attribute, number> = new Map<Attribute, number>(); //innateStats

	constructor(
		private readonly player: Player
	) {
		super();
	}

	public override async update(): Promise<void> {
		await this.initInnateStats();
		this.initTotalStats();
		await this.applyCoreStatRatings();

		try {
			this.applyAuraEffects();
			await this.updateStatus();
			this.initDamage();

			const tempStat: JSONObject = new JSONObject();

			tempStat.accumulateAll(this.player.inventory.statsItems);

			this.player.writeObject(new JSONObject()
				.element("tempSta", tempStat)
				.element("cmd", "stu")
				.element("sta",
					new JSONObject()
						.element("$DEX", this.get$DEX())
						.element("$END", this.get$END())
						.element("$INT", this.get$INT())
						.element("$LCK", this.get$LCK())
						.element("$STR", this.get$STR())
						.element("$WIS", this.get$WIS())
						.element("$ap", this.get$ap())
						.element("$cai", this.get$cai())
						.element("$cao", this.get$cao())
						.element("$cdi", this.get$cdi())
						.element("$cdo", this.get$cdo())
						.element("$chi", this.get$chi())
						.element("$cho", this.get$cho())
						.element("$cmc", this.get$cmc())
						.element("$cmi", this.get$cmi())
						.element("$cmo", this.get$cmo())
						.element("$cpi", this.get$cpi())
						.element("$cpo", this.get$cpo())
						//.element("$dsh", this.get$dsh())
						.element("$scm", this.get$scm())
						.element("$shb", this.get$shb())
						.element("$smb", this.get$smb())
						.element("$sp", this.get$sp())
						.element("$tcr", this.get$tcr())
						.element("$tdo", this.get$tdo())
						.element("$tha", this.get$tha())
						.element("$thi", this.get$thi())
						.element("_DEX", this.get_DEX())
						.element("_END", this.get_END())
						.element("_INT", this.get_INT())
						.element("_LCK", this.get_LCK())
						.element("_STR", this.get_STR())
						.element("_WIS", this.get_WIS())
				)
				.element("wDPS", this.weaponDps())
				.element("mDPS", this.magicDps())
			);
		} catch (error: any) {
			this.player.writeArray("warning", ["Error occurred while updating stats, contact staff if the problem persist."]);
			this.player.kick(error);
		}

		this.player.status.restore();
	}

	public override async updateEffect(statsUpdated: TypeStat[] | TypeStatPrimary[] | null): Promise<void> {
		await this.initInnateStats();
		this.initTotalStats();
		await this.applyCoreStatRatings();

		try {
			this.applyAuraEffects();

			const sta: any = {};
			if (statsUpdated) {
				statsUpdated.forEach((s: TypeStat | TypeStatPrimary) => {
					this.addStat(sta, s);
				});
			}

			this.initDamage();

			this.player.writeObject(new JSONObject()
				.element("cmd", "stu")
				.element("sta", sta)
			);
		} catch (error: any) {
			this.player.writeArray("warning", ["Error occurred while updating stats, contact staff if the problem persist."]);
			this.player.kick(error);
		}
	}

	public override get$DEX(): number {
		return Math.floor(this.$dex + this.get_DEX());
	}

	public override get$END(): number {
		return Math.floor(this.$end + this.get_END());
	}

	public override get$INT(): number {
		return Math.floor(this.$int + this.get_INT());
	}

	public override get$LCK(): number {
		return Math.floor(this.$lck + this.get_LCK());
	}

	public override get$STR(): number {
		return Math.floor(this.$str + this.get_STR());
	}

	public override get$WIS(): number {
		return Math.floor(this.$wis + this.get_WIS());
	}

	public override get_DEX(): number {
		return this._dex;
	}

	public override get_END(): number {
		return this._end;
	}

	public override get_INT(): number {
		return this._int;
	}

	public override get_LCK(): number {
		return this._lck;
	}

	public override get_STR(): number {
		return this._str;
	}

	public override get_WIS(): number {
		return this._wis;
	}

	public async initInnateStats(): Promise<void> {
		const { level } = await database.query.users.findFirst({
			columns: {
				level: true
			},
			where: eq(users.id, this.player.databaseId)
		}) || { level: 1 };


		const equippedClass: IUserInventory | undefined = this.player.inventory.equippedClass;

		CoreValues.setInitInnateStats(this, level, equippedClass ? equippedClass.item!.class!.category : CombatCategory.M1);
	}

	private initTotalStats(): void {
		this.$dex = this.player.inventory.stat(TypeStatPrimary.DEXTERITY);
		this.$end = this.player.inventory.stat(TypeStatPrimary.ENDURANCE);
		this.$int = this.player.inventory.stat(TypeStatPrimary.INTELLIGENCE);
		this.$lck = this.player.inventory.stat(TypeStatPrimary.LUCK);
		this.$str = this.player.inventory.stat(TypeStatPrimary.STRENGTH);
		this.$wis = this.player.inventory.stat(TypeStatPrimary.WISDOM);
	}

	private initDamage(): void {
		const skillAutoAttack: ISkill | undefined = this.player.combat.skillAutoAttack;
		const equippedWeapon: IUserInventory | undefined = this.player.inventory.equippedWeapon;

		this.damageMinMax(skillAutoAttack ? Number(skillAutoAttack.damage) : 1, equippedWeapon ? equippedWeapon.item!.range : 10);
	}

	private async updateStatus(): Promise<void> {
		const END: number = this.get$END() + this.get_END();
		const WIS: number = this.get$WIS() + this.get_WIS();

		const intHPperEND: number = CoreValues.getValue("intHPperEND");
		const intMPperWIS: number = CoreValues.getValue("intMPperWIS");

		const { level } = await database.query.users.findFirst({
			columns: {
				level: true
			},
			where: eq(users.id, this.player.databaseId)
		}) || { level: 1 };

		const userHp: number = CoreValues.getHealthByLevel(level) + END * intHPperEND;
		const userMp: number = CoreValues.getManaByLevel(level) + WIS * intMPperWIS;

		this.player.status.health.max = userHp;
		this.player.status.mana.max = userMp;

		if (this.player.status.state == AvatarState.NEUTRAL && this.player.room && this.player.room.monsters.size < 1) {
			this.player.status.health.update = userHp;
			this.player.status.mana.update = userMp;
		}

		this.player.status.jsonTls(true, true, true, true, false);
	}

	private async applyCoreStatRatings(): Promise<void> {
		const { level: playerLevel } = await database.query.users.findFirst({
			columns: {
				level: true
			},
			where: eq(users.id, this.player.databaseId)
		}) || { level: 1 };

		const equippedClass: IUserInventory | undefined = this.player.inventory.equippedClass;

		const equippedWeapon: IUserInventory | undefined = this.player.inventory.equippedWeapon;

		this.category = equippedClass ? <CombatCategory>equippedClass.item!.class!.category : CombatCategory.M1;

		const { level: wLvl, damagePerSecond } = equippedWeapon ? (equippedWeapon.item!.isTemporary ? equippedWeapon.item!.enhancement! : equippedWeapon.enhancement!) : { level: 0, damagePerSecond: 0 };

		const iDPS: number = damagePerSecond / 100;

		const intAPtoDPS: number = CoreValues.getValue("intAPtoDPS");
		const intSPtoDPS: number = CoreValues.getValue("intSPtoDPS");

		const PCDPSMod: number = CoreValues.getValue("PCDPSMod");
		const hpTgt: number = CoreValues.getBaseHPByLevel(playerLevel);
		const TTD: number = 20;
		const tDPS: number = (hpTgt / 20) * 0.7;
		const sp1pc: number = (2.25 * tDPS) / (100 / intAPtoDPS) >> 1;

		this.resetValues();

		this.statsFinal(this.category, sp1pc, TypeStatPrimary.STRENGTH, this.get$STR());
		this.statsFinal(this.category, sp1pc, TypeStatPrimary.ENDURANCE, this.get$END());
		this.statsFinal(this.category, sp1pc, TypeStatPrimary.DEXTERITY, this.get$DEX());
		this.statsFinal(this.category, sp1pc, TypeStatPrimary.INTELLIGENCE, this.get$INT());
		this.statsFinal(this.category, sp1pc, TypeStatPrimary.WISDOM, this.get$WIS());
		this.statsFinal(this.category, sp1pc, TypeStatPrimary.LUCK, this.get$LCK());

		this._weaponDps = Math.round(CoreValues.getBaseHPByLevel(Math.floor(wLvl)) / TTD * iDPS * PCDPSMod) + Math.round(this.$ap / intAPtoDPS);
		this._magicDps = Math.round(CoreValues.getBaseHPByLevel(Math.floor(wLvl)) / TTD * iDPS * PCDPSMod) + Math.round(this.$sp / intSPtoDPS);
	}


}
