import AvatarStats from "../../data/AvatarStats.ts";
import CoreValues from "../../../aqw/CoreValues.ts";
import type Player from "../Player.ts";
import type ISkill from "../../../database/interfaces/ISkill.ts";
import type IUserInventory from "../../../database/interfaces/IUserInventory.ts";
import database from "../../../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {users} from "../../../database/drizzle/schema.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import {AvatarState} from "../../helper/AvatarState.ts";
import CombatCategory from "../../helper/combat/CombatCategory.ts";
import Attribute from "../../helper/combat/Attribute.ts";

export class PlayerStats extends AvatarStats {

	public readonly statsBase: Map<Attribute, number> = new Map<Attribute, number>(); //innateStats

	public async initBaseStats(): Promise<void> { //initInnateStats
		const { level } = await database.query.users.findFirst({
			columns: {
				level: true
			},
			where: eq(users.id, this.player.databaseId)
		}) || { level: 1 };

		const equippedClass: IUserInventory | undefined = this.player.inventory.equippedClass;

		CoreValues.setInitialBaseStats(level, equippedClass ? equippedClass.item!.class!.category : CombatCategory.M1, this.statsBase);
	}

	constructor(
		private readonly player: Player
	) {
		super();

		this.statsBase.set(Attribute.STRENGTH, 0);
		this.statsBase.set(Attribute.ENDURANCE, 0);
		this.statsBase.set(Attribute.DEXTERITY, 0);
		this.statsBase.set(Attribute.INTELLIGENCE, 0);
		this.statsBase.set(Attribute.WISDOM, 0);
		this.statsBase.set(Attribute.LUCK, 0);
	}

	public async update(effectsOnly: boolean): Promise<void> {
		if (this.player.inventory == null) {
			return;
		}

		await this.initBaseStats();
		await this.applyCoreStatRatings();

		const sta: JSONObject = this.applyAuraEffects();

		await this.updateStatus();
		this.initDamage();

		sta
			.element("$DEX", this.get$DEX)
			.element("$END", this.get$END)
			.element("$INT", this.get$INT)
			.element("$LCK", this.get$LCK)
			.element("$STR", this.get$STR)
			.element("$WIS", this.get$WIS)

			.element("_DEX", this.get_DEX)
			.element("_END", this.get_END)
			.element("_INT", this.get_INT)
			.element("_LCK", this.get_LCK)
			.element("_STR", this.get_STR)
			.element("_WIS", this.get_WIS);

		if (effectsOnly) {
			this.player.writeObject(
				new JSONObject()
					.element("cmd", "stu")
					.element("sta", sta)
			);
			return;
		}

		const tempState: JSONObject = new JSONObject()
			.accumulateAll(this.player.inventory.statsItems)
			.elementMap("innate", this.statsBase);

		this.player.writeObject(
			new JSONObject()
				.element("cmd", "stu")
				.element("sta", sta)
				.element("tempSta", tempState)
				.element("mDPS", this.magicDamage)
				.element("wDPS", this.physicalDamage),
		);
	}

	public get get$DEX(): number {
		return this.player.inventory.stat(Attribute.DEXTERITY);
	}

	public get get$END(): number {
		return this.player.inventory.stat(Attribute.ENDURANCE);
	}

	public get get$INT(): number {
		return this.player.inventory.stat(Attribute.INTELLIGENCE);
	}

	public get get$LCK(): number {
		return this.player.inventory.stat(Attribute.LUCK);
	}

	public get get$STR(): number {
		return this.player.inventory.stat(Attribute.STRENGTH);
	}

	public get get$WIS(): number {
		return this.player.inventory.stat(Attribute.WISDOM);
	}

	public get get_DEX(): number {
		return this.statsBase.get(Attribute.DEXTERITY)!;
	}

	public get get_END(): number {
		return this.statsBase.get(Attribute.ENDURANCE)!;
	}

	public get get_INT(): number {
		return this.statsBase.get(Attribute.INTELLIGENCE)!;
	}

	public get get_LCK(): number {
		return this.statsBase.get(Attribute.LUCK)!;
	}

	public get get_STR(): number {
		return this.statsBase.get(Attribute.STRENGTH)!;
	}

	public get get_WIS(): number {
		return this.statsBase.get(Attribute.WISDOM)!;
	}

	private initDamage(): void {
		const skillAutoAttack: ISkill | undefined = this.player.combat.skillAutoAttack;

		const autoAttackDamage: number = skillAutoAttack ? Number(skillAutoAttack.damage) : 1;

		const physicalDPS: number = this.physicalDamage << 1;
		const magicDPS: number = this.magicDamage << 1;

		const equippedWeapon: IUserInventory | undefined = this.player.inventory.equippedWeapon;

		const wepRng: number = equippedWeapon ? equippedWeapon.item!.range : 10;

		const totalPhysicalDamage: number = physicalDPS * autoAttackDamage;
		const totalMagicDamage: number = magicDPS * autoAttackDamage;

		const weaponRangePercentage: number = wepRng / 100;

		this.minimumPhysicalDamage = Math.floor(totalPhysicalDamage - totalPhysicalDamage * weaponRangePercentage);
		this.maximumPhysicalDamage = Math.ceil(totalPhysicalDamage + totalPhysicalDamage * weaponRangePercentage);

		this.minimumMagicDamage = Math.floor(totalMagicDamage - totalMagicDamage * weaponRangePercentage);
		this.maximumMagicDamage = Math.ceil(totalMagicDamage + totalMagicDamage * weaponRangePercentage);
	}

	private async updateStatus(): Promise<void> {
		const END: number = this.get$END + this.get_END;
		const WIS: number = this.get$WIS + this.get_WIS;

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

		const classCategory: CombatCategory = equippedClass ? <CombatCategory>equippedClass.item!.class!.category : CombatCategory.M1;

		const { level: wLvl, damagePerSecond } = equippedWeapon ? (equippedWeapon.item!.isTemporary ? equippedWeapon.item!.enhancement! : equippedWeapon.enhancement!) : { level: 0, damagePerSecond: 0 };

		const iDPS: number = damagePerSecond / 100;

		const intAPtoDPS: number = CoreValues.getValue("intAPtoDPS");
		const intSPtoDPS: number = CoreValues.getValue("intSPtoDPS");

		const PCDPSMod: number = CoreValues.getValue("PCDPSMod");
		const hpTgt: number = CoreValues.getBaseHPByLevel(playerLevel);
		const TTD: number = 20;
		const tDPS: number = (hpTgt / 20) * 0.7;
		const sp1pc: number = (2.25 * tDPS) / (100 / intAPtoDPS) / 2;

		this.resetValues();

		for (let [attribute, value] of this.statsBase) {
			this.applyStats(classCategory, sp1pc, attribute, value + this.player.inventory.stat(attribute));
		}

		this.physicalDamage = Math.round((CoreValues.getBaseHPByLevel(wLvl) / TTD) * iDPS * PCDPSMod) + Math.round(this.$ap / intAPtoDPS);
		this.magicDamage = Math.round((CoreValues.getBaseHPByLevel(wLvl) / TTD) * iDPS * PCDPSMod + Math.round(this.$sp / intSPtoDPS));
	}


}
