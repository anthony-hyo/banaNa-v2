import type Player from "../Player.ts";
import type IUserInventory from "../../../database/interfaces/IUserInventory.ts";
import Equipment from "../../../util/Equipment.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import JSONArray from "../../../util/json/JSONArray.ts";
import {Rank} from "../../../aqw/Rank.ts";
import SkillReference from "../../../util/SkillReference.ts";
import database from "../../../database/drizzle/database.ts";
import {and, eq, sql} from "drizzle-orm";
import {usersInventory} from "../../../database/drizzle/schema.ts";

export default class PlayerInventory {

	private static readonly potion: JSONObject = new JSONObject()
		.element("anim", "Cheer")
		.element("cd", "" + 60000)
		.element("desc", "Equip a potion or scroll from your inventory to use it here.")
		.element("fx", "")
		.element("icon", "icu1")
		.element("isOK", 1)
		.element("mp", "" + 0)
		.element("nam", "Potions")
		.element("range", 808)
		.element("ref", "i1")
		.element("str1", "")
		.element("tgt", "f")
		.element("typ", "i");

	private static readonly emptyAuras: JSONArray = new JSONArray()
		.add(new JSONObject());

	public readonly equipped: Map<Equipment, IUserInventory> = new Map<Equipment, IUserInventory>();

	public readonly temporary: Map<number, number> = new Map<number, number>();

	constructor(
		private readonly player: Player
	) {
	}

	public get equippedClass(): IUserInventory | undefined {
		return this.equipped.get(Equipment.CLASS);
	}

	public get equippedArmor(): IUserInventory | undefined {
		return this.equipped.get(Equipment.ARMOR);
	}

	public get equippedPet(): IUserInventory | undefined {
		return this.equipped.get(Equipment.PET);
	}

	public get equippedHelm(): IUserInventory | undefined {
		return this.equipped.get(Equipment.HELM);
	}

	public get equippedCape(): IUserInventory | undefined {
		return this.equipped.get(Equipment.CAPE);
	}

	public get equippedWeapon(): IUserInventory | undefined {
		return this.equipped.get(Equipment.WEAPON);
	}

	public get equippedAmulet(): IUserInventory | undefined {
		return this.equipped.get(Equipment.AMULET);
	}

	public get equippedHouse(): IUserInventory | undefined {
		return this.equipped.get(Equipment.HOUSE);
	}

	public get equippedHouseItem(): IUserInventory | undefined {
		return this.equipped.get(Equipment.HOUSE_ITEM);
	}

	public async getBankCount(): Promise<number> {
		const usersItemBankCount: {
			count: number
		}[] = await database
			.select({
				count: sql`COUNT(*)`.mapWith(Number)
			})
			.from(usersInventory)
			.where(
				and(
					eq(usersInventory.userId, this.databaseId),
					eq(usersInventory.isOnBank, true)
				)
			);

		return usersItemBankCount[0].count;
	}

	public equip(userItem: IUserInventory, b: boolean) {

	}

	public dropItem(itemId: number): void;

	public dropItem(itemId: number, quantity: number): void;

	public dropItem(itemId: number, quantity?: number): void {
		//TODO: ..
	}

	public turnInItem(itemId: number, quantity: number): boolean {
		const items: Map<number, number> = new Map<number, number>();
		//TODO: ..
		return this.turnInItems(items);
	}

	public turnInItems(items: Map<number, number>): boolean {
		//TODO: ..
		return false;
	}

	public addTemporaryItem(itemId: number, quantity: number): void {
		const temporaryQuantity: number | undefined = this.temporary.get(itemId);

		if (temporaryQuantity) {
			this.temporary.set(itemId, temporaryQuantity + quantity);
			return;
		}

		this.temporary.set(itemId, quantity);
	}

	public updateClass(): void {
		const equippedClass: IUserInventory | undefined = this.equippedClass;

		if (!equippedClass) {
			this.player.kick();
			return;
		}

		const updateClass: JSONObject = new JSONObject()
			.element("cmd", "updateClass")
			.element("iCP", equippedClass.quantity)
			.element("sClassCat", equippedClass.item!.class!.category)
			.element("sClassName", equippedClass.item!.name)
			.element("uid", this.player.network.id);

		this.player.room!.writeObjectExcept(this.player, updateClass);

		updateClass
			.element("sDesc", equippedClass.item!.class!.description)
			.element("sStats", equippedClass.item!.class!.statsDescription);

		if (equippedClass.item!.class!.manaRegenerationMethods.includes(":")) {
			const aMRM: JSONArray = new JSONArray();

			for (const s of equippedClass.item!.class!.manaRegenerationMethods.split(",")) {
				aMRM.add(s + "\r");
			}

			updateClass.element("aMRM", aMRM);
		} else {
			updateClass.element("aMRM", equippedClass.item!.class!.manaRegenerationMethods);
		}

		this.player.network.writeObject(updateClass);

		this.loadSkills();
	}

	public loadSkills(): void {
		const equippedClass: IUserInventory | undefined = this.equippedClass;

		if (!equippedClass) {
			this.player.kick();
			return;
		}

		const rank: number = Rank.getRankFromPoints(equippedClass.quantity);

		const active: JSONArray = new JSONArray();
		const passive: JSONArray = new JSONArray();

		const auras: JSONArray = new JSONArray();

		for (const skill of equippedClass.item!.class!.skills) {
			const jsonObject: JSONObject = new JSONObject()
				.element("auras", PlayerInventory.emptyAuras)
				.element("desc", skill.description)
				.element("fx", skill.type)
				.element("icon", skill.icon)
				.element("id", skill.id)
				.element("nam", skill.name)
				.element("range", skill.range)
				.element("ref", skill.reference)
				.element("tgt", skill.target)
				.element("typ", skill.type);

			switch (skill.type) {
				case "passive":
					const isOK: boolean = rank >= 4;

					passive.add(
						jsonObject
							.element("isOK", isOK)
					);

					if (isOK) {
						const aurasEffects: JSONArray = new JSONArray();

						for (const aura of skill.auras!) {
							for (const effect of aura.effects) {
								aurasEffects.add(
									new JSONObject()
										.element("id", effect.id)
										.element("sta", effect.typeStat.stat)
										.element("typ", effect.type)
										.element("val", effect.value)
								);
							}
						}

						auras.add(
							new JSONObject()
								.element("nam", skill.name)
								.element("e", aurasEffects)
						);
					}
					break;
				default:
					jsonObject
						.element("anim", skill.animation)
						.element("cd", String(skill.cooldown))
						.element("damage", skill.damage)
						.element("dsrc", '')
						.elementIf(skill.effectName.length != 0, "strl", skill.effectName)
						.element("isOK", true)
						.element("mp", skill.mana)
						.element("tgtMax", skill.hitTargets)
						.element("tgtMin", "1");

					switch (skill.reference) {
						case SkillReference.AUTO_ATTACK:
							active.element(
								0,
								jsonObject
									.element("auto", true)
							);
							break;
						case SkillReference.ATTACK_1:
							active.element(1, jsonObject);
							break;
						case SkillReference.ATTACK_2:
							active.element(
								2,
								jsonObject
									.elementIf(rank < 2, "isOK", false)
							);
							break;
						case SkillReference.ATTACK_3:
							active.element(
								3,
								jsonObject
									.elementIf(rank < 3, "isOK", false)
							);
							break;
						case SkillReference.ATTACK_4:
							active.element(
								4,
								jsonObject
									.elementIf(rank < 5, "isOK", false)
							);
							break;
					}
					break;
			}
		}

		active.element(5, PlayerInventory.potion);

		if (auras.size > 0) {
			this.player.network.writeObject(
				new JSONObject()
					.element("cmd", "aura+p")
					.element("tInf", `p:${this.player.network.id}`)
					.element("auras", auras)
			);
		}

		//this.clearAuras(user);

		this.player.network.writeObject(
			new JSONObject()
				.element("cmd", "sAct")
				.element(
					"actions",
					new JSONObject()
						.element("active", active)
						.element("passive", passive)
				)
		);
	}

}