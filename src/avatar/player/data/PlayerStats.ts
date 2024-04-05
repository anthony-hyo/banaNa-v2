import AvatarStats from "../../data/AvatarStats.ts";
import CoreValues from "../../../aqw/CoreValues.ts";
import type Player from "../Player.ts";
import type ISkill from "../../../database/interfaces/ISkill.ts";
import type IEnhancement from "../../../database/interfaces/IEnhancement.ts";
import type IUserInventory from "../../../database/interfaces/IUserInventory.ts";
import database from "../../../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {users} from "../../../database/drizzle/schema.ts";
import UserNotFoundException from "../../../exceptions/UserNotFoundException.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import {AvatarState} from "../../helper/AvatarState.ts";
import logger from "../../../util/Logger.ts";
import {EQUIPMENT_CAPE, EQUIPMENT_CLASS, EQUIPMENT_HELM, EQUIPMENT_WEAPON} from "../../../util/Const.ts";
import type Equipment from "../../../util/Equipment.ts";

export default class PlayerStats extends AvatarStats {

	constructor(
		private readonly player: Player
	) {
		super(player);
	}

	public updateStats(equipment: Equipment, enhancement: IEnhancement): void {
		const itemStats: Map<string, number> = CoreValues.getItemStats(enhancement, equipment);

		switch (equipment) {
			case EQUIPMENT_CLASS:
				for (const [key, value] of itemStats) {
					this.armor.set(key, value);
				}
				break;
			case EQUIPMENT_WEAPON:
				for (const [key, value] of itemStats) {
					this.weapon.set(key, value);
				}
				break;
			case EQUIPMENT_CAPE:
				for (const [key, value] of itemStats) {
					this.cape.set(key, value);
				}
				break;
			case EQUIPMENT_HELM:
				for (const [key, value] of itemStats) {
					this.helm.set(key, value);
				}
				break;
			default:
				throw new Error("equipment " + equipment + " cannot have stat values!");
		}
	}

	public async sendStats(levelUp: boolean): Promise<void> {
		const { level } = await database.query.users.findFirst({
			columns: {
				level: true
			},
			where: eq(users.id, this.player.databaseId)
		}) || {};

		if (!level) {
			throw new UserNotFoundException("The user could not be found in the database.");
		}

		await this.update();

		const END: number = this.get$END + this.get_END;
		const WIS: number = this.get$WIS + this.get_WIS;

		const intHPperEND: number = CoreValues.getValue("intHPperEND");
		const intMPperWIS: number = CoreValues.getValue("intMPperWIS");

		// Calculate new HP and MP
		const userHp: number = CoreValues.getHealthByLevelDatabase(level) + END * intHPperEND;
		const userMp: number = CoreValues.getManaByLevelDatabase(level) + WIS * intMPperWIS;

		logger.silly(userHp);
		logger.silly(END);
		logger.silly(intHPperEND);

		// Max
		this.player.status.health.max = userHp;
		this.player.status.mana.max = userMp;

		// Current
		if (this.player.status.state === AvatarState.NEUTRAL || levelUp) {
			this.player.status.health.update = userHp;
		}

		if (this.player.status.state === AvatarState.NEUTRAL || levelUp) {
			this.player.status.mana.update = userMp;
		}

		await this.player.sendUotls(true, true, true, true, levelUp, false);

		const ba: JSONObject = new JSONObject();
		const he: JSONObject = new JSONObject();
		const Weapon: JSONObject = new JSONObject();
		const ar: JSONObject = new JSONObject();

		for (const [key, value] of this.armor.entries()) {
			if (value > 0) {
				ar.element(key, Math.floor(value));
			}
		}

		for (const [key, value] of this.helm.entries()) {
			if (value > 0) {
				he.element(key, Math.floor(value));
			}
		}

		for (const [key, value] of this.weapon.entries()) {
			if (value > 0) {
				Weapon.element(key, Math.floor(value));
			}
		}

		for (const [key, value] of this.cape.entries()) {
			if (value > 0) {
				ba.element(key, Math.floor(value));
			}
		}

		/*const tempSta: JSONObject = new JSONObject()
			.element("Weapon", new JSONObject()
				.element("DEX", 44)
				.element("END", 44)
				.element("STR", 44)
			)
			.element("ar", new JSONObject()
				.element("END", 44)
				.element("INT", 44)
				.element("LCK", 44)
				.element("WIS", 44)
			)
			.element("ba", new JSONObject())
			.element("he", new JSONObject()
				.element("DEX", 4)
				.element("END", 4)
				.element("STR", 44)
			);*/

		this.player.writeObject(
			new JSONObject()
				.element(
					"tempSta",
					new JSONObject()
						.elementIf(!ba.isEmpty, "ba", ba)
						.elementIf(!ar.isEmpty, "ar", ar)
						.elementIf(!Weapon.isEmpty, "Weapon", Weapon)
						.elementIf(!he.isEmpty, "he", he)
						.element(
							"innate",
							new JSONObject()
								.element("INT", this.innate.get("INT")!)
								.element("STR", this.innate.get("STR")!)
								.element("DEX", this.innate.get("DEX")!)
								.element("END", this.innate.get("END")!)
								.element("LCK", this.innate.get("LCK")!)
								.element("WIS", this.innate.get("WIS")!)
						)
				)
				.element("cmd", "stu")
				.element("sta",
					new JSONObject() //innate
						.element("$DEX", this.get$DEX)
						.element("$END", this.get$END)
						.element("$INT", this.get$INT)
						.element("$LCK", this.get$LCK)
						.element("$STR", this.get$STR)
						.element("$WIS", this.get$WIS)
						.element("$ap", this.get$ap)
						.element("$cai", this.get$cai)
						.element("$cao", this.get$cao)
						.element("$cdi", this.get$cdi)
						.element("$cdo", this.get$cdo)
						.element("$chi", this.get$chi)
						.element("$cho", this.get$cho)
						.element("$cmc", this.get$cmc)
						.element("$cmi", this.get$cmi)
						.element("$cmo", this.get$cmo)
						.element("$cpi", this.get$cpi)
						.element("$cpo", this.get$cpo)
						.element("$dsh", this.get$dsh)
						.element("$scm", this.get$scm)
						.element("$shb", this.get$shb)
						.element("$smb", this.get$smb)
						.element("$sp", this.get$sp)
						.element("$tcr", this.get$tcr)
						.element("$tdo", this.get$tdo)
						.element("$tha", this.get$tha)
						.element("$thi", this.get$thi)
						.element("_DEX", this.get_DEX)
						.element("_END", this.get_END)
						.element("_INT", this.get_INT)
						.element("_LCK", this.get_LCK)
						.element("_STR", this.get_STR)
						.element("_WIS", this.get_WIS)
				)
				.element("mDPS", this.magicDamage)
				.element("wDPS", this.physicalDamage),
		);
	}

	public override async initInnateStats(): Promise<void> {
		const equippedClass: IUserInventory | undefined = this.player.inventory.equippedClass;

		if (!equippedClass) {
			throw new Error("Equipped class is undefined");
		}

		const { level } = await database.query.users.findFirst({
			columns: {
				level: true
			},
			where: eq(users.id, this.player.databaseId)
		}) || {};

		if (!level) {
			throw new UserNotFoundException("The user could not be found in the database.");
		}

		const cat: string = equippedClass.item!.class!.category;

		const innateStat: number = CoreValues.getInnateStats(level);
		const ratios: number[] = <number[]>AvatarStats.classCatMap.get(cat);

		const keyEntry: IterableIterator<string> = this.innate.keys();

		let i: number = 0;

		for (const key of keyEntry) {
			let stat: number = Math.round(ratios[i] * innateStat);
			this.innate.set(key, stat);
			i++;
		}
	}

	public override initDamage(): void {
		const autoAttack: ISkill | undefined = this.player.combat.skillAutoAttack;

		if (!autoAttack) {
			throw new Error("Not allowed to have class without auto attack");
		}

		const equippedWeapon: IUserInventory | undefined = this.player.inventory.equippedWeapon;

		if (!equippedWeapon) {
			throw new Error("Equipped weapon is undefined");
		}

		const aaDamage: number = Number(autoAttack.damage);

		const wSPD: number = 2;

		const wDMG: number = this.physicalDamage * wSPD;
		const mDMG: number = this.magicDamage * wSPD;

		const wepRng: number = equippedWeapon.item!.range;

		const iRNG: number = wepRng / 100;

		const tADMG: number = wDMG * aaDamage;
		const tMDMG: number = mDMG * aaDamage;

		this._minimumPhysicalDamage = Math.floor(tADMG - tADMG * iRNG);
		this._maximumPhysicalDamage = Math.ceil(tADMG + tADMG * iRNG);

		this._minimumMagicDamage = Math.floor(tMDMG - tMDMG * iRNG);
		this._maximumMagicDamage = Math.ceil(tMDMG + tMDMG * iRNG);
	}

	public override async applyCoreStatRatings(): Promise<void> {
		const equippedClass: IUserInventory | undefined = this.player.inventory.equippedClass;

		if (!equippedClass) {
			throw new Error("Equipped class is undefined");
		}

		const equippedWeapon: IUserInventory | undefined = this.player.inventory.equippedWeapon;

		if (!equippedWeapon) {
			throw new Error("Equipped weapon is undefined");
		}

		const { level } = await database.query.users.findFirst({
			columns: {
				level: true
			},
			where: eq(users.id, this.player.databaseId)
		}) || {};

		if (!level) {
			throw new UserNotFoundException("The user could not be found in the database.");
		}

		const cat: string = equippedClass.item!.class!.category;
		const enhancement: IEnhancement = equippedWeapon.enhancement!;

		const wLvl: number = enhancement ? enhancement.level : 1;

		const iDPS: number = (enhancement && enhancement.damage_per_second !== 0 ? enhancement.damage_per_second : 100) / 100;

		const intAPtoDPS: number = CoreValues.getValue("intAPtoDPS");
		const intSPtoDPS: number = CoreValues.getValue("intSPtoDPS");

		const PCDPSMod: number = CoreValues.getValue("PCDPSMod");

		const hpTgt: number = CoreValues.getBaseHPByLevel(level);
		const TTD: number = 20;
		const tDPS: number = (hpTgt / 20) * 0.7;
		const sp1pc: number = (2.25 * tDPS) / (100 / intAPtoDPS) / 2;

		this.resetValues();

		this.applyStats(sp1pc, cat);

		this.physicalDamage = Math.round((CoreValues.getBaseHPByLevel(wLvl) / TTD) * iDPS * PCDPSMod + Math.round(this.attackPower / intAPtoDPS));
		this.magicDamage = Math.round((CoreValues.getBaseHPByLevel(wLvl) / TTD) * iDPS * PCDPSMod + Math.round(this.magicPower / intSPtoDPS));
	}

}