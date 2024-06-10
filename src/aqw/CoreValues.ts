import {EQUIPMENT_CAPE, EQUIPMENT_CLASS, EQUIPMENT_HELM, EQUIPMENT_WEAPON} from "../util/Const.ts";
import database from "../database/drizzle/database.ts";
import type ISettingCoreValue from "../database/interfaces/ISettingCoreValue.ts";
import type IEnhancement from "../database/interfaces/IEnhancement.ts";
import JSONObject from "../util/json/JSONObject.ts";
import TypeStatPrimary from "../avatar/helper/combat/skill/TypeStatPrimary.ts";
import type AvatarStats from "../avatar/data/AvatarStats.ts";
import type {CategoryStats} from "./category/CategoryStats.ts";
import {Category} from "./category/Category.ts";

export default class CoreValues {

	private static CORE_VALUES: Map<string, number> = new Map<string, number>();
	private static EQUIPMENT_RATIO: Map<string, number> = new Map<string, number>();

	static {
		database.query.settingsCoreValues
			.findMany()
			.then((settingsLogin: ISettingCoreValue[]) => settingsLogin.forEach((settingLogin: ISettingCoreValue) => this.CORE_VALUES.set(settingLogin.name, Number(settingLogin.value))));

		this.EQUIPMENT_RATIO.set(EQUIPMENT_HELM, 0.25);
		this.EQUIPMENT_RATIO.set(EQUIPMENT_CLASS, 0.25);
		this.EQUIPMENT_RATIO.set(EQUIPMENT_CAPE, 0.2);
		this.EQUIPMENT_RATIO.set(EQUIPMENT_WEAPON, 0.33);
	}

	public static getExpToLevel(level: number): number {
		return 1000;
	}

	public static getManaByLevelDatabase(level: number): number {
		return 500;
	}

	public static getManaByLevel(level: number): number {
		const base: number = CoreValues.getValue("PCmpBase1");
		const delta: number = CoreValues.getValue("PCmpBase100");
		const curve: number = CoreValues.getValue("curveExponent") + (base / delta);

		return CoreValues.getBaseValueByLevel(base, delta, curve, level);
	}

	public static getHealthByLevelDatabase(level: number): number {
		return 500;
	}

	public static getHealthByLevel(level: number): number {
		const base: number = CoreValues.getValue("PChpGoal1");
		const delta: number = CoreValues.getValue("PChpGoal100");
		const curve: number = 1.5 + base / delta;

		return CoreValues.getBaseValueByLevel(base, delta, curve, level);
	}

	public static getBaseHPByLevel(level: number): number {
		const base: number = CoreValues.getValue("PChpBase1");
		const curve: number = CoreValues.getValue("curveExponent");
		const delta: number = CoreValues.getValue("PChpDelta");

		return CoreValues.getBaseValueByLevel(base, delta, curve, level);
	}

	public static getIBudget(itemLevel: number, iRty: number): number {
		const GstBase: number = CoreValues.getValue("GstBase");
		const GstGoal: number = CoreValues.getValue("GstGoal");
		const statsExponent: number = CoreValues.getValue("statsExponent");
		const rarity: number = Math.max(iRty, 1);
		const level: number = itemLevel + rarity - 1;
		const delta: number = GstGoal - GstBase;

		return Math.round(CoreValues.getBaseValueByLevel(GstBase, delta, statsExponent, level));
	}

	public static getInnateStats(userLevel: number): number {
		const PCstBase: number = CoreValues.getValue("PCstBase");
		const PCstGoal: number = CoreValues.getValue("PCstGoal");
		const statsExponent: number = CoreValues.getValue("statsExponent");
		const delta: number = PCstGoal - PCstBase;

		return Math.round(CoreValues.getBaseValueByLevel(PCstBase, delta, statsExponent, userLevel));
	}

	public static getBaseValueByLevel(base: number, delta: number, curve: number, userLevel: number): number {
		const levelCap: number = CoreValues.getValue("intLevelCap");
		const level: number = userLevel < 1 ? 1 : Math.min(userLevel, levelCap);
		const x: number = (level - 1) / (levelCap - 1);

		return base + Math.pow(x, curve) * delta;
	}

	public static getValue(property: string): number {
		const value: number | undefined = CoreValues.CORE_VALUES.get(property);

		if (value === undefined) {
			throw new Error(`Core property '${property}' is undefined.`);
		}

		return value;
	}

	public static setInitInnateStats(avatarStats: AvatarStats, level: number, category: string): void {
		const innateStat: number = CoreValues.getInnateStats(level);

		const categoryStats: CategoryStats = Category.categoryStats(category);

		avatarStats._str = Math.round(categoryStats.strength * innateStat);
		avatarStats._end = Math.round(categoryStats.endurance * innateStat);
		avatarStats._dex = Math.round(categoryStats.dexterity * innateStat);
		avatarStats._int = Math.round(categoryStats.intelligence * innateStat);
		avatarStats._wis = Math.round(categoryStats.wisdom * innateStat);
		avatarStats._lck = Math.round(categoryStats.luck * innateStat);
	}

	public static getItemStats(enhancement: IEnhancement, equipment: string): Map<TypeStatPrimary, number> {
		const itemStats: Map<TypeStatPrimary, number> = new Map<TypeStatPrimary, number>([
			[TypeStatPrimary.ENDURANCE, 0],
			[TypeStatPrimary.STRENGTH, 0],
			[TypeStatPrimary.INTELLIGENCE, 0],
			[TypeStatPrimary.DEXTERITY, 0],
			[TypeStatPrimary.WISDOM, 0],
			[TypeStatPrimary.LUCK, 0]
		]);

		const iBudget: number = Math.round(this.getIBudget(enhancement.level, enhancement.rarity) * CoreValues.EQUIPMENT_RATIO.get(equipment)!);

		const statPattern: Map<TypeStatPrimary, number> = new Map<TypeStatPrimary, number>([
			[TypeStatPrimary.WISDOM, enhancement.pattern!.wisdom],
			[TypeStatPrimary.ENDURANCE, enhancement.pattern!.endurance],
			[TypeStatPrimary.LUCK, enhancement.pattern!.luck],
			[TypeStatPrimary.STRENGTH, enhancement.pattern!.strength],
			[TypeStatPrimary.DEXTERITY, enhancement.pattern!.dexterity],
			[TypeStatPrimary.INTELLIGENCE, enhancement.pattern!.intelligence]
		]);

		const keyEntry: Array<TypeStatPrimary> = Array.from(itemStats.keys());

		let valTotal: number = 0;

		for (const key of keyEntry) {
			const stat: number = Math.round(iBudget * statPattern.get(key)! / 100);
			itemStats.set(key, stat);
			valTotal += stat;
		}

		const keyArray: Array<TypeStatPrimary> = keyEntry.slice();

		let i: number = 0;
		while (valTotal < iBudget) {
			const key: TypeStatPrimary = keyArray[i];

			itemStats.set(key, Math.round(itemStats.get(key)! + 1));

			valTotal++;

			i++;
			if (i > keyArray.length - 1) {
				i = 0;
			}
		}

		return itemStats;
	}

	public static getData(): JSONObject {
		const map: JSONObject = new JSONObject();

		for (let [key, value] of CoreValues.CORE_VALUES.entries()) {
			map.element(key, value);
		}

		return map;
	}

}
