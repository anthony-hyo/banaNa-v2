import JSONArray from "../../../util/json/JSONArray.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import type AvatarTarget from "../AvatarTarget.ts";

export default class Sarsa {

	private readonly sarsa: JSONArray;

	constructor(fromTarget: AvatarTarget, damageResults: JSONArray, actionID: number) {
		this.sarsa = new JSONArray()
			.add(
				new JSONObject()
					.element("a", damageResults)
					.element("actID", actionID)
					.element("cInf", fromTarget.toString)
					.element("iRes", 1)
			);
	}

	public get data(): JSONArray {
		return this.sarsa;
	}

}
