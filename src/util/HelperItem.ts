import JSONObject from "./json/JSONObject.ts";
import type IUserInventory from "../database/interfaces/IUserInventory.ts";
import {differenceInHours} from "date-fns";

export default class HelperItem {

	public static inventory(inventory: IUserInventory): JSONObject {
		return new JSONObject()
			.element("bEquip", inventory.is_equipped ? 1 : 0)
			.element("bStaff", inventory.item!.isStaffOnly ? 1 : 0)
			.element("metaValues", inventory.item!.meta || new JSONObject())
			.element("sReqQuests", "")
			.element("iRty", inventory.item!.typeRarityId)
			.element("iCost", inventory.item!.cost)
			.element("iRng", inventory.item!.range)
			.element("sElmt", inventory.item!.typeElement!.name)
			.element("iDPS", inventory.enhancement!.damage_per_second)
			.element("EnhID", inventory.item!.enhancementId)
			//.element("bQuest", 1)
			.element("iQty", inventory.item!.quantity)
			.element("sType", inventory.item!.typeItem!.name)
			.element("sLink", inventory.item!.linkage)
			.element("iQSIndex", inventory.item!.questStringIndex)
			.element("ItemID", inventory.item!.id)
			.element("bCoins", inventory.item!.isCoins ? 1 : 0)
			.element("bTemp", inventory.item!.isTemporary ? 1 : 0)
			.element("bHouse", inventory.item!.typeItem!.equipment == "hi" || inventory.item!.typeItem!.equipment == "ho" ? 1 : 0)
			.element("bPTR", 0)
			.element("sIcon", inventory.item!.icon)
			.element("bUpg", inventory.item!.isUpgradeOnly ? 1 : 0)
			.element("CharItemID", inventory.item!.requiredClassItemId ?? 0)
			.element("bBank", inventory.is_on_bank ? 1 : 0)
			.element("sName", inventory.item!.name)
			.element("iQSValue", inventory.item!.questStringValue)
			.element("sDesc", inventory.item!.description)
			.element("sES", inventory.item!.typeItem!.equipment)
			.element("iLvl", inventory.item!.level)
			.element("iStk", inventory.item!.stack)
			.element("iHrs", differenceInHours(new Date(), inventory.dateCreated));
	}

}