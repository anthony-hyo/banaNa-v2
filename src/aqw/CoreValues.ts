import {EQUIPMENT_CAPE, EQUIPMENT_CLASS, EQUIPMENT_HELM, EQUIPMENT_WEAPON} from "../util/Const.ts";
import database from "../database/drizzle/database.ts";
import type SettingCoreValue from "../database/interfaces/SettingCoreValue.ts";
import Stats from "../world/stats/Stats.ts";
import type Enhancement from "../database/interfaces/Enhancement.ts";
import JSONObject from "../util/json/JSONObject.ts";

export class CoreValues {

    private static CORE_VALUES: Map<string, number> = new Map<string, number>();
    private static EQUIPMENT_RATIO: Map<string, number> = new Map<string, number>();

    static {
        database.query.settingsCoreValues
            .findMany()
            .then((settingsLogin: SettingCoreValue[]) => settingsLogin.forEach((settingLogin: SettingCoreValue) => this.CORE_VALUES.set(settingLogin.name, Number(settingLogin.value))))

        this.EQUIPMENT_RATIO.set(EQUIPMENT_HELM, 0.25);
        this.EQUIPMENT_RATIO.set(EQUIPMENT_CLASS, 0.25);
        this.EQUIPMENT_RATIO.set(EQUIPMENT_CAPE, 0.2);
        this.EQUIPMENT_RATIO.set(EQUIPMENT_WEAPON, 0.33);
    }

    public static getExpToLevel(level: number): number {
        return 1000;
    }

    public static getManaByLevel(level: number): number {
        return 500;
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
        return CoreValues.CORE_VALUES.get(property)!;
    }

    public static setInitInnateStats(level: number, category: string, innate: Map<string, number>): void {
        const innateStat: number = CoreValues.getInnateStats(level);
        const ratios: number[] = Stats.classCatMap.get(category)!;

        const keyEntry: IterableIterator<string> = innate.keys();

        let i: number = 0;

        for (let key of keyEntry) {
            const stat: number = Math.round(ratios[i] * innateStat);
            innate.set(key, stat);
            i++;
        }
    }

    public static getItemStats(enhancement: Enhancement, equipment: string): Map<string, number> {
        const itemStats: Map<string, number> = new Map<string, number>([
            ["END", 0],
            ["STR", 0],
            ["INT", 0],
            ["DEX", 0],
            ["WIS", 0],
            ["LCK", 0]
        ]);

        const iBudget: number = Math.round(this.getIBudget(enhancement.level, enhancement.rarity) * CoreValues.EQUIPMENT_RATIO.get(equipment)!);

        const statPattern: Map<string, number> = new Map<string, number>([
            ['WIS', enhancement.pattern.wisdom],
            ['END', enhancement.pattern.endurance],
            ['LCK', enhancement.pattern.luck],
            ['STR', enhancement.pattern.strength],
            ['DEX', enhancement.pattern.dexterity],
            ['INT', enhancement.pattern.intelligence]
        ]);

        const keyEntry: string[] = Array.from(itemStats.keys());

        let valTotal: number = 0;

        for (const key of keyEntry) {
            const stat: number = Math.round(iBudget * statPattern.get(key)! / 100);
            itemStats.set(key, stat);
            valTotal += stat;
        }

        const keyArray: string[] = keyEntry.slice();

        let i: number = 0;
        while (valTotal < iBudget) {
            const key: string = keyArray[i];
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
            map.put(key, value);
        }

        return map;
    }

}
