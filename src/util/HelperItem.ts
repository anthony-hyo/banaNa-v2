import JSONObject from "./json/JSONObject.ts";
import type IUserInventory from "../database/interfaces/IUserInventory.ts";
import {differenceInHours} from "date-fns";

export default class HelperItem {

	public static inventory(inventory: IUserInventory): JSONObject {
		return new JSONObject()
			.element("bEquip", inventory.isEquipped)
			.element("bStaff", inventory.item!.isStaffOnly)
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
			.element("bCoins", inventory.item!.isCoins)
			.element("bTemp", inventory.item!.isTemporary)
			.element("bHouse", inventory.item!.typeItem!.equipment == "hi" || inventory.item!.typeItem!.equipment == "ho")
			.element("bPTR", 0)
			.element("sIcon", inventory.item!.icon)
			.element("bUpg", inventory.item!.isUpgradeOnly)
			.element("CharItemID", inventory.item!.requiredClassItemId ?? 0)
			.element("bBank", inventory.isOnBank)
			.element("sName", inventory.item!.name)
			.element("iQSValue", inventory.item!.questStringValue)
			.element("sDesc", inventory.item!.description)
			.element("sES", inventory.item!.typeItem!.equipment)
			.element("iLvl", inventory.item!.level)
			.element("iStk", inventory.item!.stack)
			.element("iHrs", differenceInHours(new Date(), inventory.dateCreated));
	}

}